package handlers

import (
	"context"
	"time"

	"backend/database"
	"backend/models"

	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type VoucherHandler struct{}

func (h *VoucherHandler) ListAvailableVouchers(c fiber.Ctx) error {
	collection := database.GetCollection("vouchers")
	now := time.Now()

	filter := bson.M{
		"is_active":        true,
		"claim_start_time": bson.M{"$lte": now},
		"claim_end_time":   bson.M{"$gte": now},
	}

	// Conditions list for $and
	var conditions []bson.M

	// 1. Quota condition
	conditions = append(conditions, bson.M{"$or": []bson.M{
		{"total_quota": -1}, // Unlimited
		{"$expr": bson.M{"$lt": []interface{}{"$claimed_count", "$total_quota"}}},
	}})

	// 2. Search condition
	search := c.Query("search")
	if search != "" {
		conditions = append(conditions, bson.M{"$or": []bson.M{
			{"title": bson.M{"$regex": search, "$options": "i"}},
			{"shop_name": bson.M{"$regex": search, "$options": "i"}},
		}})
	}

	if len(conditions) > 0 {
		filter["$and"] = conditions
	}

	cursor, err := collection.Find(context.Background(), filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch vouchers"})
	}
	defer cursor.Close(context.Background())

	var vouchers []models.Voucher = make([]models.Voucher, 0)
	if err := cursor.All(context.Background(), &vouchers); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to decode vouchers"})
	}

	return c.JSON(vouchers)
}

func (h *VoucherHandler) ClaimVoucher(c fiber.Ctx) error {
	voucherIDHex := c.Params("id")
	voucherID, err := bson.ObjectIDFromHex(voucherIDHex)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid voucher ID"})
	}

	userID := c.Locals("user_id").(bson.ObjectID)
	now := time.Now()

	// 1. Check if already claimed
	uvCollection := database.GetCollection("user_vouchers")
	var existing models.UserVoucher
	err = uvCollection.FindOne(context.Background(), bson.M{
		"user_id":    userID,
		"voucher_id": voucherID,
	}).Decode(&existing)
	if err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "You have already claimed this voucher"})
	}

	// 2. Transactional claim (Update quota and check conditions)
	vCollection := database.GetCollection("vouchers")
	
	// Atomic update with conditions
	filter := bson.M{
		"_id":              voucherID,
		"is_active":        true,
		"claim_start_time": bson.M{"$lte": now},
		"claim_end_time":   bson.M{"$gte": now},
		"$or": []bson.M{
			{"total_quota": -1}, // Unlimited
			{"$expr": bson.M{"$lt": []interface{}{"$claimed_count", "$total_quota"}}},
		},
	}
	update := bson.M{"$inc": bson.M{"claimed_count": 1}}
	
	var voucher models.Voucher
	err = vCollection.FindOneAndUpdate(context.Background(), filter, update, options.FindOneAndUpdate().SetReturnDocument(options.After)).Decode(&voucher)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Voucher is not available or quota is full"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Claim failed"})
	}

	// 3. Create UserVoucher record
	userVoucher := models.UserVoucher{
		ID:        bson.NewObjectID(),
		UserID:    userID,
		VoucherID: voucherID,
		Status:    "AVAILABLE",
		ClaimedAt: now,
	}

	_, err = uvCollection.InsertOne(context.Background(), userVoucher)
	if err != nil {
		// Rollback claimed_count if failed (in a real app, use MongoDB transactions)
		vCollection.UpdateOne(context.Background(), bson.M{"_id": voucherID}, bson.M{"$inc": bson.M{"claimed_count": -1}})
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save claimed voucher"})
	}

	return c.JSON(fiber.Map{
		"message": "Voucher claimed successfully!",
		"voucher": voucher,
	})
}

func (h *VoucherHandler) ListMyVouchers(c fiber.Ctx) error {
	userID := c.Locals("user_id").(bson.ObjectID)
	uvCollection := database.GetCollection("user_vouchers")

	// Aggregate to join with vouchers collection
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"user_id": userID}}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "vouchers",
			"localField":   "voucher_id",
			"foreignField": "_id",
			"as":           "voucher_details",
		}}},
		{{Key: "$unwind", Value: "$voucher_details"}},
		{{Key: "$sort", Value: bson.M{"voucher_details.valid_until": 1}}}, // Sort by expiry
	}

	cursor, err := uvCollection.Aggregate(context.Background(), pipeline)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch your vouchers"})
	}
	defer cursor.Close(context.Background())

	var results []bson.M = make([]bson.M, 0)
	if err := cursor.All(context.Background(), &results); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to decode vouchers"})
	}

	return c.JSON(results)
}

func (h *VoucherHandler) UseVoucher(c fiber.Ctx) error {
	uvIDHex := c.Params("id")
	uvID, err := bson.ObjectIDFromHex(uvIDHex)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user voucher ID"})
	}

	userID := c.Locals("user_id").(bson.ObjectID)
	uvCollection := database.GetCollection("user_vouchers")

	now := time.Now()
	filter := bson.M{
		"_id":     uvID,
		"user_id": userID,
		"status":  "AVAILABLE",
	}
	update := bson.M{
		"$set": bson.M{
			"status":  "USED",
			"used_at": now,
		},
	}

	result, err := uvCollection.UpdateOne(context.Background(), filter, update)
	if err != nil || result.MatchedCount == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Voucher not found or already used/expired"})
	}

	return c.JSON(fiber.Map{"message": "Voucher used successfully!"})
}
