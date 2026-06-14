package handler

import (
	"net/http"

	"cems-backend/database"
	"cems-backend/model"

	"github.com/gin-gonic/gin"
)

func RegisterEvent(c *gin.Context) {
	var req model.RegisterEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")

	// Cek event ada
	var event model.Event
	if err := database.DB.First(&event, "id = ?", req.EventID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event tidak ditemukan"})
		return
	}

	// Cek sudah pernah daftar
	var existing model.Registration
	if err := database.DB.Where("event_id = ? AND user_id = ?", req.EventID, userID).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Kamu sudah terdaftar di event ini"})
		return
	}

	// Cek kuota
	var count int64
	database.DB.Model(&model.Registration{}).Where("event_id = ? AND status = 'registered'", req.EventID).Count(&count)
	if int(count) >= event.Quota {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kuota event sudah penuh"})
		return
	}

	registration := model.Registration{
		EventID: req.EventID,
		UserID:  userID.(string),
		Status:  "registered",
	}

	if err := database.DB.Create(&registration).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mendaftar event"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Berhasil mendaftar event",
		"data":    registration,
	})
}

func CancelRegistration(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")

	var reg model.Registration
	if err := database.DB.First(&reg, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pendaftaran tidak ditemukan"})
		return
	}

	if reg.UserID != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Kamu tidak bisa membatalkan pendaftaran orang lain"})
		return
	}

	if err := database.DB.Delete(&reg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membatalkan pendaftaran"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pendaftaran berhasil dibatalkan"})
}

func GetMyRegistrations(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var registrations []model.Registration
	if err := database.DB.Preload("Event").Preload("Event.Organizer").
		Where("user_id = ?", userID).
		Order("registered_at desc").
		Find(&registrations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": registrations})
}

// GetEventParticipants — untuk organizer melihat peserta eventnya
func GetEventParticipants(c *gin.Context) {
	eventID := c.Param("id")
	organizerID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	// Pastikan event ini milik organizer (kecuali admin)
	var event model.Event
	if err := database.DB.First(&event, "id = ?", eventID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event tidak ditemukan"})
		return
	}

	if role != "admin" && event.OrganizerID != organizerID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak"})
		return
	}

	var registrations []model.Registration
	if err := database.DB.Preload("User").
		Where("event_id = ? AND status = 'registered'", eventID).
		Find(&registrations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data peserta"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  registrations,
		"total": len(registrations),
		"quota": event.Quota,
	})
}
