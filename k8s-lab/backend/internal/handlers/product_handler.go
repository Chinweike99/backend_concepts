package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Product struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

func GetProducts(c *gin.Context) {

	products := []Product{
		{
			ID:    1,
			Name:  "MacBook Pro",
			Price: 2500,
		},
		{
			ID:    2,
			Name:  "Mechanical Keyboard",
			Price: 150,
		},
		{
			ID:    3,
			Name:  "Gaming Mouse",
			Price: 80,
		},
	}

	c.JSON(http.StatusOK, products)
}