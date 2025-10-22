package com.afripay.transaction.service;

import com.afripay.transaction.ai.FraudCheckClient;
import com.afripay.transaction.ai.FraudCheckRequest;
import com.afripay.transaction.ai.FraudCheckResult;
import com.afripay.transaction.blockchain.BlockchainClient;
import com.afripay.transaction.blockchain.TransactionBlockchainDTO;
import com.afripay.transaction.model.Transaction;
import com.afripay.transaction.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TransactionService {
    
    private static final Logger logger = LoggerFactory.getLogger(TransactionService.class);
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private BlockchainClient blockchainClient;
    
    @Autowired
    private FraudCheckClient fraudCheckClient;

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public Transaction createTransaction(Transaction transaction) {
        // Step 1: Fraud Detection (BEFORE processing)
        FraudCheckResult fraudCheck = performFraudCheck(transaction);
        
        if (fraudCheck.shouldBlock()) {
            logger.warn("Transaction BLOCKED by fraud detection: {}", transaction.getId());
            transaction.setStatus("BLOCKED");
            transaction.setDescription("Blocked by fraud detection: High risk");
            return transactionRepository.save(transaction);
        }
        
        if (fraudCheck.shouldReview()) {
            logger.info("Transaction flagged for REVIEW: {}", transaction.getId());
            transaction.setStatus("PENDING_REVIEW");
        } else {
            transaction.setStatus("PENDING");
        }
        
        // Step 2: Save to database (ACID guarantees)
        Transaction savedTransaction = transactionRepository.save(transaction);
        
        // Step 3: Record on blockchain asynchronously (immutability)
        try {
            TransactionBlockchainDTO blockchainDTO = convertToBlockchainDTO(savedTransaction);
            blockchainClient.recordTransactionAsync(blockchainDTO);
            logger.info("Transaction {} queued for blockchain recording", savedTransaction.getId());
        } catch (Exception e) {
            logger.error("Failed to queue transaction for blockchain: {}", e.getMessage());
            // Don't fail the transaction if blockchain recording fails
        }
        
        return savedTransaction;
    }

    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id).orElse(null);
    }
    
    /**
     * Verify transaction integrity against blockchain
     */
    public boolean verifyTransactionIntegrity(Long id, String blockchainHash) {
        Transaction transaction = getTransactionById(id);
        if (transaction == null) {
            return false;
        }
        
        try {
            return blockchainClient.verifyTransaction(
                transaction.getId().toString(), 
                blockchainHash
            );
        } catch (Exception e) {
            logger.error("Failed to verify transaction: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Perform fraud check on transaction
     */
    private FraudCheckResult performFraudCheck(Transaction transaction) {
        try {
            FraudCheckRequest request = new FraudCheckRequest();
            request.setTransactionId(transaction.getId() != null ? transaction.getId().toString() : "unknown");
            request.setAmount(transaction.getAmount() != null ? transaction.getAmount().doubleValue() : 0.0);
            request.setCurrency("KES");
            request.setFromAccount(transaction.getFromAccount());
            request.setToAccount(transaction.getToAccount());
            request.setTimestamp(java.time.LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            
            return fraudCheckClient.checkFraud(request);
        } catch (Exception e) {
            logger.error("Fraud check failed: {}", e.getMessage());
            // Fail safe - allow transaction but flag for review
            FraudCheckResult result = new FraudCheckResult();
            result.setRecommendedAction("REVIEW");
            return result;
        }
    }
    
    /**
     * Convert Transaction entity to Blockchain DTO
     */
    private TransactionBlockchainDTO convertToBlockchainDTO(Transaction transaction) {
        TransactionBlockchainDTO dto = new TransactionBlockchainDTO();
        dto.setId(transaction.getId().toString());
        dto.setType(transaction.getType() != null ? transaction.getType() : "TRANSFER");
        dto.setAmount(transaction.getAmount() != null ? transaction.getAmount().doubleValue() : 0.0);
        dto.setCurrency("KES"); // Default currency
        dto.setFromAccount(transaction.getFromAccount() != null ? transaction.getFromAccount() : "");
        dto.setToAccount(transaction.getToAccount() != null ? transaction.getToAccount() : "");
        dto.setTimestamp(transaction.getCreatedAt() != null ? 
            transaction.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : 
            java.time.LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        dto.setStatus(transaction.getStatus() != null ? transaction.getStatus() : "PENDING");
        
        // Add metadata
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("description", transaction.getDescription());
        metadata.put("reference", transaction.getReference());
        dto.setMetadata(metadata);
        
        return dto;
    }
}
