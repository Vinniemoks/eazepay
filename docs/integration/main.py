from fastapi import FastAPI, HTTPException, BackgroundTasks
from typing import Dict, Any
import cron as cron_parser # Using cron-parser library for cron job scheduling

from .models import TransactionRequest, FraudDetectionResponse
from .fraud_detector import fraud_detector
from .feedback_loop import feedback_loop
from .feature_store import feature_store

app = FastAPI(
    title="Eazepay AI/ML Service",
    description="Advanced Fraud Detection and Risk Assessment",
    version="1.0.0",
)

@app.on_event("startup")
async def startup_event():
    print("AI/ML Service starting up...")
    # Schedule periodic retraining (conceptual)
    # In a real system, this would be an external orchestrator (e.g., Airflow, Kubernetes CronJob)
    # cron_schedule = os.getenv("RETRAIN_SCHEDULE_CRON", "0 0 * * *")
    # print(f"Scheduled model retraining with cron: {cron_schedule}")

@app.get("/health", summary="Health Check")
async def health_check():
    return {"status": "ok", "service": "ai-ml-service", "model_version": fraud_detector.model_version}

@app.post("/api/fraud/detect", response_model=FraudDetectionResponse, summary="Detect Fraudulent Transactions")
async def detect_fraud_endpoint(transaction: TransactionRequest):
    """
    Analyzes a transaction for potential fraud using advanced ML models.
    """
    response = await fraud_detector.detect_fraud(transaction)
    return response

@app.post("/api/feedback/record", summary="Record Feedback for Model Retraining")
async def record_feedback_endpoint(transaction_id: str, features: Dict[str, Any], is_fraud_confirmed: bool):
    feedback_loop.record_feedback(transaction_id, features, is_fraud_confirmed)
    return {"message": "Feedback recorded successfully."}