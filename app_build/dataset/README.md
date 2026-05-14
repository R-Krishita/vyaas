# VYAAS Crop Dataset - ML Training Data

## Overview

This folder contains the complete pipeline for the VYAAS Crop Recommendation Engine, from raw agronomic data to a trained Machine Learning model.

The workflow consists of three main stages:

1. **Base Data Collection**: Defining realistic constraints for 69 crops, heavily biased towards Ayurvedic varieties (47 Ayurvedic crops) to align with Vyaas's mission of utilizing idle post-harvest land.
2. **Synthetic Data Generation**: Simulating farmer scenarios to create a robust training dataset.
3. **Model Training**: Training a Random Forest Classifier to predict optimal crops based on soil, climate, and economic factors.

---

## 1. Base Data (The "Truth" Table)

We curate high-quality agronomic data for 69 crops. The dataset deliberately excludes primary season crops (like Cotton or Sugarcane) and perennial orchard crops (like Mango) to ensure recommendations are suitable for idle, post-harvest land recovery.

| File                            | Description                                                                                                |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `crops_merged.csv`              | **Master Table**: The single source of truth for all crop constraints, soil requirements, climate bounds, and economics. Used as the seed for generating synthetic data and directly by the backend ML service. |

---

## 2. Synthetic Dataset Generation

**File:** `dataset/farmer_inputs.csv` (~6,900 rows)  
**Script:** `generate_farmer_inputs.py`

### Why simulated data?

Real-world farmer data that captures every possible combination of soil, climate, and budget conditions for specific crops is difficult to obtain. To ensure our model is robust and generalizable, we generated synthetic data based on the "Truth" tables.

### How it was achieved:

- **Range-Based Simulation**: For each of the 69 crops, we generated multiple samples (default 100 per crop).
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
- **Multi-Class capability**: We have 69 distinct crop classes, and Random Forest handles multi-class classification natively.

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

