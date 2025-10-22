package com.afripay.transaction.ai;

public class FraudCheckResult {
    
    private String transactionId;
    private boolean isFraud;
    private double fraudProbability;
    private double riskScore;
    private String riskLevel;
    private String recommendedAction;
    
    // Constructors
    public FraudCheckResult() {
    }
    
    // Getters and Setters
    public String getTransactionId() {
        return transactionId;
    }
    
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
    
    public boolean isFraud() {
        return isFraud;
    }
    
    public void setFraud(boolean fraud) {
        isFraud = fraud;
    }
    
    public double getFraudProbability() {
        return fraudProbability;
    }
    
    public void setFraudProbability(double fraudProbability) {
        this.fraudProbability = fraudProbability;
    }
    
    public double getRiskScore() {
        return riskScore;
    }
    
    public void setRiskScore(double riskScore) {
        this.riskScore = riskScore;
    }
    
    public String getRiskLevel() {
        return riskLevel;
    }
    
    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }
    
    public String getRecommendedAction() {
        return recommendedAction;
    }
    
    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }
    
    public boolean shouldBlock() {
        return "BLOCK".equals(recommendedAction);
    }
    
    public boolean shouldReview() {
        return "REVIEW".equals(recommendedAction);
    }
    
    public boolean shouldApprove() {
        return "APPROVE".equals(recommendedAction);
    }
}
