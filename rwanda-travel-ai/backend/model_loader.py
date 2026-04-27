from pathlib import Path
from typing import Any

MODEL_PATH = Path(__file__).with_name("ml_model.pkl")


class LocalFallbackModel:
    def _transport_factor(self, transport_type) -> float:
        if isinstance(transport_type, str):
            value = transport_type.strip().lower()
            mapping = {
                "bus": 1.0,
                "moto": 0.7,
                "motorbike": 0.7,
                "taxi": 1.8,
                "car": 1.5,
                "boat": 1.2,
            }
            return mapping.get(value, 1.0)

        numeric_value = float(transport_type)
        numeric_mapping = {
            0.0: 1.0,
            1.0: 0.7,
            2.0: 1.8,
            3.0: 1.5,
        }
        return numeric_mapping.get(numeric_value, 1.0)

    def _demand_factor(self, demand) -> float:
        if isinstance(demand, str):
            value = demand.strip().lower()
            mapping = {
                "low": 0.9,
                "medium": 1.0,
                "normal": 1.0,
                "high": 1.2,
                "peak": 1.35,
            }
            return mapping.get(value, 1.0)

        numeric_value = float(demand)
        numeric_mapping = {
            0.0: 0.9,
            1.0: 1.0,
            2.0: 1.2,
            3.0: 1.35,
        }
        return numeric_mapping.get(numeric_value, 1.0)

    def predict(self, input_data: Any):
        predictions = []

        for _, row in input_data.iterrows():
            distance = float(row["Distance_km"])
            transport_factor = self._transport_factor(row["transport_type"])
            demand_factor = self._demand_factor(row["demand"])

            estimated_price = (400 + distance * 22) * transport_factor * demand_factor
            predictions.append(round(estimated_price, 2))

        return predictions


_model = None

def get_model():
    global _model
    if _model is not None:
        return _model

    if not MODEL_PATH.exists():
        _model = LocalFallbackModel()
        return _model

    try:
        import joblib
        _model = joblib.load(MODEL_PATH)
    except Exception:
        _model = LocalFallbackModel()
    
    return _model
