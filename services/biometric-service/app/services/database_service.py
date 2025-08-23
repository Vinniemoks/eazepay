import asyncpg
import os
from typing import Optional, Dict, Any
from ..utils.logger import logger
import uuid
from datetime import datetime

class DatabaseService:
    def __init__(self):
        self.pool = None
        
    async def connect(self):
        """Create database connection pool"""
        try:
            self.pool = await asyncpg.create_pool(
                host=os.getenv('DB_HOST', 'localhost'),
                port=int(os.getenv('DB_PORT', '5432')),
                user=os.getenv('DB_USER', 'developer'),
                password=os.getenv('DB_PASS', 'dev_password_2024!'),
                database=os.getenv('DB_NAME', 'afripay_dev'),
                min_size=5,
                max_size=20
            )
            logger.info("Database connection pool created")
            
            # Create table if it doesn't exist
            await self._create_tables()
            
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            raise
    
    async def disconnect(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed")
    
    async def _create_tables(self):
        """Create biometric templates table if not exists"""
        async with self.pool.acquire() as conn:
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS biometric_templates (
                    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL,
                    template_type VARCHAR(20) NOT NULL,
                    template_data TEXT NOT NULL,
                    quality DECIMAL(3,2) NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, template_type)
                )
            ''')
    
    async def store_biometric_template(self, user_id: str, template_type: str, 
                                     template_data: str, quality: float) -> str:
        """Store biometric template in database"""
        try:
            async with self.pool.acquire() as conn:
                # Use INSERT ... ON CONFLICT to handle updates
                result = await conn.fetchrow('''
                    INSERT INTO biometric_templates (user_id, template_type, template_data, quality)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (user_id, template_type) 
                    DO UPDATE SET 
                        template_data = $3,
                        quality = $4,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING template_id
                ''', user_id, template_type, template_data, quality)
                
                template_id = str(result['template_id'])
                logger.info(f"Stored biometric template {template_id} for user {user_id}")
                return template_id
                
        except Exception as e:
            logger.error(f"Database store error: {e}")
            raise
    
    async def get_biometric_template(self, user_id: str, template_type: str) -> Optional[Dict[str, Any]]:
        """Retrieve biometric template from database"""
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow('''
                    SELECT template_id, template_data, quality, created_at
                    FROM biometric_templates 
                    WHERE user_id = $1 AND template_type = $2 AND is_active = TRUE
                ''', user_id, template_type)
                
                if row:
                    return {
                        'template_id': str(row['template_id']),
                        'template_data': row['template_data'],
                        'quality': float(row['quality']),
                        'created_at': row['created_at']
                    }
                return None
                
        except Exception as e:
            logger.error(f"Database retrieve error: {e}")
            raise
    
    async def deactivate_template(self, user_id: str, template_type: str) -> bool:
        """Deactivate a biometric template"""
        try:
            async with self.pool.acquire() as conn:
                result = await conn.execute('''
                    UPDATE biometric_templates 
                    SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = $1 AND template_type = $2
                ''', user_id, template_type)
                
                return result == 'UPDATE 1'
                
        except Exception as e:
            logger.error(f"Database deactivate error: {e}")
            raise
