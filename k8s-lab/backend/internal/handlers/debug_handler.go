package handlers

import (
	"net/http"
	"os"
	"time"

	"github.com/chinweike99/k8s-lab/backend/internal/state"
	"github.com/gin-gonic/gin"
)

func GetDebug(c *gin.Context) {

	hostname, _ := os.Hostname()
	version := os.Getenv("APP_VERSION")
	environment := os.Getenv("APP_ENV")

	if version == "" {
		version = "development"
	}

	if environment == "" {
		environment = "local"
	}

	state.IncrementRequestCount()

	// c.JSON(http.StatusOK, gin.H{
	response := map[string]any{
		"hostname":     hostname,
		"version":      version,
		"environment":  environment,
		"requestCount": state.GetRequestCount(),
		"startedAt":    state.StartedAt,
		"time":           time.Now(),
	}
	c.JSON(http.StatusOK, response)
}