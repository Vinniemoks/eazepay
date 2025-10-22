"""
AI/ML Service for Eazepay
Provides fraud detection, risk scoring, and predictive analytics
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import logging
from datetime import datetime

from .fraud_detector import FraudDetector
from .risk_scorer import RiskScorer
from .feature_engineer import FeatureEngineer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Eazepay AI/ML Service",
    description="Fraud detection and risk scoring for financial transactions",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML models
fraud_detector = FraudDetector()
risk_scorer = RiskScorer()
feature_engineer = FeatureEngineer()

# Request/Response Models
class TransactionRequest(BaseModel):
    transaction_id: str
    amount: float
    currency: str = "KES"
    from_account: str
    to_account: str
    merchant_category: Optional[str] = None
    location: Optional[str] = None
    device_id: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: Optional[str] = None
    user_id: Optional[str] = None

class FraudDetectionResponse(BaseModel):
    transaction_id: str
    is_fraud: bool
    fraud_probability: float
    risk_score: float
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    reasons: List[str]
    recommended_action: str  # APPROVE, REVIEW, BLOCK
    model_version: str

class RiskAssessmentRequest(BaseModel):
    user_id: str
    transaction_history: Optional[List[Dict]] = None
    account_age_days: Optional[int] = None
    kyc_verified: bool = False
    total_transactions: Optional[int] = None
    average_transaction_amount: Optional[float] = None

class RiskAssessmentResponse(BaseModel):
    user_id: str
    risk_score: float
    risk_level: str
    credit_limit: float
    reasons: List[str]
    model_version: str

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-ml-service",
        "timestamp": datetime.utcnow().isoformat(),
        "models": {
            "fraud_detector": fraud_detector.is_loaded(),
            "risk_scorer": risk_scorer.is_loaded()
        }
    }

# Fraud Detection Endpoint
@app.post("/api/fraud/detect", response_model=FraudDetectionResponse)
async def detect_fraud(request: TransactionRequest):
    """
    Detect if a transaction is potentially fraudulent
    """
    try:
        logger.info(f"Fraud detection request for transaction: {request.transaction_id}")
        
        # Engineer features
        features = feature_engineer.engineer_transaction_features(request.dict())
        
        # Detect fraud
        result = fraud_detector.predict(features)
        
        # Determine recommended action
        if result['fraud_probability'] > 0.9:
            action = "BLOCK"
        elif result['fraud_probability'] > 0.7:
            action = "REVIEW"
        else:
            action = "APPROVE"
        
        response = FraudDetectionResponse(
            transaction_id=request.transaction_id,
            is_fraud=result['is_fraud'],
            fraud_probability=result['fraud_probability'],
            risk_score=result['risk_score'],
            risk_level=result['risk_level'],
            reasons=result['reasons'],
            recommended_action=action,
            model_version=fraud_detector.model_version
        )
        
        logger.info(f"Fraud detection result: {action} (probability: {result['fraud_probability']:.2f})")
        return response
        
    except Exception as e:
        logger.error(f"Fraud detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Risk Assessment Endpoint
@app.post("/api/risk/assess", response_model=RiskAssessmentResponse)
async def assess_risk(request: RiskAssessmentRequest):
    """
    Assess customer risk and determine credit limit
    """
    try:
        logger.info(f"Risk assessment request for user: {request.user_id}")
        
        # Engineer features
        features = feature_engineer.engineer_user_features(request.dict())
        
        # Assess risk
        result = risk_scorer.predict(features)
        
        response = RiskAssessmentResponse(
            user_id=request.user_id,
            risk_score=result['risk_score'],
            risk_level=result['risk_level'],
            credit_limit=result['credit_limit'],
            reasons=result['reasons'],
            model_version=risk_scorer.model_version
        )
        
        logger.info(f"Risk assessment result: {result['risk_level']} (score: {result['risk_score']:.2f})")
        return response
        
    except Exception as e:
        logger.error(f"Risk assessment error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Batch Fraud Detection
@app.post("/api/fraud/batch")
async def batch_fraud_detection(transactions: List[TransactionRequest]):
    """
    Detect fraud for multiple transactions
    """
    try:
        results = []
        for txn in transactions:
            features = feature_engineer.engineer_transaction_features(txn.dict())
            result = fraud_detector.predict(features)
            results.append({
                "transaction_id": txn.transaction_id,
                "is_fraud": result['is_fraud'],
                "fraud_probability": result['fraud_probability']
            })
        
        return {"results": results, "count": len(results)}
        
    except Exception as e:
        logger.error(f"Batch fraud detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Model Info
@app.get("/api/models/info")
async def get_model_info():
    """
    Get information about loaded models
    """
    return {
        "fraud_detector": {
            "version": fraud_detector.model_version,
            "loaded": fraud_detector.is_loaded(),
            "type": "XGBoost Classifier"
        },
        "risk_scorer": {
            "version": risk_scorer.model_version,
            "loaded": risk_scorer.is_loaded(),
            "type": "Random Forest Regressor"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
