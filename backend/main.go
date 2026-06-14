package main

import (
	"log"
	"os"

	"cems-backend/database"
	"cems-backend/handler"
	"cems-backend/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("File .env tidak ditemukan, menggunakan environment variable sistem")
	}

	database.Connect()

	r := gin.Default()

	// CORS — izinkan semua origin saat development
	// Ganti AllowOrigins saat production
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://*.vercel.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Health check
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "CEMS API berjalan ✅"})
	})

	// ============================================
	// Routes
	// ============================================
	api := r.Group("/api")

	// Auth (public)
	auth := api.Group("/auth")
	{
		auth.POST("/register", handler.Register)
		auth.POST("/login", handler.Login)
	}

	// Protected routes (butuh JWT)
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		// User
		protected.GET("/me", handler.GetMe)

		// Events
		protected.GET("/events", handler.GetEvents)          
		protected.GET("/events/:id", handler.GetEventByID)   

		// Organizer & Admin only
		orgAdmin := protected.Group("/")
		orgAdmin.Use(middleware.RequireRole("organizer", "admin"))
		{
			orgAdmin.POST("/events", handler.CreateEvent)
			orgAdmin.PUT("/events/:id", handler.UpdateEvent)
			orgAdmin.DELETE("/events/:id", handler.DeleteEvent)
			orgAdmin.GET("/events/:id/participants", handler.GetEventParticipants)
			orgAdmin.GET("/my-events", handler.GetMyEvents)
		}

		// Participant & all role
		protected.POST("/registrations", handler.RegisterEvent)
		protected.DELETE("/registrations/:id", handler.CancelRegistration)
		protected.GET("/registrations/me", handler.GetMyRegistrations)
	}

	// Jalankan server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server berjalan di http://localhost:%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Gagal menjalankan server:", err)
	}
}
