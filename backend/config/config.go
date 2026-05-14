package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port             string
	MongoURI         string
	DBName           string
	JWTSecret        string
	JWTRefreshSecret string
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	return &Config{
		Port:             getEnv("PORT", "8080"),
		MongoURI:         getEnv("MONGO_URI", "mongodb://localhost:27017"),
		DBName:           getEnv("DB_NAME", "muty_voucher"),
		JWTSecret:        getEnv("JWT_SECRET", "secret"),
		JWTRefreshSecret: getEnv("JWT_REFRESH_SECRET", "refresh_secret"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
