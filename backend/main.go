package main

import (
	"log"

	"backend/config"
	"backend/database"
	"backend/routes"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
)

func main() {
	// 1. Load Config
	cfg := config.LoadConfig()

	// 2. Connect to Database
	database.ConnectDB(cfg)

	// 3. Initialize Fiber App
	app := fiber.New(fiber.Config{
		AppName: "Muty Voucher API",
	})

	// 4. Middlewares
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{"Origin, Content-Type, Accept, Authorization"},
		AllowMethods: []string{"GET, POST, PUT, DELETE, OPTIONS"},
	}))

	// 5. Setup Routes
	routes.SetupRoutes(app, cfg)

	// 6. Start Server
	log.Printf("Server starting on port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}