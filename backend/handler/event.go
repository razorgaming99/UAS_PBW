package handler

import (
	"net/http"
	"time"

	"cems-backend/database"
	"cems-backend/model"

	"github.com/gin-gonic/gin"
)

func GetEvents(c *gin.Context) {
	var events []model.Event
	if err := database.DB.Preload("Organizer").Order("created_at desc").Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data event"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": events})
}

func GetEventByID(c *gin.Context) {
	id := c.Param("id")

	var event model.Event
	if err := database.DB.Preload("Organizer").First(&event, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event tidak ditemukan"})
		return
	}

	// Hitung jumlah peserta terdaftar
	var count int64
	database.DB.Model(&model.Registration{}).Where("event_id = ? AND status = 'registered'", id).Count(&count)

	c.JSON(http.StatusOK, gin.H{
		"data":              event,
		"registered_count": count,
	})
}

func CreateEvent(c *gin.Context) {
	var req model.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	organizerID, _ := c.Get("user_id")

	startDate, err := time.Parse(time.RFC3339, req.StartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format start_date tidak valid. Gunakan: 2006-01-02T15:04:05Z"})
		return
	}

	endDate, err := time.Parse(time.RFC3339, req.EndDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format end_date tidak valid. Gunakan: 2006-01-02T15:04:05Z"})
		return
	}

	if endDate.Before(startDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "end_date tidak boleh sebelum start_date"})
		return
	}

	event := model.Event{
		Title:       req.Title,
		Description: req.Description,
		Location:    req.Location,
		StartDate:   startDate,
		EndDate:     endDate,
		Quota:       req.Quota,
		OrganizerID: organizerID.(string),
	}

	if err := database.DB.Create(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat event"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Event berhasil dibuat",
		"data":    event,
	})
}

func UpdateEvent(c *gin.Context) {
	id := c.Param("id")
	organizerID, _ := c.Get("user_id")

	var event model.Event
	if err := database.DB.First(&event, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event tidak ditemukan"})
		return
	}

	// Hanya organizer pemilik event yang bisa edit
	if event.OrganizerID != organizerID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Kamu bukan organizer event ini"})
		return
	}

	var req model.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	startDate, _ := time.Parse(time.RFC3339, req.StartDate)
	endDate, _ := time.Parse(time.RFC3339, req.EndDate)

	event.Title = req.Title
	event.Description = req.Description
	event.Location = req.Location
	event.StartDate = startDate
	event.EndDate = endDate
	event.Quota = req.Quota

	if err := database.DB.Save(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Event berhasil diupdate",
		"data":    event,
	})
}

func DeleteEvent(c *gin.Context) {
	id := c.Param("id")
	organizerID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	var event model.Event
	if err := database.DB.First(&event, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event tidak ditemukan"})
		return
	}

	// Admin bisa hapus semua, organizer hanya miliknya
	if role != "admin" && event.OrganizerID != organizerID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Kamu tidak punya akses untuk menghapus event ini"})
		return
	}

	if err := database.DB.Delete(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event berhasil dihapus"})
}

// GetMyEvents — untuk organizer, list event miliknya
func GetMyEvents(c *gin.Context) {
	organizerID, _ := c.Get("user_id")

	var events []model.Event
	if err := database.DB.Where("organizer_id = ?", organizerID).Order("created_at desc").Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": events})
}
