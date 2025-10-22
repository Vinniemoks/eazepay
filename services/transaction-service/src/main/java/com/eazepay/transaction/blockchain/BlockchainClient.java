package com.eazepay.transaction.blockchain;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Client for interacting with the Blockchain Service
 */
@Component
public class BlockchainClient {
    
    private static final Logger logger = LoggerFactory.getLogger(BlockchainClient.class);
    
    @Value("${blockchain.service.url:http://blockchain-service:8020}")
    private String blockchainServiceUrl;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public BlockchainClient() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Record a transaction on the blockchain asynchronously
     */
    public void recordTransactionAsync(TransactionBlockchainDTO transaction) {
        // Run in separate thread to avoid blocking
        new Thread(() -> {
            try {
                recordTransaction(transaction);
            } catch (Exception e) {
                logger.error("Failed to record transaction on blockchain: {}", e.getMessage());
                // Don't throw - blockchain recording is supplementary
            }
        }).start();
    }
    
    /**
     * Record a transaction on the blockchain
     */
    public String recordTransaction(TransactionBlockchainDTO transaction) {
        try {
            String url = blockchainServiceUrl + "/api/blockchain/transactions";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<TransactionBlockchainDTO> request = new HttpEntity<>(transaction, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String txHash = (String) response.getBody().get("transactionHash");
                logger.info("Transaction {} recorded on blockchain with hash: {}", 
                    transaction.getId(), txHash);
                return txHash;
            }
            
            return null;
        } catch (Exception e) {
            logger.error("Error recording transaction on blockchain: {}", e.getMessage());
            throw new RuntimeException("Blockchain recording failed", e);
        }
    }
    
    /**
     * Verify a transaction on the blockchain
     */
    public boolean verifyTransaction(String transactionId, String expectedHash) {
        try {
            String url = blockchainServiceUrl + "/api/blockchain/verify/" + transactionId;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, String> body = new HashMap<>();
            body.put("expectedHash", expectedHash);
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (Boolean) response.getBody().get("isValid");
            }
            
            return false;
        } catch (Exception e) {
            logger.error("Error verifying transaction on blockchain: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Get transaction from blockchain
     */
    public Map<String, Object> getTransaction(String transactionId) {
        try {
            String url = blockchainServiceUrl + "/api/blockchain/transactions/" + transactionId;
            
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (Map<String, Object>) response.getBody().get("transaction");
            }
            
            return null;
        } catch (Exception e) {
            logger.error("Error getting transaction from blockchain: {}", e.getMessage());
            return null;
        }
    }
}
