"""Biometric processing helpers with optional OpenCV integration."""

import base64
from typing import Any, Dict, Optional

import numpy as np

from ..utils.logger import logger

try:  # pragma: no cover - platform dependent import
    import cv2  # type: ignore

    _CV2_IMPORT_ERROR: Optional[Exception] = None
    _CV2_AVAILABLE = True
except Exception as exc:  # pragma: no cover - executed when OpenCV is missing
    cv2 = None  # type: ignore
    _CV2_IMPORT_ERROR = exc
    _CV2_AVAILABLE = False

class BiometricProcessor:
    def __init__(self):
        self._opencv_available = _CV2_AVAILABLE
        self._opencv_error = _CV2_IMPORT_ERROR
        self.face_cascade = None
        self.face_recognizer = None

        if not self._opencv_available:
            logger.warning(
                "OpenCV is not available; biometric processing endpoints will be disabled (%s)",
                self._opencv_error,
            )
            return

        try:
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
        except Exception as exc:  # pragma: no cover - depends on local OpenCV data
            self.face_cascade = None
            logger.error("Failed to load OpenCV face cascade: %s", exc)

        try:
            face_module = getattr(cv2, "face", None)
            if face_module is not None:
                self.face_recognizer = face_module.LBPHFaceRecognizer_create()
        except Exception as exc:  # pragma: no cover - optional component
            self.face_recognizer = None
            logger.warning("Failed to initialize LBPH face recognizer: %s", exc)

    def _require_opencv(self, operation: str) -> None:
        if not self._opencv_available or cv2 is None:
            message = (
                f"{operation} requires OpenCV. Install 'opencv-python-headless' and a NumPy version "
                "compatible with your platform (for NumPy 2.x support rebuild native extensions)."
            )
            if self._opencv_error:
                message += f" Original import error: {self._opencv_error}."
            raise RuntimeError(message)
        
    async def process_fingerprint(self, image_data: bytes) -> Dict[str, Any]:
        """Process fingerprint image and extract features"""
        try:
            self._require_opencv("Fingerprint processing")

            # Convert bytes to numpy array
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
            
            if image is None:
                raise ValueError("Invalid image data")
            
            # Enhance fingerprint image
            enhanced = self._enhance_fingerprint(image)
            
            # Extract minutiae (simplified)
            minutiae = self._extract_minutiae(enhanced)
            
            # Create template
            template = self._create_fingerprint_template(minutiae)
            
            # Assess quality
            quality = self._assess_fingerprint_quality(enhanced)
            
            return {
                'template': base64.b64encode(template).decode(),
                'quality': quality,
                'minutiae_count': len(minutiae)
            }
            
        except Exception as e:
            logger.error(f"Fingerprint processing error: {e}")
            raise ValueError(f"Fingerprint processing failed: {str(e)}")
    
    async def process_face(self, image_data: bytes) -> Dict[str, Any]:
        """Process face image and extract features"""
        try:
            self._require_opencv("Face processing")

            # Convert bytes to numpy array
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError("Invalid image data")
            
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            if not self.face_cascade:
                raise RuntimeError("OpenCV face cascade is not available.")

            faces = self.face_cascade.detectMultiScale(
                gray, 
                scaleFactor=1.3, 
                minNeighbors=5,
                minSize=(30, 30)
            )
            
            if len(faces) == 0:
                raise ValueError("No face detected in image")
            
            if len(faces) > 1:
                raise ValueError("Multiple faces detected - please use image with single face")
            
            # Extract face ROI
            (x, y, w, h) = faces[0]
            face_roi = gray[y:y+h, x:x+w]
            
            # Normalize face size
            face_roi = cv2.resize(face_roi, (100, 100))
            
            # Extract features using histogram
            features = self._extract_face_features(face_roi)
            
            # Assess quality
            quality = self._assess_face_quality(face_roi)
            
            return {
                'template': base64.b64encode(features).decode(),
                'quality': quality,
                'face_bounds': [int(x), int(y), int(w), int(h)]
            }
            
        except Exception as e:
            logger.error(f"Face processing error: {e}")
            raise ValueError(f"Face processing failed: {str(e)}")
    
    def compare_fingerprint_templates(self, template1: str, template2: str) -> float:
        """Compare two fingerprint templates"""
        try:
            # Decode templates
            t1_bytes = base64.b64decode(template1)
            t2_bytes = base64.b64decode(template2)
            
            # Convert to numpy arrays
            arr1 = np.frombuffer(t1_bytes, dtype=np.float32)
            arr2 = np.frombuffer(t2_bytes, dtype=np.float32)
            
            # Ensure same length
            min_len = min(len(arr1), len(arr2))
            arr1 = arr1[:min_len]
            arr2 = arr2[:min_len]
            
            # Calculate cosine similarity
            similarity = self._cosine_similarity(arr1, arr2)
            return max(0.0, similarity)
            
        except Exception as e:
            logger.error(f"Template comparison error: {e}")
            return 0.0
    
    def compare_face_templates(self, template1: str, template2: str) -> float:
        """Compare two face templates"""
        try:
            # Decode templates
            t1_bytes = base64.b64decode(template1)
            t2_bytes = base64.b64decode(template2)
            
            # Convert to numpy arrays
            arr1 = np.frombuffer(t1_bytes, dtype=np.float32)
            arr2 = np.frombuffer(t2_bytes, dtype=np.float32)
            
            # Calculate correlation coefficient
            correlation = np.corrcoef(arr1, arr2)[0, 1]
            
            # Handle NaN case
            if np.isnan(correlation):
                return 0.0
            
            # Convert to positive similarity score
            return max(0.0, (correlation + 1) / 2)
            
        except Exception as e:
            logger.error(f"Face template comparison error: {e}")
            return 0.0
    
    def _enhance_fingerprint(self, image):
        """Enhance fingerprint image quality"""
        # Apply Gaussian blur
        blurred = cv2.GaussianBlur(image, (5, 5), 0)
        
        # Enhance contrast using CLAHE
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(blurred)
        
        return enhanced
    
    def _extract_minutiae(self, image):
        """Extract minutiae points (simplified implementation)"""
        # Apply threshold
        _, binary = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY)
        
        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        minutiae = []
        for contour in contours:
            if cv2.contourArea(contour) > 50:  # Filter small contours
                # Calculate moments
                M = cv2.moments(contour)
                if M["m00"] != 0:
                    cx = int(M["m10"] / M["m00"])
                    cy = int(M["m01"] / M["m00"])
                    minutiae.append((cx, cy))
        
        # Return top 20 minutiae points
        return minutiae[:20]
    
    def _create_fingerprint_template(self, minutiae):
        """Create fingerprint template from minutiae"""
        # Pad or truncate to fixed size
        template_size = 40  # 20 points * 2 coordinates
        template = np.zeros(template_size, dtype=np.float32)
        
        for i, (x, y) in enumerate(minutiae):
            if i * 2 + 1 < template_size:
                template[i * 2] = x
                template[i * 2 + 1] = y
        
        return template.tobytes()
    
    def _extract_face_features(self, face_roi):
        """Extract face features using histogram"""
        # Calculate histogram
        hist = cv2.calcHist([face_roi], [0], None, [256], [0, 256])
        
        # Normalize histogram
        hist = hist.flatten().astype(np.float32)
        hist = hist / (np.sum(hist) + 1e-7)  # Avoid division by zero
        
        return hist.tobytes()
    
    def _assess_fingerprint_quality(self, image):
        """Assess fingerprint image quality"""
        # Calculate sharpness using Laplacian variance
        laplacian_var = cv2.Laplacian(image, cv2.CV_64F).var()
        
        # Normalize to 0-1 scale
        quality = min(laplacian_var / 100.0, 1.0)
        return max(0.0, quality)
    
    def _assess_face_quality(self, face_roi):
        """Assess face image quality"""
        # Sharpness
        laplacian_var = cv2.Laplacian(face_roi, cv2.CV_64F).var()
        sharpness_quality = min(laplacian_var / 200.0, 1.0)
        
        # Brightness
        brightness = np.mean(face_roi)
        # Ideal range: 100-180
        brightness_quality = 1.0 - abs(brightness - 140) / 140
        brightness_quality = max(0.0, brightness_quality)
        
        # Combined quality
        quality = (sharpness_quality + brightness_quality) / 2
        return max(0.0, min(1.0, quality))
    
    def _cosine_similarity(self, arr1, arr2):
        """Calculate cosine similarity between two arrays"""
        dot_product = np.dot(arr1, arr2)
        norm_a = np.linalg.norm(arr1)
        norm_b = np.linalg.norm(arr2)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        return dot_product / (norm_a * norm_b)
