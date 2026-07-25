package handlers

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

func GetDebug(c *gin.Context) {

	hostname, _ := os.Hostname()

	c.JSON(http.StatusOK, gin.H{
		"hostname": hostname,
		"version":  "1.0.0",
		"time":     time.Now(),
	})
}