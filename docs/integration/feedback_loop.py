import pandas as pd
from typing import Dict, Any, List
from datetime import datetime
import joblib
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

from .fraud_detector import FraudDetector # Import the FraudDetector to access its model

# This is a conceptual feedback loop mechanism.
# In a real system, labeled data would be stored in a data warehouse,
# and retraining would be orchestrated by a dedicated ML pipeline (e.g., Kubeflow, Airflow).

class FeedbackLoop:
    def __init__(self, fraud_detector: FraudDetector):
        self.fraud_detector = fraud_detector
        self._labeled_data: List[Dict[str, Any]] = [] # Stores confirmed fraud/false positive data

    def record_feedback(self, transaction_id: str, features: Dict[str, Any], is_fraud_confirmed: bool):
        """
        Records feedback for a transaction, to be used in model retraining.
        `features` should ideally be the feature vector used for the original prediction.
        """
        feedback_entry = {
            **features,
            'transaction_id': transaction_id,
            'is_fraud_confirmed': 1 if is_fraud_confirmed else 0,
            'feedback_timestamp': datetime.now().isoformat()
        }
        self._labeled_data.append(feedback_entry)
        print(f"FeedbackLoop: Recorded feedback for {transaction_id}. Confirmed Fraud: {is_fraud_confirmed}")

    def retrain_models(self):
        """
        Triggers retraining of the fraud detection models using accumulated labeled data.
        """
        if not self._labeled_data:
            print("FeedbackLoop: No new labeled data for retraining.")
            return

        print(f"FeedbackLoop: Retraining models with {len(self._labeled_data)} new labeled samples...")
        df = pd.DataFrame(self._labeled_data)

        # Assuming the dummy model features for simplicity
        if 'amount' in df.columns and 'transaction_count_24h' in df.columns and 'account_age_days' in df.columns:
            X = df[['amount', 'transaction_count_24h', 'account_age_days']]
            y = df['is_fraud_confirmed']

            # Retrain the Gradient Boosting model
            self.fraud_detector.gradient_boosting_model = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
            self.fraud_detector.gradient_boosting_model.fit(X, y)
            joblib.dump(self.fraud_detector.gradient_boosting_model, self.fraud_detector.model_path)
            self.fraud_detector.model_version = f"XGBoost_v{datetime.now().strftime('%Y%m%d%H%M%S')}"
            print(f"FeedbackLoop: Gradient Boosting model retrained. New version: {self.fraud_detector.model_version}")

            # Clear labeled data after retraining
            self._labeled_data = []
        else:
            print("FeedbackLoop: Insufficient features in labeled data for retraining.")

feedback_loop = FeedbackLoop(FraudDetector()) # Initialize with the fraud detector