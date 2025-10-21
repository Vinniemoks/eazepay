package models

import (
	"time"

	"github.com/google/uuid"
)

type WalletType string
type CardStatus string
type TransactionType string

const (
	WalletTypePersonal WalletType = "PERSONAL"
	WalletTypeBusiness WalletType = "BUSINESS"

	CardStatusActive  CardStatus = "ACTIVE"
	CardStatusBlocked CardStatus = "BLOCKED"
	CardStatusExpired CardStatus = "EXPIRED"

	TxTypeDebit  TransactionType = "DEBIT"
	TxTypeCredit TransactionType = "CREDIT"
)

type Wallet struct {
	ID               uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	UserID           uuid.UUID  `json:"userId" gorm:"type:uuid;not null;index"`
	WalletType       WalletType `json:"walletType" gorm:"type:varchar(20);not null"`
	Balance          float64    `json:"balance" gorm:"type:decimal(15,2);default:0"`
	Currency         string     `json:"currency" gorm:"type:varchar(3);default:'KES'"`
	Status           string     `json:"status" gorm:"type:varchar(20);default:'ACTIVE'"`
	DailyLimit       float64    `json:"dailyLimit" gorm:"type:decimal(15,2)"`
	MonthlyLimit     float64    `json:"monthlyLimit" gorm:"type:decimal(15,2)"`
	BiometricEnabled bool       `json:"biometricEnabled" gorm:"default:false"`
	CreatedAt        time.Time  `json:"createdAt"`
	UpdatedAt        time.Time  `json:"updatedAt"`
}

type VirtualCard struct {
	ID             uuid.UUID  `json:"id" gorm:"type:uuid;primary_key"`
	WalletID       uuid.UUID  `json:"walletId" gorm:"type:uuid;not null"`
	CardNumber     string     `json:"cardNumber" gorm:"type:varchar(16);unique"`
	CardHolderName string     `json:"cardHolderName" gorm:"type:varchar(255)"`
	ExpiryMonth    int        `json:"expiryMonth"`
	ExpiryYear     int        `json:"expiryYear"`
	CVV            string     `json:"cvv" gorm:"type:varchar(3)"`
	Status         CardStatus `json:"status" gorm:"type:varchar(20)"`
	DailyLimit     float64    `json:"dailyLimit" gorm:"type:decimal(15,2)"`
	MonthlyLimit   float64    `json:"monthlyLimit" gorm:"type:decimal(15,2)"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

type BiometricPayment struct {
	ID            uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	WalletID      uuid.UUID `json:"walletId" gorm:"type:uuid;not null"`
	Amount        float64   `json:"amount" gorm:"type:decimal(15,2)"`
	MerchantID    string    `json:"merchantId"`
	BiometricHash string    `json:"biometricHash" gorm:"type:text"`
	Verified      bool      `json:"verified"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"createdAt"`
}
