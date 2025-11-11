from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class TransactionRequest(BaseModel):
    transaction_id: str
    user_id: str
    amount: float
    currency: str
    merchant_id: str
    merchant_category: str
    timestamp: str # ISO format
    device_id: Optional[str] = None
    location: Optional[Dict[str, float]] = None # {"latitude": ..., "longitude": ...}

class FraudDetectionResponse(BaseModel):
    transaction_id: str
    is_fraud: bool
    fraud_probability: float
    risk_score: float
    risk_level: str
    reasons: List[str]
    recommended_action: str
    model_version: str
    feedback_id: Optional[str] = None # For feedback loop tracking