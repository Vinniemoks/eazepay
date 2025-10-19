package main

import (
	"bufio"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

type Wallet struct {
	ID      string  `json:"id"`
	Balance float64 `json:"balance"`
}

var wallets = make(map[string]Wallet)

func loadEnv(filename string) {
	f, err := os.Open(filename)
	if err != nil {
		if !os.IsNotExist(err) {
			log.Printf("wallet-service: unable to read %s: %v", filename, err)
		}
		return
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])

		if key == "" || value == "" {
			continue
		}

		if _, exists := os.LookupEnv(key); !exists {
			if err := os.Setenv(key, value); err != nil {
				log.Printf("wallet-service: unable to set env %s: %v", key, err)
			}
		}
	}

	if err := scanner.Err(); err != nil {
		log.Printf("wallet-service: error scanning %s: %v", filename, err)
	}
}

func main() {
	loadEnv(".env")

	port := strings.TrimSpace(os.Getenv("PORT"))
	if port == "" {
		port = "8003"
	}

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

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("wallet-service: failed to start server: %v", err)
	}
}
