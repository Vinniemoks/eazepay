"""
Feature Engineering for ML Models
Transforms raw transaction data into features for ML models
"""

from datetime import datetime, time
from typing import Dict
import logging

logger = logging.getLogger(__name__)

class FeatureEngineer:
    def __init__(self):
        pass
    
    def engineer_transaction_features(self, transaction: Dict) -> Dict:
        """
        Engineer features from transaction data
        """
        features = transaction.copy()
        
        # Time-based features
        if 'timestamp' in transaction and transaction['timestamp']:
            features['is_unusual_time'] = self._is_unusual_time(transaction['timestamp'])
            features['hour_of_day'] = self._get_hour(transaction['timestamp'])
            features['day_of_week'] = self._get_day_of_week(transaction['timestamp'])
        else:
            features['is_unusual_time'] = False
            features['hour_of_day'] = 12
            features['day_of_week'] = 3
        
        # Amount-based features
        amount = transaction.get('amount', 0)
        features['is_round_amount'] = self._is_round_amount(amount)
        features['amount_log'] = self._safe_log(amount)
        
        # Default values for features that require historical data
        # In production, these would be fetched from database
        features['transaction_velocity'] = 0
        features['account_age_days'] = 30
        features['location_change'] = False
        features['new_device'] = False
        features['amount_ratio'] = 1.0
        
        return features
    
    def engineer_user_features(self, user_data: Dict) -> Dict:
        """
        Engineer features from user data
        """
        features = user_data.copy()
        
        # Set defaults for missing features
        features.setdefault('account_age_days', 0)
        features.setdefault('total_transactions', 0)
        features.setdefault('average_transaction_amount', 0)
        features.setdefault('failed_transactions', 0)
        features.setdefault('disputes', 0)
        features.setdefault('kyc_verified', False)
        
        return features
    
    def _is_unusual_time(self, timestamp: str) -> bool:
        """Check if transaction is at unusual time (10 PM - 6 AM)"""
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            txn_time = dt.time()
            
            unusual_start = time(22, 0)  # 10 PM
            unusual_end = time(6, 0)     # 6 AM
            
            if unusual_start <= txn_time or txn_time <= unusual_end:
                return True
            return False
        except:
            return False
    
    def _get_hour(self, timestamp: str) -> int:
        """Extract hour from timestamp"""
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            return dt.hour
        except:
            return 12
    
    def _get_day_of_week(self, timestamp: str) -> int:
        """Extract day of week from timestamp (0=Monday, 6=Sunday)"""
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            return dt.weekday()
        except:
            return 3
    
    def _is_round_amount(self, amount: float) -> bool:
        """Check if amount is a round number"""
        return amount % 1000 == 0 or amount % 500 == 0
    
    def _safe_log(self, value: float) -> float:
        """Safe logarithm calculation"""
        import math
        return math.log(max(value, 1))
