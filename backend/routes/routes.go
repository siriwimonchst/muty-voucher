package routes

import (
	"backend/config"
	"backend/handlers"
	"backend/middleware"

	"github.com/gofiber/fiber/v3"
)

func SetupRoutes(app *fiber.App, cfg *config.Config) {
	authHandler := handlers.NewAuthHandler(cfg)
	voucherHandler := &handlers.VoucherHandler{}
	adminHandler := &handlers.AdminHandler{}

	api := app.Group("/api")
	authMw := middleware.AuthMiddleware(cfg)

	// Auth routes - single group
	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/upload", authMw, authHandler.Upload)
	auth.Get("/me", authMw, authHandler.GetMe)
	auth.Put("/profile", authMw, authHandler.UpdateProfile)
	auth.Post("/change-password", authMw, authHandler.ChangePassword)

	// Public Voucher routes
	vouchers := api.Group("/vouchers")
	vouchers.Get("/", voucherHandler.ListAvailableVouchers)

	// Protected routes
	protected := api.Group("/", authMw)

	// User Voucher routes
	protected.Post("/vouchers/:id/claim", voucherHandler.ClaimVoucher)
	protected.Get("/my-vouchers", voucherHandler.ListMyVouchers)
	protected.Post("/my-vouchers/:id/use", voucherHandler.UseVoucher)

	// Admin routes
	admin := protected.Group("/admin", middleware.AdminMiddleware())
	admin.Post("/vouchers", adminHandler.CreateVoucher)
	admin.Get("/vouchers", adminHandler.ListAllVouchers)
	admin.Put("/vouchers/:id", adminHandler.UpdateVoucher)
	admin.Delete("/vouchers/:id", adminHandler.DeleteVoucher)
	admin.Get("/dashboard", adminHandler.GetStats)
}
