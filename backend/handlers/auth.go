package handlers

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"backend/config"
	"backend/database"
	"backend/models"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	Config *config.Config
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	return &AuthHandler{Config: cfg}
}

func (h *AuthHandler) Register(c fiber.Ctx) error {
	var data map[string]string
	if err := c.Bind().JSON(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	phone := data["phone_number"]
	password := data["password"]
	displayName := data["display_name"]

	if phone == "" || password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Phone number and password are required"})
	}

	if len(password) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Password must be at least 6 characters long"})
	}

	collection := database.GetCollection("users")
	var existingUser models.User
	err := collection.FindOne(context.Background(), bson.M{"phone_number": phone}).Decode(&existingUser)
	if err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Phone number already registered"})
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), 10)

	user := models.User{
		ID:                bson.NewObjectID(),
		PhoneNumber:       phone,
		Password:          string(hashedPassword),
		DisplayName:       displayName,
		ProfilePictureURL: "https://ui-avatars.com/api/?name=" + displayName,
		Role:              "user",
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	_, err = collection.InsertOne(context.Background(), user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "User registered successfully"})
}

func (h *AuthHandler) Login(c fiber.Ctx) error {
	var data map[string]string
	if err := c.Bind().JSON(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	phone := data["phone_number"]
	password := data["password"]

	collection := database.GetCollection("users")
	var user models.User
	err := collection.FindOne(context.Background(), bson.M{"phone_number": phone}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid phone number or password"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Login failed"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid phone number or password"})
	}

	// Create JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID.Hex(),
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(h.Config.JWTSecret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	return c.JSON(fiber.Map{
		"token": tokenString,
		"user":  user,
	})
}

func (h *AuthHandler) GetMe(c fiber.Ctx) error {
	userID := c.Locals("user_id").(bson.ObjectID)
	collection := database.GetCollection("users")
	var user models.User
	err := collection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}
	return c.JSON(user)
}

func (h *AuthHandler) ChangePassword(c fiber.Ctx) error {
	var data map[string]string
	if err := c.Bind().JSON(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	oldPassword := data["old_password"]
	newPassword := data["new_password"]

	if oldPassword == "" || newPassword == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Both old and new passwords are required"})
	}

	if len(newPassword) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "New password must be at least 6 characters long"})
	}

	userID := c.Locals("user_id").(bson.ObjectID)
	collection := database.GetCollection("users")
	
	var user models.User
	err := collection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	// Verify old password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(oldPassword)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Incorrect old password"})
	}

	// Hash new password
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(newPassword), 10)

	// Update password
	_, err = collection.UpdateOne(
		context.Background(),
		bson.M{"_id": userID},
		bson.M{"$set": bson.M{"password": string(hashedPassword), "updated_at": time.Now()}},
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update password"})
	}

	return c.JSON(fiber.Map{"message": "Password changed successfully"})
}

func (h *AuthHandler) UpdateProfile(c fiber.Ctx) error {
	var req struct {
		DisplayName       string `json:"display_name"`
		ProfilePictureURL string `json:"profile_picture_url"`
	}

	if err := c.Bind().JSON(&req); err != nil {
		fmt.Printf("UpdateProfile bind error: %v\n", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	displayName := req.DisplayName
	profilePictureURL := req.ProfilePictureURL

	if displayName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Display name is required"})
	}

	userID := c.Locals("user_id").(bson.ObjectID)
	collection := database.GetCollection("users")

	update := bson.M{
		"$set": bson.M{
			"display_name":        displayName,
			"profile_picture_url": profilePictureURL,
			"updated_at":          time.Now(),
		},
	}

	result, err := collection.UpdateOne(context.Background(), bson.M{"_id": userID}, update)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update profile"})
	}

	if result.MatchedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found for update"})
	}

	fmt.Printf("Profile updated for user %s: Name=%s, Picture=%s\n", userID.Hex(), displayName, profilePictureURL)

	// Fetch updated user to return
	var updatedUser models.User
	collection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&updatedUser)

	return c.JSON(fiber.Map{
		"message": "Profile updated successfully",
		"user":    updatedUser,
	})
}

func (h *AuthHandler) Upload(c fiber.Ctx) error {
	file, err := c.FormFile("image")
	if err != nil {
		fmt.Printf("Upload FormFile error: %v\n", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to get file"})
	}

	// Ensure uploads directory exists
	if err := os.MkdirAll("uploads", 0755); err != nil {
		fmt.Printf("Upload MkdirAll error: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create uploads directory"})
	}

	// Create unique filename
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	savePath := filepath.Join("uploads", filename)

	if err := c.SaveFile(file, savePath); err != nil {
		fmt.Printf("Upload SaveFile error: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save file"})
	}

	// Return the relative URL
	url := fmt.Sprintf("/uploads/%s", filename)
	fmt.Printf("File uploaded successfully: %s\n", url)

	return c.JSON(fiber.Map{
		"url": url,
	})
}
