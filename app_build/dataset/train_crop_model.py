"""
# File: train_crop_model.py
# Purpose: Train a Random Forest model for crop recommendation and allow interactive predictions.
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

# FILE PATHS
DATA_PATH = r"c:\Projects\vyaas\dataset\farmer_inputs.csv"
MODEL_PATH = r"c:\Projects\vyaas\dataset\crop_recommendation_model.pkl"
ENCODERS_PATH = r"c:\Projects\vyaas\dataset\label_encoders.pkl"

def train_model():
    """Train the Random Forest model and save it."""
    print("=" * 60)
    print("TRAINING RANDOM FOREST MODEL")
    print("=" * 60)
    
    df = pd.read_csv(DATA_PATH)
    print(f"Dataset Shape: {df.shape}")
    
    if df.isnull().sum().sum() > 0:
        df = df.dropna()
        
    X = df.drop(['crop_name', 'row_index'], axis=1)
    y = df['crop_name']
    
    encoders = {}
    
    categorical_cols = ['soil_type', 'climate_zone']
    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        encoders[col] = le
        
    target_le = LabelEncoder()
    y = target_le.fit_transform(y)
    encoders['target'] = target_le
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")
    
    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoders, ENCODERS_PATH)
    print(f"Model saved to: {MODEL_PATH}")
    
    return model, encoders

def predict_from_user_input():
    """Allow user to enter farmer inputs and get crop recommendations."""
    print("\n" + "=" * 60)
    print("CROP RECOMMENDATION - ENTER FARMER INPUTS")
    print("=" * 60)
    
    # Check if model exists, if not train it
    if not os.path.exists(MODEL_PATH) or not os.path.exists(ENCODERS_PATH):
        print("Model not found. Training now...")
        train_model()
    
    # Load model and encoders
    model = joblib.load(MODEL_PATH)
    encoders = joblib.load(ENCODERS_PATH)
    target_le = encoders['target']
    
    print("\nPlease enter farmer input values:")
    print("-" * 40)
    
    try:
        # Get numerical inputs
        nitrogen = float(input("Nitrogen (N) level (e.g., 50-200): "))
        phosphorus = float(input("Phosphorus (P) level (e.g., 20-200): "))
        potassium = float(input("Potassium (K) level (e.g., 20-200): "))
        ph = float(input("Soil pH (e.g., 5.0-8.5): "))
        soil_moisture = float(input("Soil Moisture % (e.g., 20-100): "))
        organic_carbon = float(input("Organic Carbon % (e.g., 0.5-4.0): "))
        temperature = float(input("Temperature °C (e.g., 10-45): "))
        rainfall = float(input("Annual Rainfall mm (e.g., 200-4000): "))
        humidity = float(input("Humidity % (e.g., 20-95): "))
        budget = float(input("Budget in INR (e.g., 15000-150000): "))
        
        # Get categorical inputs
        print("\nAvailable Soil Types:", list(encoders['soil_type'].classes_))
        soil_type_input = input("Enter Soil Type: ").strip()
        
        print("\nAvailable Climate Zones:", list(encoders['climate_zone'].classes_))
        climate_zone_input = input("Enter Climate Zone: ").strip()
        
        # Case-insensitive matching for categorical inputs
        soil_type_map = {s.lower(): s for s in encoders['soil_type'].classes_}
        climate_zone_map = {c.lower(): c for c in encoders['climate_zone'].classes_}
        
        soil_type = soil_type_map.get(soil_type_input.lower())
        climate_zone = climate_zone_map.get(climate_zone_input.lower())
        
        # Validate categorical inputs
        if soil_type is None:
            print(f"Error: Invalid soil type '{soil_type_input}'. Choose from: {list(encoders['soil_type'].classes_)}")
            return
        if climate_zone is None:
            print(f"Error: Invalid climate zone '{climate_zone_input}'. Choose from: {list(encoders['climate_zone'].classes_)}")
            return
        
        # Encode categorical features
        soil_type_enc = encoders['soil_type'].transform([soil_type])[0]
        climate_zone_enc = encoders['climate_zone'].transform([climate_zone])[0]
        
        # Create input DataFrame
        input_data = pd.DataFrame([[
            nitrogen, phosphorus, potassium, ph, soil_moisture, organic_carbon,
            soil_type_enc, temperature, rainfall, humidity, budget, climate_zone_enc
        ]], columns=['nitrogen', 'phosphorus', 'potassium', 'ph', 'soil_moisture', 
                     'organic_carbon', 'soil_type', 'temperature', 'rainfall', 
                     'humidity', 'budget', 'climate_zone'])
        
        # Predict
        probs = model.predict_proba(input_data)[0]
        top_3_indices = np.argsort(probs)[-3:][::-1]
        
        print("\n" + "=" * 60)
        print("TOP 3 CROP RECOMMENDATIONS")
        print("=" * 60)
        for i, idx in enumerate(top_3_indices):
            crop_name = target_le.inverse_transform([idx])[0]
            confidence = probs[idx] * 100
            print(f"{i+1}. {crop_name} ({confidence:.2f}% confidence)")
            
    except ValueError as e:
        print(f"Error: Invalid input. Please enter numeric values where required. ({e})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    predict_from_user_input()
