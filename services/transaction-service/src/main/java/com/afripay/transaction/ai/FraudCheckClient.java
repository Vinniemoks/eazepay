package com.afripay.transaction.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Client for AI/ML Fraud Detection Service
 */
@Component
public class FraudCheckClient {
    
    private static final Logger logger = LoggerFactory.getLogger(FraudCheckClient.class);
    
    @Value("${ai.service.url:http://ai-ml-service:8010}")
    private String aiServiceUrl;
    
    private final RestTemplate restTemplate;
    
    public FraudCheckClient() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Check if transaction is fraudulent
     */
    public FraudCheckResult checkFraud(FraudCheckRequest request) {
        try {
            String url = aiServiceUrl + "/api/fraud/detect";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<FraudCheckRequest> httpRequest = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, httpRequest, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                
                FraudCheckResult result = new FraudCheckResult();
                result.setTransactionId((String) body.get("transaction_id"));
                result.setFraud((Boolean) body.get("is_fraud"));
                result.setFraudProbability(((Number) body.get("fraud_probability")).doubleValue());
                result.setRiskScore(((Number) body.get("risk_score")).doubleValue());
                result.setRiskLevel((String) body.get("risk_level"));
                result.setRecommendedAction((String) body.get("recommended_action"));
                
                logger.info("Fraud check for {}: {} (probability: {}, action: {})",
                    result.getTransactionId(),
                    result.isFraud() ? "FRAUD" : "LEGITIMATE",
                    result.getFraudProbability(),
                    result.getRecommendedAction());
                
                return result;
            }
            
            // Default to safe response if service fails
            return createSafeResponse(request.getTransactionId());
            
        } catch (Exception e) {
            logger.error("Fraud check failed: {}", e.getMessage());
            // Fail open - don't block transactions if AI service is down
            return createSafeResponse(request.getTransactionId());
        }
    }
    
    /**
     * Check if transaction is fraudulent (async)
     */
    public void checkFraudAsync(FraudCheckRequest request, FraudCheckCallback callback) {
        new Thread(() -> {
            try {
                FraudCheckResult result = checkFraud(request);
                callback.onResult(result);
            } catch (Exception e) {
                logger.error("Async fraud check failed: {}", e.getMessage());
                callback.onError(e);
            }
        }).start();
    }
    
    /**
     * Create safe response when service is unavailable
     */
    private FraudCheckResult createSafeResponse(String transactionId) {
        FraudCheckResult result = new FraudCheckResult();
        result.setTransactionId(transactionId);
        result.setFraud(false);
        result.setFraudProbability(0.0);
        result.setRiskScore(0.0);
        result.setRiskLevel("UNKNOWN");
        result.setRecommendedAction("REVIEW");
        return result;
    }
    
    /**
     * Callback interface for async fraud checks
     */
    public interface FraudCheckCallback {
        void onResult(FraudCheckResult result);
        void onError(Exception error);
    }
}
