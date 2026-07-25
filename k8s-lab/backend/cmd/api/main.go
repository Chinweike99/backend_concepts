package main

import (
	"net/http"

	"github.com/chinweike99/k8s-lab/backend/internal/handlers"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()


	router.GET("/", func(c *gin.Context){
		c.JSON(http.StatusOK, gin.H{
			"message": "k8s lab backend",
		})
	})

	router.GET("api/products", handlers.GetProducts)
	router.GET("api/orders", handlers.GetOrders)
	router.GET("api/debug", handlers.GetDebug)

	router.Run(":8080")
}