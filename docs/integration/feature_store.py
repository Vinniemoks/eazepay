import pandas as pd
from typing import Dict, Any, Optional

# This is a conceptual in-memory feature store.
# In a real-world scenario, this would interact with a dedicated feature store
# like Feast, Redis, Cassandra, or a data warehouse.

class FeatureStore:
    def __init__(self):
        # Simulate a database or cache for user features
        self._user_features = {
            "user_123": {
                "avg_transaction_amount_24h": 150.0,
                "transaction_count_24h": 5,
                "avg_transaction_amount_7d": 120.0,
                "transaction_count_7d": 30,
                "last_transaction_location": {"latitude": -1.286389, "longitude": 36.817223},
                "account_age_days": 365,
                "kyc_verified": True,
                "device_ids_used": ["device_abc", "device_xyz"]
            },
            "user_456": {
                "avg_transaction_amount_24h": 500.0,
                "transaction_count_24h": 1,
                "avg_transaction_amount_7d": 600.0,
                "transaction_count_7d": 7,
                "last_transaction_location": {"latitude": -1.286389, "longitude": 36.817223},
                "account_age_days": 30,
                "kyc_verified": True,
                "device_ids_used": ["device_def"]
            }
        }

    def get_user_features(self, user_id: str) -> Dict[str, Any]:
        """Retrieves historical and aggregated features for a given user."""
        return self._user_features.get(user_id, {})

    def update_user_features(self, user_id: str, new_features: Dict[str, Any]):
        """Updates user features (e.g., after a transaction)."""
        self._user_features[user_id] = {**self._user_features.get(user_id, {}), **new_features}
        print(f"FeatureStore: Updated features for user {user_id}")

feature_store = FeatureStore()