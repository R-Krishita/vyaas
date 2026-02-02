
import os
import joblib
import pandas as pd
import numpy as np

# Path to the dataset models - go up 4 levels from this file to reach project root
# This file: backend/app/services/recommendation_service.py
# Project dataset: dataset/crop_recommendation_model.pkl
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
MODEL_PATH = os.path.join(PROJECT_ROOT, "dataset", "crop_recommendation_model.pkl")
ENCODER_PATH = os.path.join(PROJECT_ROOT, "dataset", "label_encoders.pkl")

class RecommendationService:
    def __init__(self):
        self.model = None
        self.encoders = None
        self._load_model()

    def _load_model(self):
        """Loads the model and encoders if they exist."""
        try:
            if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
                self.model = joblib.load(MODEL_PATH)
                self.encoders = joblib.load(ENCODER_PATH)
                print("[OK] ML Model loaded successfully")
            else:
                print(f"[WARN] Model files not found at {MODEL_PATH}")
        except Exception as e:
            print(f"[ERROR] Error loading ML model: {e}")

    def predict_crops(self, farm_data: dict, top_k=3):
        """
        Predicts top k crops based on farm data.
        
        Args:
            farm_data (dict): Dictionary containing:
                - nitrogen, phosphorus, potassium, ph, 
                - soil_moisture, organic_carbon, soil_type
                - temperature, rainfall, humidity, budget, climate_zone
            top_k (int): Number of top recommendations to return (default 3)
            
        Returns:
            list: List of dictionaries with 'crop_name', 'match_score', 'profit_estimate'
        """
        if not self.model or not self.encoders:
            return []

        try:
            # Prepare input dataframe
            input_dict = {
                'nitrogen': [farm_data.get('nitrogen', 0)],
                'phosphorus': [farm_data.get('phosphorus', 0)],
                'potassium': [farm_data.get('potassium', 0)],
                'ph': [farm_data.get('ph', 0)],
                'soil_moisture': [farm_data.get('soil_moisture', 0)],
                'organic_carbon': [farm_data.get('organic_carbon', 0)],
                'soil_type': [self._encode_value('soil_type', farm_data.get('soil_type', 'Loamy'))],
                'temperature': [farm_data.get('temperature', 0)],
                'rainfall': [farm_data.get('rainfall', 0)],
                'humidity': [farm_data.get('humidity', 0)],
                'budget': [farm_data.get('budget', 0)],
                'climate_zone': [self._encode_value('climate_zone', farm_data.get('climate_zone', 'Tropical'))]
            }
            
            df = pd.DataFrame(input_dict)
            
            # Predict probabilities
            probs = self.model.predict_proba(df)[0]
            
            # Get top K classes
            top_indices = np.argsort(probs)[-top_k:][::-1]
            classes = self.model.classes_
            
            recommendations = []
            for rank, idx in enumerate(top_indices):
                crop_name = str(classes[idx])  # Ensure string
                score = float(round(probs[idx] * 100, 1))  # Convert numpy.float64 to Python float
                
                # Mock profit estimate (since we don't have this in the model output yet)
                # In refined version, we could look this up from crop_economics.csv
                profit_estimate = int((score * 500) + (input_dict['budget'][0] * 0.2))  # Ensure Python int
                
                recommendations.append({
                    "rank": int(rank + 1),
                    "crop_name": crop_name,
                    "crop_name_hi": crop_name, # Placeholder for translation
                    "match_score": score,
                    "profit_estimate": profit_estimate,
                    "reasons": ["Suitable for your soil", "Good market potential"],
                    "icon": "[plant]"
                })
                
            return recommendations

        except Exception as e:
            print(f"Prediction Error: {e}")
            return []

    def _encode_value(self, feature, value):
        """Helper to safely encode categorical values"""
        try:
            if feature in self.encoders:
                encoder = self.encoders[feature]
                # Check if value exists in encoder
                if value in encoder.classes_:
                    return encoder.transform([value])[0]
            return 0 # Default fallback
        except:
            return 0
