from cryptography.fernet import Fernet
import os
import base64
from ..utils.logger import logger

class EncryptionService:
    def __init__(self):
        # In production, use proper key management (AWS KMS, etc.)
        encryption_key = os.getenv('ENCRYPTION_KEY', 'your_32_character_encryption_key_here')
        
        # Ensure key is 32 characters for Fernet
        if len(encryption_key) != 32:
            encryption_key = encryption_key.ljust(32, '0')[:32]
        
        # Create Fernet key from the encryption key
        key = base64.urlsafe_b64encode(encryption_key.encode()[:32])
        self.cipher = Fernet(key)
    
    def encrypt_template(self, template_data: str) -> str:
        """Encrypt biometric template data"""
        try:
            encrypted = self.cipher.encrypt(template_data.encode())
            return base64.b64encode(encrypted).decode()
        except Exception as e:
            logger.error(f"Encryption error: {e}")
            raise
    
    def decrypt_template(self, encrypted_data: str) -> str:
        """Decrypt biometric template data"""
        try:
            encrypted_bytes = base64.b64decode(encrypted_data.encode())
            decrypted = self.cipher.decrypt(encrypted_bytes)
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Decryption error: {e}")
            raise
