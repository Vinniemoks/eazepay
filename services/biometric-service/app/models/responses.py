from pydantic import BaseModel
from typing import Optional

class BiometricResponse(BaseModel):
    success: bool
    template_id: Optional[str] = None
    quality: Optional[float] = None
    message: Optional[str] = None
    error: Optional[str] = None
