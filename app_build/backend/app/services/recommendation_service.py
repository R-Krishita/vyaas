
import os
import joblib
import pandas as pd
import numpy as np

# Path to the dataset models
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
MODEL_PATH = os.path.join(PROJECT_ROOT, "dataset", "crop_recommendation_model.pkl")
ENCODER_PATH = os.path.join(PROJECT_ROOT, "dataset", "label_encoders.pkl")
ECONOMICS_PATH = os.path.join(PROJECT_ROOT, "dataset", "crop_economics.csv")
MASTER_PATH = os.path.join(PROJECT_ROOT, "dataset", "crop_master.csv")

# Emoji mapping for crops by name
CROP_ICONS = {
    "Kalmegh": "🌿", "Pashanbheda": "🪨", "Mandookparni": "🍀", "Bhringaraja": "🌼",
    "Vidanga": "🫐", "Kapikachu": "🫘", "Pippali": "🌶️", "Rasna": "🌾",
    "Kantakari": "🌵", "Ashwagandha": "🌱", "Vach": "🪴", "Bael": "🍈",
    "Aloe Vera": "🪴", "Shatavari": "🌿", "Neem": "🌳", "Brahmi": "🍃",
    "Daruhaldi": "🟡", "Punarnava": "🌸", "Senna": "🍂", "Guggul": "🪵",
    "Amla": "🫒", "Kokum": "🍇", "Gudmar": "🌿", "Nagakeshar": "🌺",
    "Jatamansi": "💐", "Tulsi": "🌿", "Kutki": "🌱", "Isabgol": "🌾",
    "Sarpgandha": "🐍", "Safed Musli": "🥬",
    "Rice": "🌾", "Wheat": "🌾", "Maize": "🌽", "Pearl Millet": "🌾",
    "Sorghum": "🌾", "Finger Millet": "🌾",
    "Chickpea": "🫘", "Pigeon Pea": "🫛", "Green Gram": "🫛", "Black Gram": "🫘",
    "Lentil": "🫘", "Kidney Bean": "🫘",
    "Soybean": "🫘", "Groundnut": "🥜", "Mustard": "🌻", "Sunflower": "🌻",
    "Cotton": "☁️", "Jute": "🧶", "Sugarcane": "🎋",
    "Potato": "🥔", "Tomato": "🍅", "Brinjal": "🍆", "Okra": "🫑",
    "Cabbage": "🥬", "Cauliflower": "🥦",
    "Mango": "🥭", "Banana": "🍌", "Guava": "🍐", "Papaya": "🍈", "Grapes": "🍇",
}

class RecommendationService:
    def __init__(self):
        self.model = None
        self.encoders = None
        self.target_encoder = None
        self.economics_df = None
        self.master_df = None
        self._load_model()
        self._load_data()

    def _load_model(self):
        try:
            if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
                self.model = joblib.load(MODEL_PATH)
                self.encoders = joblib.load(ENCODER_PATH)
                self.target_encoder = self.encoders.get('target')
                print("[OK] ML Model loaded successfully")
        except Exception as e:
            print(f"[ERROR] Error loading ML model: {e}")

    def _load_data(self):
        try:
            if os.path.exists(ECONOMICS_PATH):
                self.economics_df = pd.read_csv(ECONOMICS_PATH)
            if os.path.exists(MASTER_PATH):
                self.master_df = pd.read_csv(MASTER_PATH)
        except Exception as e:
            print(f"[ERROR] Error loading CSV data: {e}")

    def predict_crops(self, farm_data: dict, top_k=3):
        if not self.model or not self.encoders:
            return []

        try:
            input_dict = {
                'nitrogen': [float(farm_data.get('nitrogen', 0))],
                'phosphorus': [float(farm_data.get('phosphorus', 0))],
                'potassium': [float(farm_data.get('potassium', 0))],
                'ph': [float(farm_data.get('ph', 6.5))],
                'soil_moisture': [float(farm_data.get('soil_moisture', 50))],
                'organic_carbon': [float(farm_data.get('organic_carbon', 1.2))],
                'soil_type': [self._encode_value('soil_type', farm_data.get('soil_type', 'Loamy'))],
                'temperature': [float(farm_data.get('temperature', 25))],
                'rainfall': [float(farm_data.get('rainfall', 800))],
                'humidity': [float(farm_data.get('humidity', 60))],
                'budget': [float(farm_data.get('budget', 50000))],
                'climate_zone': [self._encode_value('climate_zone', farm_data.get('climate_zone', 'Tropical'))]
            }
            
            df = pd.DataFrame(input_dict)
            probs = self.model.predict_proba(df)[0]
            top_indices = np.argsort(probs)[-top_k:][::-1]
            classes = self.model.classes_
            
            raw_scores = [probs[idx] for idx in top_indices]
            total = sum(raw_scores)
            normalized = [(s / total) * 100 if total > 0 else 0 for s in raw_scores]
            
            recommendations = []
            for rank, (idx, norm_score) in enumerate(zip(top_indices, normalized)):
                if self.target_encoder is not None:
                    crop_name = str(self.target_encoder.inverse_transform([classes[idx]])[0])
                else:
                    crop_name = str(classes[idx])
                    
                score = float(round(norm_score, 1))
                if score >= 50: confidence_band = "Strongly Suitable"
                elif score >= 40: confidence_band = "Suitable"
                elif score >= 25: confidence_band = "Moderately Suitable"
                else: confidence_band = "Low Suitability"
                
                profit_estimate = self._calculate_refined_profit(crop_name, score, input_dict['budget'][0])
                icon = CROP_ICONS.get(crop_name, "🌱")
                
                recommendations.append({
                    "rank": int(rank + 1),
                    "crop_name": crop_name,
                    "crop_name_hi": crop_name,
                    "match_score": score,
                    "confidence_band": confidence_band,
                    "profit_estimate": int(profit_estimate),
                    "reasons": self._get_reasons(crop_name, farm_data),
                    "icon": icon,
                })
                
            return recommendations
        except Exception as e:
            print(f"Prediction Error: {e}")
            return []

    def _calculate_refined_profit(self, crop_name, score, budget):
        if self.master_df is not None and self.economics_df is not None:
            # 1. Find crop_id from master_df
            crop_master = self.master_df[self.master_df['crop_name'].str.lower() == crop_name.lower()]
            if not crop_master.empty:
                crop_id = crop_master['crop_id'].values[0]
                
                # 2. Find economics from economics_df using crop_id
                crop_econ = self.economics_df[self.economics_df['crop_id'] == crop_id]
                if not crop_econ.empty:
                    yield_avg = (crop_econ['yield_min_per_acre'].values[0] + crop_econ['yield_max_per_acre'].values[0]) / 2
                    price_avg = (crop_econ['expected_market_price_min'].values[0] + crop_econ['expected_market_price_max'].values[0]) / 2
                    cost_avg = (crop_econ['cost_of_cultivation_min'].values[0] + crop_econ['cost_of_cultivation_max'].values[0]) / 2
                    
                    raw_profit = (yield_avg * price_avg) - cost_avg
                    return max(0, raw_profit * (score / 100))
        
        return (score * 500) + (budget * 0.2)

    def _get_reasons(self, crop_name, farm_data):
        reasons = ["Suitable for your soil", "Good market potential"]
        if float(farm_data.get('rainfall', 0)) > 1000:
            reasons.append("Thrives in high rainfall")
        elif float(farm_data.get('rainfall', 0)) < 500:
            reasons.append("Low water requirement")
            
        if self.master_df is not None and self.economics_df is not None:
            crop_master = self.master_df[self.master_df['crop_name'].str.lower() == crop_name.lower()]
            if not crop_master.empty:
                crop_id = crop_master['crop_id'].values[0]
                crop_econ = self.economics_df[self.economics_df['crop_id'] == crop_id]
                if not crop_econ.empty:
                    risk = crop_econ['pest_disease_risk'].values[0]
                    if risk == 'Low':
                        reasons.append("Low pest/disease risk")
        return reasons[:3]

    def _encode_value(self, feature, value):
        try:
            if feature in self.encoders:
                encoder = self.encoders[feature]
                if value in encoder.classes_:
                    return encoder.transform([value])[0]
            return 0 
        except:
            return 0
