package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// TransactionLedgerContract provides functions for managing transactions on blockchain
type TransactionLedgerContract struct {
	contractapi.Contract
}

// Transaction represents a financial transaction
type Transaction struct {
	ID            string    `json:"id"`
	Type          string    `json:"type"`
	Amount        float64   `json:"amount"`
	Currency      string    `json:"currency"`
	FromAccount   string    `json:"fromAccount"`
	ToAccount     string    `json:"toAccount"`
	Timestamp     time.Time `json:"timestamp"`
	Status        string    `json:"status"`
	Metadata      string    `json:"metadata"`
	BlockchainTxn string    `json:"blockchainTxn"`
	CreatedAt     time.Time `json:"createdAt"`
}

// AuditLog represents an audit trail entry
type AuditLog struct {
	ID           string    `json:"id"`
	ActionType   string    `json:"actionType"`
	ActorUserId  string    `json:"actorUserId"`
	ResourceType string    `json:"resourceType"`
	ResourceId   string    `json:"resourceId"`
	BeforeValue  string    `json:"beforeValue"`
	AfterValue   string    `json:"afterValue"`
	Timestamp    time.Time `json:"timestamp"`
	CreatedAt    time.Time `json:"createdAt"`
}

// InitLedger initializes the ledger with sample data (for testing)
func (c *TransactionLedgerContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	fmt.Println("Initializing Transaction Ledger")
	return nil
}

// CreateTransaction records a new transaction on the blockchain
func (c *TransactionLedgerContract) CreateTransaction(
	ctx contractapi.TransactionContextInterface,
	id string,
	txnType string,
	amount float64,
	currency string,
	fromAccount string,
	toAccount string,
	timestamp string,
	status string,
	metadata string,
) error {
	// Check if transaction already exists
	exists, err := c.TransactionExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("transaction %s already exists", id)
	}

	// Parse timestamp
	ts, err := time.Parse(time.RFC3339, timestamp)
	if err != nil {
		return fmt.Errorf("invalid timestamp format: %v", err)
	}

	// Create transaction object
	transaction := Transaction{
		ID:            id,
		Type:          txnType,
		Amount:        amount,
		Currency:      currency,
		FromAccount:   fromAccount,
		ToAccount:     toAccount,
		Timestamp:     ts,
		Status:        status,
		Metadata:      metadata,
		BlockchainTxn: ctx.GetStub().GetTxID(),
		CreatedAt:     time.Now(),
	}

	// Marshal to JSON
	transactionJSON, err := json.Marshal(transaction)
	if err != nil {
		return err
	}

	// Save to ledger
	return ctx.GetStub().PutState(id, transactionJSON)
}

// GetTransaction retrieves a transaction from the blockchain
func (c *TransactionLedgerContract) GetTransaction(
	ctx contractapi.TransactionContextInterface,
	id string,
) (*Transaction, error) {
	transactionJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if transactionJSON == nil {
		return nil, fmt.Errorf("transaction %s does not exist", id)
	}

	var transaction Transaction
	err = json.Unmarshal(transactionJSON, &transaction)
	if err != nil {
		return nil, err
	}

	return &transaction, nil
}

// TransactionExists checks if a transaction exists
func (c *TransactionLedgerContract) TransactionExists(
	ctx contractapi.TransactionContextInterface,
	id string,
) (bool, error) {
	transactionJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return transactionJSON != nil, nil
}

// GetTransactionHistory retrieves the history of a transaction
func (c *TransactionLedgerContract) GetTransactionHistory(
	ctx contractapi.TransactionContextInterface,
	id string,
) ([]Transaction, error) {
	resultsIterator, err := ctx.GetStub().GetHistoryForKey(id)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var transactions []Transaction
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var transaction Transaction
		if err := json.Unmarshal(response.Value, &transaction); err != nil {
			return nil, err
		}
		transactions = append(transactions, transaction)
	}

	return transactions, nil
}

// GetAccountTransactions retrieves all transactions for an account
func (c *TransactionLedgerContract) GetAccountTransactions(
	ctx contractapi.TransactionContextInterface,
	accountId string,
) ([]Transaction, error) {
	// Create query string
	queryString := fmt.Sprintf(`{
		"selector": {
			"$or": [
				{"fromAccount": "%s"},
				{"toAccount": "%s"}
			]
		}
	}`, accountId, accountId)

	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var transactions []Transaction
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var transaction Transaction
		err = json.Unmarshal(queryResponse.Value, &transaction)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, transaction)
	}

	return transactions, nil
}

// CreateAuditLog records an audit log entry on the blockchain
func (c *TransactionLedgerContract) CreateAuditLog(
	ctx contractapi.TransactionContextInterface,
	id string,
	actionType string,
	actorUserId string,
	resourceType string,
	resourceId string,
	beforeValue string,
	afterValue string,
	timestamp string,
) error {
	// Parse timestamp
	ts, err := time.Parse(time.RFC3339, timestamp)
	if err != nil {
		return fmt.Errorf("invalid timestamp format: %v", err)
	}

	// Create audit log object
	auditLog := AuditLog{
		ID:           id,
		ActionType:   actionType,
		ActorUserId:  actorUserId,
		ResourceType: resourceType,
		ResourceId:   resourceId,
		BeforeValue:  beforeValue,
		AfterValue:   afterValue,
		Timestamp:    ts,
		CreatedAt:    time.Now(),
	}

	// Marshal to JSON
	auditLogJSON, err := json.Marshal(auditLog)
	if err != nil {
		return err
	}

	// Save to ledger with prefix to separate from transactions
	key := "AUDIT_" + id
	return ctx.GetStub().PutState(key, auditLogJSON)
}

// GetAuditLog retrieves an audit log entry
func (c *TransactionLedgerContract) GetAuditLog(
	ctx contractapi.TransactionContextInterface,
	id string,
) (*AuditLog, error) {
	key := "AUDIT_" + id
	auditLogJSON, err := ctx.GetStub().GetState(key)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if auditLogJSON == nil {
		return nil, fmt.Errorf("audit log %s does not exist", id)
	}

	var auditLog AuditLog
	err = json.Unmarshal(auditLogJSON, &auditLog)
	if err != nil {
		return nil, err
	}

	return &auditLog, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&TransactionLedgerContract{})
	if err != nil {
		fmt.Printf("Error creating transaction ledger chaincode: %v\n", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting transaction ledger chaincode: %v\n", err)
	}
}
