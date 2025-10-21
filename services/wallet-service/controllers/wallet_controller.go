package controllers

import (
	"afripay/models"
	"afripay/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type WalletController struct {
	walletService    *services.WalletService
	biometricService *services.BiometricService
}

func NewWalletController(ws *services.WalletService, bs *services.BiometricService) *WalletController {
	return &WalletController{
		walletService:    ws,
		biometricService: bs,
	}
}

// CreateWallet creates a new wallet for a user
func (wc *WalletController) CreateWallet(c *gin.Context) {
	var req struct {
		UserID     string `json:"userId" binding:"required"`
		WalletType string `json:"walletType" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	wallet, err := wc.walletService.CreateWallet(userID, models.WalletType(req.WalletType))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, wallet)
}

// GetWallet retrieves wallet details
func (wc *WalletController) GetWallet(c *gin.Context) {
	walletID := c.Param("id")

	id, err := uuid.Parse(walletID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid wallet ID"})
		return
	}

	wallet, err := wc.walletService.GetWallet(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wallet not found"})
		return
	}

	c.JSON(http.StatusOK, wallet)
}

// CreateVirtualCard generates a virtual card for the wallet
func (wc *WalletController) CreateVirtualCard(c *gin.Context) {
	var req struct {
		WalletID     string  `json:"walletId" binding:"required"`
		DailyLimit   float64 `json:"dailyLimit"`
		MonthlyLimit float64 `json:"monthlyLimit"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	walletID, err := uuid.Parse(req.WalletID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid wallet ID"})
		return
	}

	card, err := wc.walletService.CreateVirtualCard(walletID, req.DailyLimit, req.MonthlyLimit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, card)
}

// BiometricPayment processes payment using biometric authentication
func (wc *WalletController) BiometricPayment(c *gin.Context) {
	var req struct {
		WalletID      string  `json:"walletId" binding:"required"`
		Amount        float64 `json:"amount" binding:"required"`
		MerchantID    string  `json:"merchantId" binding:"required"`
		BiometricData string  `json:"biometricData" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	walletID, err := uuid.Parse(req.WalletID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid wallet ID"})
		return
	}

	// Verify biometric
	verified, err := wc.biometricService.VerifyBiometric(walletID, req.BiometricData)
	if err != nil || !verified {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Biometric verification failed"})
		return
	}

	// Process payment
	payment, err := wc.walletService.ProcessBiometricPayment(walletID, req.Amount, req.MerchantID, req.BiometricData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, payment)
}

// EnableBiometric enables biometric payments for wallet
func (wc *WalletController) EnableBiometric(c *gin.Context) {
	var req struct {
		WalletID      string `json:"walletId" binding:"required"`
		BiometricData string `json:"biometricData" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	walletID, err := uuid.Parse(req.WalletID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid wallet ID"})
		return
	}

	// Register biometric
	err = wc.biometricService.RegisterBiometric(walletID, req.BiometricData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Enable biometric on wallet
	err = wc.walletService.EnableBiometric(walletID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Biometric enabled successfully"})
}
