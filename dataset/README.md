# VYAAS Crop Dataset - ML Training Data

## Overview

This folder contains the complete pipeline for the VYAAS Crop Recommendation Engine, from raw agronomic data to a trained Machine Learning model.

The workflow consists of three main stages:

1. **Base Data Collection**: Defining realistic constraints for 60 crops.
2. **Synthetic Data Generation**: Simulating 500,000+ farmer scenarios to create a robust training dataset.
3. **Model Training**: Training a Random Forest Classifier to predict optimal crops based on soil, climate, and economic factors.

---

## 1. Base Data (The "Truth" Tables)

We started by manually curating high-quality agronomic data for 60 crops across varying categories (Ayurvedic, Cereal, Pulse, etc.).

| File                            | Description                                                                                                |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `crop_master.csv`               | Identity, category, and lifecycle metadata.                                                                |
| `crop_soil_requirements.csv`    | Soil pH, NPK needs, moisture, and organic carbon limits.                                                   |
| `crop_climate_requirements.csv` | Temperature, rainfall, humidity, and climate zone suitability.                                             |
| `crop_economics.csv`            | Yield, cultivation costs, market prices, and profit potential.                                             |
| `crops_merged.csv`              | **Master Table**: All the above joined into a single view. Used as the seed for generating synthetic data. |

---

## 2. Synthetic Dataset Generation

**File:** `dataset/farmer_inputs.csv` (~500k rows)  
**Script:** `generate_farmer_inputs.py`

### Why simulated data?

Real-world farmer data that captures every possible combination of soil, climate, and budget conditions for specific crops is difficult to obtain. To ensure our model is robust and generalizable, we generated synthetic data based on the "Truth" tables.

### How it was achieved:

- **Range-Based Simulation**: For each of the 60 crops, we generated thousands of samples.
- **Randomization**: We selected random values for inputs (e.g., pH, Nitrogen, Budget) _within the valid ranges_ defined in `crops_merged.csv` for that specific crop.
- **Noise Injection**: Added slight variations to make the model resilient to imperfect data or borderline conditions.
- **Shuffling**: The final dataset was shuffled to prevent order bias during training.

This resulted in `farmer_inputs.csv`, a large-scale dataset suitable for supervised learning.

---

## 3. Model Training

**Model:** Random Forest Classifier  
**Script:** `train_crop_model.py`  
**Artifacts:** `crop_recommendation_model.pkl` (Model), `label_encoders.pkl` (Encoders)

### Why Random Forest?

- **Handling Non-Linearity**: Crop suitability isn't linear. A crop might fail if it's too hot OR too cold, but thrive in the middle. Random Forest (an ensemble of Decision Trees) captures these complex, non-linear boundaries excellently.
- **Robustness**: It handles a mix of numerical features (Temperature, pH) and categorical features (Soil Type, Climate Zone) effectively.
- **Feature Importance**: It implicitly selects the most relevant features for prediction, ignoring irrelevant noise.
- **Multi-Class capability**: We have 60 distinct crop classes, and Random Forest handles multi-class classification natively.

### Training Process

1. **Preprocessing**:
   - Dropped non-predictive columns (`row_index`).
   - **Label Encoding**: Converted categorical strings (`soil_type`: "Loamy", `climate_zone`: "Tropical") into numbers.
2. **Features (Inputs)**:
   - **Soil**: Nitrogen, Phosphorus, Potassium, pH, Moisture, Organic Carbon, Soil Type.
   - **Climate**: Temperature, Rainfall, Humidity, Climate Zone.
   - **Economics**: Budget (INR).
3. **Target (Output)**: `crop_name`
4. **Evaluation**: The model was trained on 80% of the data and validated on 20% to ensure high accuracy.

---

## 4. Usage

### Quick Start (Data Analysis)

```python
import pandas as pd
# Load the generated training data
df = pd.read_csv('dataset/farmer_inputs.csv')
```

### Running the Model

You can use the training script to run predictions interactively:

```bash
python dataset/train_crop_model.py
```

This will:

1. Check if the model exists (trains it if missing).
2. Prompt you for farmer inputs (N, P, K, pH, etc.).
3. Output the **Top 3 Recommended Crops** with confidence scores.

### Example Prediction Code

```python
import joblib
import pandas as pd

# Load assets
model = joblib.load('dataset/crop_recommendation_model.pkl')
encoders = joblib.load('dataset/label_encoders.pkl')

# Prepare input (example for Rice)
input_data = pd.DataFrame([[
    80, 40, 40, 5.5, 80, 0.8,
    encoders['soil_type'].transform(['Clayey'])[0],  # Encoded Soil
    25, 2000, 80, 50000,
    encoders['climate_zone'].transform(['Tropical'])[0] # Encoded Climate
]], columns=['nitrogen', 'phosphorus', 'potassium', 'ph', 'soil_moisture',
             'organic_carbon', 'soil_type', 'temperature', 'rainfall',
             'humidity', 'budget', 'climate_zone'])

# Predict
probs = model.predict_proba(input_data)[0]
# Get top result...
```
