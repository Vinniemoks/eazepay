"""
Fraud Detection Model
Uses rule-based and ML-based approaches to detect fraudulent transactions
"""

import numpy as np
from datetime import datetime, time
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class FraudDetector:
    def __init__(self):
        self.model_version = "1.0.0"
        self._loaded = True
        
        # Rule-based thresholds
        self.high_amount_threshold = 50000  # KES
        self.velocity_threshold = 5  # transactions per hour
        self.unusual_time_start = time(22, 0)  # 10 PM
        self.unusual_time_end = time(6, 0)    # 6 AM
        
    def is_loaded(self) -> bool:
        return self._loaded
    
    def predict(self, features: Dict) -> Dict:
        """
        Predict if transaction is fraudulent
        """
        reasons = []
        risk_score = 0.0
        
        # Rule 1: High amount transactions
        if features.get('amount', 0) > self.high_amount_threshold:
            risk_score += 0.3
            reasons.append(f"High transaction amount (>{self.high_amount_threshold} KES)")
        
        # Rule 2: Unusual time
        if features.get('is_unusual_time', False):
            risk_score += 0.2
            reasons.append("Transaction at unusual time (10 PM - 6 AM)")
        
        # Rule 3: High velocity
        if features.get('transaction_velocity', 0) > self.velocity_threshold:
            risk_score += 0.25
            reasons.append(f"High transaction velocity (>{self.velocity_threshold}/hour)")
        
        # Rule 4: New account
        if features.get('account_age_days', 365) < 7:
            risk_score += 0.15
            reasons.append("New account (< 7 days old)")
        
        # Rule 5: Round amount (common in fraud)
        if features.get('is_round_amount', False):
            risk_score += 0.1
            reasons.append("Round transaction amount")
        
        # Rule 6: Different location
        if features.get('location_change', False):
            risk_score += 0.2
            reasons.append("Transaction from different location")
        
        # Rule 7: New device
        if features.get('new_device', False):
            risk_score += 0.15
            reasons.append("Transaction from new device")
        
        # Rule 8: High amount for user
        if features.get('amount_ratio', 1.0) > 5.0:
            risk_score += 0.25
            reasons.append("Amount significantly higher than user average")
        
        # Cap risk score at 1.0
        risk_score = min(risk_score, 1.0)
        
        # Determine risk level
        if risk_score >= 0.8:
            risk_level = "CRITICAL"
        elif risk_score >= 0.6:
            risk_level = "HIGH"
        elif risk_score >= 0.4:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        # Determine if fraud
        is_fraud = risk_score >= 0.7
        
        return {
            'is_fraud': is_fraud,
            'fraud_probability': risk_score,
            'risk_score': risk_score * 100,  # 0-100 scale
            'risk_level': risk_level,
            'reasons': reasons if reasons else ["No fraud indicators detected"]
        }
    
    def _is_unusual_time(self, timestamp: str) -> bool:
        """Check if transaction is at unusual time"""
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            txn_time = dt.time()
            
            # Check if between 10 PM and 6 AM
            if self.unusual_time_start <= txn_time or txn_time <= self.unusual_time_end:
                return True
            return False
        except:
            return False
