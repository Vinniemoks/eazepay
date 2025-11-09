from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class VerificationRequest(BaseModel):
    user_id: str
    sample: str

@app.get("/health")
def health():
    return {"status": "healthy", "service": "biometric-service"}

@app.post("/verify")
def verify(req: VerificationRequest):
    # Demo: Always return success with a mock score
    return {"user_id": req.user_id, "verified": True, "score": 0.98}