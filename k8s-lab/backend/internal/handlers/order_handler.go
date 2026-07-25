package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Order struct {
	ID     int     `json:"id"`
	Amount float64 `json:"amount"`
	Status string  `json:"status"`
}

func GetOrders(c *gin.Context) {

	orders := []Order{
		{
			ID:     1001,
			Amount: 2500,
			Status: "Paid",
		},
		{
			ID:     1002,
			Amount: 150,
			Status: "Pending",
		},
	}

	c.JSON(http.StatusOK, orders)
}