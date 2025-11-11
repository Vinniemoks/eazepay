import joblib
import pandas as pd
from datetime import datetime
from typing import Dict, Any, List
from sklearn.ensemble import GradientBoostingClassifier, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

from .feature_store import feature_store
from .models import TransactionRequest, FraudDetectionResponse

# --- Model Loading (Conceptual) ---
# In a real system, models would be loaded from a persistent storage (e.g., S3, Google Cloud Storage)
# and managed by a model registry (e.g., MLflow).
# For this conceptual implementation, we'll simulate model loading and training.

class FraudDetector:
    def __init__(self, model_path: str = "/app/models/fraud_model.joblib"):
        self.model_path = model_path
        self.gradient_boosting_model: Optional[GradientBoostingClassifier] = None
        self.isolation_forest_model: Optional[IsolationForest] = None
        self.model_version = "XGBoost_v1.2" # Simulating a deployed model version
        self._load_models()

    def _load_models(self):
        """Loads pre-trained models or trains simple ones if not found."""
        try:
            # Simulate loading a Gradient Boosting model
            self.gradient_boosting_model = joblib.load(self.model_path)
            print(f"FraudDetector: Loaded Gradient Boosting model from {self.model_path}")
        except FileNotFoundError:
            print("FraudDetector: Gradient Boosting model not found, training a dummy one.")
            self._train_dummy_gradient_boosting_model()

        # Isolation Forest for anomaly detection (can be trained on unlabeled data)
        self.isolation_forest_model = IsolationForest(random_state=42)
        # In a real scenario, this would be trained on a large dataset of normal transactions
        # For now, it's just initialized.
        print("FraudDetector: Initialized Isolation Forest model.")

    def _train_dummy_gradient_boosting_model(self):
        """Trains a very simple dummy Gradient Boosting model for demonstration."""
        # Dummy data for training
        data = {
            'amount':,
            'transaction_count_24h':,
            'account_age_days':,
            'is_fraud': # 0=legit, 1=fraud
        }
        df = pd.DataFrame(data)
        X = df[['amount', 'transaction_count_24h', 'account_age_days']]
        y = df['is_fraud']

        self.gradient_boosting_model = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
        self.gradient_boosting_model.fit(X, y)
        joblib.dump(self.gradient_boosting_model, self.model_path)
        print(f"FraudDetector: Dummy Gradient Boosting model trained and saved to {self.model_path}")

    def _extract_features(self, transaction: TransactionRequest, user_features: Dict[str, Any]) -> pd.DataFrame:
        """Extracts and engineers features for the model."""
        # Combine real-time transaction data with historical user features
        features = {
            'amount': transaction.amount,
            'transaction_count_24h': user_features.get('transaction_count_24h', 0),
            'account_age_days': user_features.get('account_age_days', 0),
            # Example of a new engineered feature: transaction_amount_vs_avg
            'transaction_amount_vs_avg': transaction.amount / (user_features.get('avg_transaction_amount_7d', transaction.amount) + 1e-6),
            # Placeholder for location/device anomaly detection
            'location_anomaly_score': 0.1, # Placeholder
            'device_anomaly_score': 0.05, # Placeholder
        }
        # Convert to DataFrame for model input
        return pd.DataFrame([features])

    async def detect_fraud(self, transaction: TransactionRequest) -> FraudDetectionResponse:
        """
        Detects fraud using a combination of advanced ML models and rules.
        """
        user_features = feature_store.get_user_features(transaction.user_id)
        features_df = self._extract_features(transaction, user_features)

        # --- Gradient Boosting Model Prediction ---
        fraud_probability_gb = 0.0
        if self.gradient_boosting_model:
            # Ensure features_df has the same columns as the training data
            # For this dummy, we'll just use the ones we trained on
            model_input_gb = features_df[['amount', 'transaction_count_24h', 'account_age_days']]
            fraud_probability_gb = self.gradient_boosting_model.predict_proba(model_input_gb)[:, 1]

        # --- Isolation Forest Anomaly Score (conceptual) ---
        # In a real scenario, this would be trained and used to detect outliers
        anomaly_score_if = 0.0 # self.isolation_forest_model.decision_function(features_df)

        # --- Combine model outputs and rules ---
        # A more sophisticated ensemble or meta-learner would combine these
        fraud_probability = max(fraud_probability_gb, features_df['location_anomaly_score'].iloc) # Example combination
        is_fraud = fraud_probability > 0.5 # Example threshold
        risk_score = min(fraud_probability * 100, 100)
        risk_level = "CRITICAL" if risk_score > 70 else ("HIGH" if risk_score > 50 else "LOW")
        reasons = []
        if is_fraud:
            reasons.append("High fraud probability from Gradient Boosting model.")
            if features_df['location_anomaly_score'].iloc > 0.5: reasons.append("Location anomaly detected.")

        recommended_action = "BLOCK" if risk_score > 70 else ("REVIEW" if risk_score > 50 else "APPROVE")

        return FraudDetectionResponse(
            transaction_id=transaction.transaction_id,
            is_fraud=is_fraud,
            fraud_probability=fraud_probability,
            risk_score=risk_score,
            risk_level=risk_level,
            reasons=reasons,
            recommended_action=recommended_action,
            model_version=self.model_version
        )

fraud_detector = FraudDetector()