from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
import os
from dotenv import load_dotenv
import asyncio
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()

# Import our modules
from app.services.biometric_processor import BiometricProcessor
from app.services.database_service import DatabaseService
from app.services.encryption_service import EncryptionService
from app.models.requests import EnrollmentRequest, VerificationRequest
from app.models.responses import BiometricResponse
from app.utils.logger import logger

# Database service instance
db_service = DatabaseService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Biometric Service...")
    await db_service.connect()
    yield
    # Shutdown
    logger.info("Shutting down Biometric Service...")
    await db_service.disconnect()

app = FastAPI(
    title="Eazepay Biometric Service",
    description="Biometric processing service for fingerprint, face, and voice recognition",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
biometric_processor = BiometricProcessor()
encryption_service = EncryptionService()

async def get_current_service(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # In production, validate the JWT token here
    return {"service": "identity-service"}  # Simplified for development

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "biometric-service",
        "version": "1.0.0"
    }

@app.post("/enroll/fingerprint")
async def enroll_fingerprint(
    user_id: str = Form(...),
    file: UploadFile = File(...),
    current_service: dict = Depends(get_current_service)
):
    """Enroll fingerprint for a user"""
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await file.read()
        
        # Process fingerprint
        result = await biometric_processor.process_fingerprint(image_data)
        
        # Encrypt template
        encrypted_template = encryption_service.encrypt_template(result['template'])
        
        # Store in database
        template_id = await db_service.store_biometric_template(
            user_id=user_id,
            template_type='FINGERPRINT',
            template_data=encrypted_template,
            quality=result['quality']
        )
        
        logger.info(f"Fingerprint enrolled for user {user_id}, template ID: {template_id}")
        
        return BiometricResponse(
            success=True,
            template_id=template_id,
            quality=result['quality'],
            message="Fingerprint enrolled successfully"
        )
        
    except RuntimeError as exc:
        logger.error(f"Fingerprint enrollment unavailable: {exc}")
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as e:
        logger.error(f"Fingerprint enrollment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enroll/face")
async def enroll_face(
    user_id: str = Form(...),
    file: UploadFile = File(...),
    current_service: dict = Depends(get_current_service)
):
    """Enroll face recognition for a user"""
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_data = await file.read()
        
        # Process face
        result = await biometric_processor.process_face(image_data)
        
        # Encrypt template
        encrypted_template = encryption_service.encrypt_template(result['template'])
        
        # Store in database
        template_id = await db_service.store_biometric_template(
            user_id=user_id,
            template_type='FACE',
            template_data=encrypted_template,
            quality=result['quality']
        )
        
        logger.info(f"Face enrolled for user {user_id}, template ID: {template_id}")
        
        return BiometricResponse(
            success=True,
            template_id=template_id,
            quality=result['quality'],
            message="Face enrolled successfully"
        )
        
    except RuntimeError as exc:
        logger.error(f"Face enrollment unavailable: {exc}")
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as e:
        logger.error(f"Face enrollment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/verify/fingerprint")
async def verify_fingerprint(
    user_id: str = Form(...),
    file: UploadFile = File(...),
    current_service: dict = Depends(get_current_service)
):
    """Verify fingerprint against enrolled template"""
    try:
        image_data = await file.read()
        
        # Process candidate fingerprint
        candidate_result = await biometric_processor.process_fingerprint(image_data)
        
        # Get enrolled template
        enrolled_template = await db_service.get_biometric_template(user_id, 'FINGERPRINT')
        if not enrolled_template:
            raise HTTPException(status_code=404, detail="No enrolled fingerprint found")
        
        # Decrypt template
        decrypted_template = encryption_service.decrypt_template(enrolled_template['template_data'])
        
        # Compare templates
        similarity = biometric_processor.compare_fingerprint_templates(
            decrypted_template, 
            candidate_result['template']
        )
        
        # Determine if verified (threshold: 0.7)
        verified = similarity > 0.7
        
        logger.info(f"Fingerprint verification for user {user_id}: {'SUCCESS' if verified else 'FAILED'} (confidence: {similarity:.3f})")
        
        return {
            "verified": verified,
            "confidence": round(similarity, 3),
            "quality": candidate_result['quality']
        }
        
    except RuntimeError as exc:
        logger.error(f"Fingerprint verification unavailable: {exc}")
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as e:
        logger.error(f"Fingerprint verification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/verify/face")
async def verify_face(
    user_id: str = Form(...),
    file: UploadFile = File(...),
    current_service: dict = Depends(get_current_service)
):
    """Verify face against enrolled template"""
    try:
        image_data = await file.read()
        
        # Process candidate face
        candidate_result = await biometric_processor.process_face(image_data)
        
        # Get enrolled template
        enrolled_template = await db_service.get_biometric_template(user_id, 'FACE')
        if not enrolled_template:
            raise HTTPException(status_code=404, detail="No enrolled face found")
        
        # Decrypt template
        decrypted_template = encryption_service.decrypt_template(enrolled_template['template_data'])
        
        # Compare templates
        similarity = biometric_processor.compare_face_templates(
            decrypted_template,
            candidate_result['template']
        )
        
        # Determine if verified (threshold: 0.75 for face)
        verified = similarity > 0.75
        
        logger.info(f"Face verification for user {user_id}: {'SUCCESS' if verified else 'FAILED'} (confidence: {similarity:.3f})")
        
        return {
            "verified": verified,
            "confidence": round(similarity, 3),
            "quality": candidate_result['quality']
        }
        
    except RuntimeError as exc:
        logger.error(f"Face verification unavailable: {exc}")
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as e:
        logger.error(f"Face verification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8001)),
        reload=os.getenv("PYTHON_ENV") == "development"
    )
