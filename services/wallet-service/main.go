package main

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

type Wallet struct {
	ID     string  `json:"id"`
	Balance float64 `json:"balance"`
}

var wallets = make(map[string]Wallet)

func main() {
	r := gin.Default()
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "service": "wallet-service"})
	})

	r.POST("/api/wallets", func(c *gin.Context) {
		var wallet Wallet
		if err := c.ShouldBindJSON(&wallet); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		wallets[wallet.ID] = wallet
		c.JSON(http.StatusCreated, wallet)
	})

	r.GET("/api/wallets/:id", func(c *gin.Context) {
		id := c.Param("id")
		wallet, exists := wallets[id]
		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Wallet not found"})
			return
		}
		c.JSON(http.StatusOK, wallet)
	})

	r.Run(":8003")
}
