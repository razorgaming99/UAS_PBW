package model

import "time"

type User struct {
	ID        string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name      string    `json:"name"`
	Email     string    `json:"email" gorm:"unique"`
	Password  string    `json:"-"` // jangan pernah return password ke frontend
	Role      string    `json:"role" gorm:"default:participant"`
	CreatedAt time.Time `json:"created_at"`
}

type Event struct {
	ID          string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	Quota       int       `json:"quota"`
	OrganizerID string    `json:"organizer_id"`
	Organizer   *User     `json:"organizer,omitempty" gorm:"foreignKey:OrganizerID"`
	CreatedAt   time.Time `json:"created_at"`
}

type Registration struct {
	ID           string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	EventID      string    `json:"event_id"`
	UserID       string    `json:"user_id"`
	Status       string    `json:"status" gorm:"default:registered"`
	RegisteredAt time.Time `json:"registered_at" gorm:"default:now()"`
	Event        *Event    `json:"event,omitempty" gorm:"foreignKey:EventID"`
	User         *User     `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// Request/Response structs

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role"` // "participant" atau "organizer"
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type CreateEventRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Location    string `json:"location"`
	StartDate   string `json:"start_date" binding:"required"` // format: "2006-01-02T15:04:05Z"
	EndDate     string `json:"end_date" binding:"required"`
	Quota       int    `json:"quota" binding:"required,min=1"`
}

type RegisterEventRequest struct {
	EventID string `json:"event_id" binding:"required"`
}

type Response struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}
