from pydantic import BaseModel
from typing import Optional

class EnrollmentRequest(BaseModel):
    user_id: str
    biometric_type: str
    
class VerificationRequest(BaseModel):
    user_id: str
    biometric_type: str
