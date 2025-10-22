"""
Risk Scoring Model
Assesses customer creditworthiness and determines credit limits
"""

import logging
from typing import Dict

logger = logging.getLogger(__name__)

class RiskScorer:
    def __init__(self):
        self.model_version = "1.0.0"
        self._loaded = True
        
        # Base credit limits by risk level
        self.credit_limits = {
            'LOW': 100000,      # 100K KES
            'MEDIUM': 50000,    # 50K KES
            'HIGH': 20000,      # 20K KES
            'CRITICAL': 5000    # 5K KES
        }
        
    def is_loaded(self) -> bool:
        return self._loaded
    
    def predict(self, features: Dict) -> Dict:
        """
        Predict customer risk score and credit limit
        """
        reasons = []
        risk_score = 50.0  # Start at medium risk
        
        # Factor 1: KYC Verification
        if features.get('kyc_verified', False):
            risk_score -= 15
            reasons.append("KYC verified")
        else:
            risk_score += 20
            reasons.append("KYC not verified")
        
        # Factor 2: Account Age
        account_age = features.get('account_age_days', 0)
        if account_age > 365:
            risk_score -= 10
            reasons.append("Established account (>1 year)")
        elif account_age > 90:
            risk_score -= 5
            reasons.append("Mature account (>3 months)")
        elif account_age < 7:
            risk_score += 15
            reasons.append("Very new account (<7 days)")
        
        # Factor 3: Transaction History
        total_txns = features.get('total_transactions', 0)
        if total_txns > 100:
            risk_score -= 10
            reasons.append("Strong transaction history (>100 txns)")
        elif total_txns > 20:
            risk_score -= 5
            reasons.append("Good transaction history (>20 txns)")
        elif total_txns < 5:
            risk_score += 10
            reasons.append("Limited transaction history (<5 txns)")
        
        # Factor 4: Average Transaction Amount
        avg_amount = features.get('average_transaction_amount', 0)
        if avg_amount > 10000:
            risk_score -= 5
            reasons.append("High average transaction amount")
        elif avg_amount < 500:
            risk_score += 5
            reasons.append("Low average transaction amount")
        
        # Factor 5: Failed Transactions
        failed_txns = features.get('failed_transactions', 0)
        if failed_txns > 5:
            risk_score += 15
            reasons.append("Multiple failed transactions")
        
        # Factor 6: Dispute History
        disputes = features.get('disputes', 0)
        if disputes > 0:
            risk_score += 10 * disputes
            reasons.append(f"Transaction disputes ({disputes})")
        
        # Ensure risk score is between 0 and 100
        risk_score = max(0, min(100, risk_score))
        
        # Determine risk level
        if risk_score >= 75:
            risk_level = "CRITICAL"
        elif risk_score >= 60:
            risk_level = "HIGH"
        elif risk_score >= 40:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        # Calculate credit limit
        base_limit = self.credit_limits[risk_level]
        
        # Adjust based on transaction history
        if total_txns > 100:
            credit_limit = base_limit * 1.5
        elif total_txns > 50:
            credit_limit = base_limit * 1.2
        else:
            credit_limit = base_limit
        
        # Adjust based on KYC
        if not features.get('kyc_verified', False):
            credit_limit *= 0.5
        
        return {
            'risk_score': risk_score,
            'risk_level': risk_level,
            'credit_limit': credit_limit,
            'reasons': reasons
        }
