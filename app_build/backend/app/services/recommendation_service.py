
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

# Emoji mapping for crops by name
CROP_ICONS = {
    # Ayurvedic
    "Kalmegh": "🌿", "Pashanbheda": "🪨", "Mandookparni": "🍀", "Bhringaraja": "🌼",
    "Vidanga": "🫐", "Kapikachu": "🫘", "Pippali": "🌶️", "Rasna": "🌾",
    "Kantakari": "🌵", "Ashwagandha": "🌱", "Vach": "🪴", "Bael": "🍈",
    "Aloe Vera": "🪴", "Shatavari": "🌿", "Neem": "🌳", "Brahmi": "🍃",
    "Daruhaldi": "🟡", "Punarnava": "🌸", "Senna": "🍂", "Guggul": "🪵",
    "Amla": "🫒", "Kokum": "🍇", "Gudmar": "🌿", "Nagakeshar": "🌺",
    "Jatamansi": "💐", "Tulsi": "🌿", "Kutki": "🌱", "Isabgol": "🌾",
    "Sarpgandha": "🐍", "Safed Musli": "🥬",
    # Cereal
    "Rice": "🌾", "Wheat": "🌾", "Maize": "🌽", "Pearl Millet": "🌾",
    "Sorghum": "🌾", "Finger Millet": "🌾",
    # Pulse
    "Chickpea": "🫘", "Pigeon Pea": "🫛", "Green Gram": "🫛", "Black Gram": "🫘",
    "Lentil": "🫘", "Kidney Bean": "🫘",
    # Oilseed
    "Soybean": "🫘", "Groundnut": "🥜", "Mustard": "🌻", "Sunflower": "🌻",
    # Cash Crop
    "Cotton": "☁️", "Jute": "🧶", "Sugarcane": "🎋",
    # Vegetable
    "Potato": "🥔", "Tomato": "🍅", "Brinjal": "🍆", "Okra": "🫑",
    "Cabbage": "🥬", "Cauliflower": "🥦",
    # Fruit
    "Mango": "🥭", "Banana": "🍌", "Guava": "🍐", "Papaya": "🍈", "Grapes": "🍇",
}

class RecommendationService:
    def __init__(self):
        self.model = None
        self.encoders = None
        self.target_encoder = None
        self._load_model()

    def _load_model(self):
        """Loads the model and encoders if they exist."""
        try:
            if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
                self.model = joblib.load(MODEL_PATH)
                self.encoders = joblib.load(ENCODER_PATH)
                self.target_encoder = self.encoders.get('target')
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
            
            # Normalize top-K scores so they sum to 100%
            raw_scores = [probs[idx] for idx in top_indices]
            total = sum(raw_scores)
            normalized = [(s / total) * 100 if total > 0 else 0 for s in raw_scores]
            
            recommendations = []
            for rank, (idx, norm_score) in enumerate(zip(top_indices, normalized)):
                # Decode the numeric class index back to the actual crop name
                if self.target_encoder is not None:
                    crop_name = str(self.target_encoder.inverse_transform([classes[idx]])[0])
                else:
                    crop_name = str(classes[idx])
                    
                score = float(round(norm_score, 1))
                
                # Assign confidence band based on normalized score
                if score >= 50:
                    confidence_band = "Strongly Suitable"
                elif score >= 40:
                    confidence_band = "Suitable"
                elif score >= 25:
                    confidence_band = "Moderately Suitable"
                else:
                    confidence_band = "Low Suitability"
                
                # Mock profit estimate (since we don't have this in the model output yet)
                # In refined version, we could look this up from crop_economics.csv
                profit_estimate = int((score * 500) + (input_dict['budget'][0] * 0.2))  # Ensure Python int
                
                # Get a relevant emoji icon for the crop, fallback to generic plant
                icon = CROP_ICONS.get(crop_name, "🌱")
                
                recommendations.append({
                    "rank": int(rank + 1),
                    "crop_name": crop_name,
                    "crop_name_hi": crop_name, # Placeholder for translation
                    "match_score": score,
                    "confidence_band": confidence_band,
                    "profit_estimate": profit_estimate,
                    "reasons": ["Suitable for your soil", "Good market potential"],
                    "icon": icon,
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
