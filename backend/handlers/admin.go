package handlers

import (
	"context"
	"time"

	"backend/database"
	"backend/models"

	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type AdminHandler struct{}

func (h *AdminHandler) CreateVoucher(c fiber.Ctx) error {
	var voucher models.Voucher
	if err := c.Bind().JSON(&voucher); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	adminID := c.Locals("user_id").(bson.ObjectID)
	voucher.ID = bson.NewObjectID()
	voucher.CreatedBy = adminID
	voucher.CreatedAt = time.Now()
	voucher.UpdatedAt = time.Now()
	voucher.ClaimedCount = 0

	collection := database.GetCollection("vouchers")
	_, err := collection.InsertOne(context.Background(), voucher)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create voucher"})
	}

	return c.Status(fiber.StatusCreated).JSON(voucher)
}

func (h *AdminHandler) ListAllVouchers(c fiber.Ctx) error {
	collection := database.GetCollection("vouchers")
	cursor, err := collection.Find(context.Background(), bson.M{})
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

func (h *AdminHandler) GetStats(c fiber.Ctx) error {
	vColl := database.GetCollection("vouchers")
	uvColl := database.GetCollection("user_vouchers")

	totalVouchers, _ := vColl.CountDocuments(context.Background(), bson.M{})
	totalClaims, _ := uvColl.CountDocuments(context.Background(), bson.M{})
	totalRedeems, _ := uvColl.CountDocuments(context.Background(), bson.M{"status": "USED"})

	return c.JSON(fiber.Map{
		"total_vouchers": totalVouchers,
		"total_claims":   totalClaims,
		"total_redeems":  totalRedeems,
	})
}
