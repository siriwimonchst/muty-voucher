package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type User struct {
	ID                bson.ObjectID `bson:"_id,omitempty" json:"id"`
	PhoneNumber       string        `bson:"phone_number" json:"phone_number"`
	Password          string        `bson:"password" json:"-"`
	DisplayName       string        `bson:"display_name" json:"display_name"`
	ProfilePictureURL string        `bson:"profile_picture_url" json:"profile_picture_url"`
	Role              string        `bson:"role" json:"role"` // "user" | "admin"
	CreatedAt         time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt         time.Time     `bson:"updated_at" json:"updated_at"`
}

type Voucher struct {
	ID             bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Title          string        `bson:"title" json:"title"`
	Description    string        `bson:"description" json:"description"`
	ShopName       string        `bson:"shop_name" json:"shop_name"`
	DiscountType   string        `bson:"discount_type" json:"discount_type"` // "percent" | "fixed" | "freebie"
	DiscountValue  float64       `bson:"discount_value" json:"discount_value"`
	TotalQuota     int           `bson:"total_quota" json:"total_quota"`
	ClaimedCount   int           `bson:"claimed_count" json:"claimed_count"`
	ClaimStartTime time.Time     `bson:"claim_start_time" json:"claim_start_time"`
	ClaimEndTime   time.Time     `bson:"claim_end_time" json:"claim_end_time"`
	ValidUntil     time.Time     `bson:"valid_until" json:"valid_until"`
	ImageURL       string        `bson:"image_url" json:"image_url"`
	IsActive       bool          `bson:"is_active" json:"is_active"`
	CreatedBy      bson.ObjectID `bson:"created_by" json:"created_by"`
	CreatedAt      time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time     `bson:"updated_at" json:"updated_at"`
}

type UserVoucher struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    bson.ObjectID `bson:"user_id" json:"user_id"`
	VoucherID bson.ObjectID `bson:"voucher_id" json:"voucher_id"`
	Status    string        `bson:"status" json:"status"` // "AVAILABLE" | "USED" | "EXPIRED"
	ClaimedAt time.Time     `bson:"claimed_at" json:"claimed_at"`
	UsedAt    *time.Time    `bson:"used_at,omitempty" json:"used_at,omitempty"`
}

type Notification struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    *bson.ObjectID `bson:"user_id,omitempty" json:"user_id,omitempty"` // null for all users
	Title     string        `bson:"title" json:"title"`
	Message   string        `bson:"message" json:"message"`
	VoucherID *bson.ObjectID `bson:"voucher_id,omitempty" json:"voucher_id,omitempty"`
	IsRead    bool          `bson:"is_read" json:"is_read"`
	CreatedAt time.Time     `bson:"created_at" json:"created_at"`
}
