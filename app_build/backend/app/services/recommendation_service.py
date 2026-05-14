# app/services/recommendation_service.py
# ML crop recommendation service + farmer feedback recording

import os
import json
import joblib
import pandas as pd
import numpy as np
from app.database import get_connection

# ── File paths ────────────────────────────────────────────────────────────────
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
MODEL_PATH   = os.path.join(PROJECT_ROOT, "dataset", "crop_recommendation_model.pkl")
ENCODER_PATH = os.path.join(PROJECT_ROOT, "dataset", "label_encoders.pkl")
MERGED_PATH  = os.path.join(PROJECT_ROOT, "dataset", "crops_merged.csv")

# ── Crop icon map ─────────────────────────────────────────────────────────────
CROP_ICONS = {
    "Kalmegh": "🌿", "Pashanbheda": "🪨", "Mandookparni": "🍀", "Bhringaraja": "🌼",
    "Vidanga": "🫐", "Kapikachu": "🫘", "Pippali": "🌶️", "Rasna": "🌾",
    "Kantakari": "🌵", "Ashwagandha": "🌱", "Vach": "🪴", "Bael": "🍈",
    "Aloe Vera": "🪴", "Shatavari": "🌿", "Neem": "🌳", "Brahmi": "🍃",
    "Daruhaldi": "🟡", "Punarnava": "🌸", "Senna": "🍂", "Guggul": "🪵",
    "Amla": "🫒", "Kokum": "🍇", "Gudmar": "🌿", "Nagakeshar": "🌺",
    "Jatamansi": "💐", "Tulsi": "🌿", "Kutki": "🌱", "Isabgol": "🌾",
    "Sarpgandha": "🐍", "Safed Musli": "🥬", "Stevia": "🌿", "Vetiver": "🌾",
    "Lemongrass": "🌾", "Mint": "🌿", "Fenugreek": "🌱", "Moringa": "🌳",
    "Palash": "🌺", "Chirata": "🌿", "Mulethi": "🪵", "Shankhpushpi": "🌸",
    "Gokshura": "🌿", "Yashtimadhu": "🪵", "Arjun": "🌳", "Kalonji": "🌑",
    "Haritaki": "🫒", "Bibhitaki": "🫒", "Sarpagandha": "🐍",
    "Rice": "🌾", "Wheat": "🌾", "Maize": "🌽", "Pearl Millet": "🌾",
    "Sorghum": "🌾", "Finger Millet": "🌾", "Chickpea": "🫘",
    "Pigeon Pea": "🫛", "Green Gram": "🫛", "Black Gram": "🫘",
    "Lentil": "🫘", "Kidney Bean": "🫘", "Soybean": "🫘",
    "Groundnut": "🥜", "Mustard": "🌻", "Sunflower": "🌻",
    "Potato": "🥔", "Tomato": "🍅", "Brinjal": "🍆", "Okra": "🫑",
    "Cabbage": "🥬", "Cauliflower": "🥦",
}

# ── Legumes that fix nitrogen into soil ───────────────────────────────────────
LEGUMES = {"chickpea", "green gram", "black gram", "soybean", "pigeon pea", "lentil", "kidney bean"}

# # ── Condition Gap Intervention Map ────────────────────────────────────────────
# GAP_INTERVENTIONS = {
#     "temperature_high": {
#         "mild":   [
#             "Use shade nets during peak afternoon hours (12–4 PM)",
#             "Apply mulch (5–8 cm) to keep root zone cool",
#             "Shift sowing 3–4 weeks earlier to avoid peak summer heat",
#         ],
#         "severe": [
#             "Use drip irrigation for evaporative cooling of the canopy",
#             "Use white reflective mulch to reduce soil surface temperature",
#             "Monitor crop closely at flowering — heat stress causes pollen sterility",
#         ],
#     },
#     "temperature_low": {
#         "mild":   [
#             "Use black plastic mulch to absorb heat and warm root zone",
#             "Sow only after soil temperature consistently exceeds the crop minimum",
#         ],
#         "severe": [
#             "Use row covers or poly tunnels during cold spells",
#             "This crop may struggle through winter in your region — consider a protected nursery",
#         ],
#     },
#     "rainfall_deficit": {
#         "mild":   [
#             "Supplement with 2–3 light irrigation cycles per week",
#             "Drip irrigation reduces water loss by 40–60% vs flood irrigation",
#         ],
#         "severe": [
#             "Borewell or canal water access is essential for this crop in your area",
#             "Consider rainwater harvesting before the growing season starts",
#         ],
#     },
#     "soil_ph_low": {
#         "mild":   [
#             "Apply agricultural lime (200–500 kg/acre) to raise pH before sowing",
#             "Avoid ammonium-based fertilizers which acidify the soil further",
#         ],
#     },
#     "soil_ph_high": {
#         "mild":   [
#             "Apply sulfur powder (50–100 kg/acre) to gradually lower pH",
#             "Use acidifying fertilizers such as ammonium sulfate",
#         ],
#     },
#     "nitrogen_low": {
#         "mild":   [
#             "Apply compost or vermicompost (2–3 tonnes/acre) before sowing",
#             "Top-dress with urea (25–30 kg/acre) at 30 days after sowing",
#         ],
#     },
# }


class RecommendationService:
    def __init__(self):
        self.model = None
        self.encoders = None
        self.target_encoder = None
        self.merged_df = None
        self._load_model()
        self._load_data()

    # ── Model / data loading ──────────────────────────────────────────────────

    def _load_model(self):
        try:
            if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
                self.model = joblib.load(MODEL_PATH)
                self.encoders = joblib.load(ENCODER_PATH)
                self.target_encoder = self.encoders.get("target")
                print("[ML] Model loaded successfully")
        except Exception as e:
            print(f"[ML] Error loading model: {e}")

    def _load_data(self):
        try:
            if os.path.exists(MERGED_PATH):
                self.merged_df = pd.read_csv(MERGED_PATH)
                print(f"[ML] crops_merged.csv loaded ({len(self.merged_df)} crops)")
        except Exception as e:
            print(f"[ML] Error loading crops_merged.csv: {e}")

    def reload_model(self):
        print("[ML] Hot-swapping model...")
        self._load_model()
        print("[ML] Model reloaded.")

    # ── Core prediction pipeline ──────────────────────────────────────────────

    def predict_crops(self, farm_data: dict, top_k: int = 3) -> list:
        if not self.model or not self.encoders:
            return []
        try:
            input_dict = {
                "nitrogen":       [float(farm_data.get("nitrogen", 0))],
                "phosphorus":     [float(farm_data.get("phosphorus", 0))],
                "potassium":      [float(farm_data.get("potassium", 0))],
                "ph":             [float(farm_data.get("ph", farm_data.get("soilPh", 6.5)))],
                "soil_moisture":  [float(farm_data.get("soil_moisture", farm_data.get("soilMoisture", 50)))],
                "organic_carbon": [float(farm_data.get("organic_carbon", farm_data.get("organicCarbon", 1.2)))],
                "soil_type":      [self._encode_value("soil_type", farm_data.get("soilType", farm_data.get("soil_type", "Loamy")))],
                "temperature":    [float(farm_data.get("temperature", 25))],
                "rainfall":       [float(farm_data.get("rainfall", 800))],
                "humidity":       [float(farm_data.get("humidity", 60))],
                "budget":         [float(farm_data.get("budget", 50000))],
                "climate_zone":   [self._encode_value("climate_zone", farm_data.get("climate_zone", "Tropical"))],
            }

            df = pd.DataFrame(input_dict)
            probs = self.model.predict_proba(df)[0]
            classes = self.model.classes_

            # ── Stage 1: 20% suitability floor ───────────────────────────────
            # Sort all crops by raw probability (descending)
            all_sorted = sorted(
                [(float(p), int(cls)) for cls, p in zip(classes, probs)],
                key=lambda x: x[0], reverse=True
            )

            # Normalise relative to the TOP scorer so scores are meaningful %
            top_prob = all_sorted[0][0] if all_sorted else 1.0
            norm_scores = [
                (round(p / top_prob * 100, 1), cls)
                for p, cls in all_sorted
            ]

            # Apply 20% floor against normalised scores
            above_floor = [(score, cls) for score, cls in norm_scores if score >= 20.0]

            limited_options = False
            if len(above_floor) < top_k:
                # Fallback: take top_k regardless — flag so frontend knows
                above_floor = norm_scores[:max(top_k * 3, 10)]  # wider pool for filter engine
                limited_options = True
                print(f"[ML] Limited options — fewer than {top_k} crops above 20% floor")

            # ── Stage 2: Filter Engine ────────────────────────────────────────
            farm_size = float(farm_data.get("farmSize", farm_data.get("total_farm_size_acres", 1.0)))
            budget    = float(farm_data.get("budget", 50000))

            candidates = []
            for raw_score, cls_idx in above_floor:
                crop_name = (
                    str(self.target_encoder.inverse_transform([cls_idx])[0])
                    if self.target_encoder else str(cls_idx)
                )
                if self.merged_df is None:
                    continue
                row = self.merged_df[self.merged_df["crop_name"].str.lower() == crop_name.lower()]
                if row.empty:
                    continue
                crop_row = row.iloc[0]
                candidates.append({
                    "crop_name": crop_name,
                    "crop_row":  crop_row,
                    "score":     raw_score,
                })

            filtered = self._apply_filter_engine(candidates, farm_data, farm_size, budget)

            # ── Stage 3: Top K + build output ────────────────────────────────
            filtered = sorted(filtered, key=lambda x: x["score"], reverse=True)[:top_k]

            recommendations = []
            for rank, c in enumerate(filtered):
                crop_name = c["crop_name"]
                score     = float(round(c["score"], 1))
                crop_row  = c["crop_row"]

                if score >= 65:   confidence_band = "Strongly Suitable"
                elif score >= 40: confidence_band = "Suitable"
                elif score >= 20: confidence_band = "Moderately Suitable"
                else:             confidence_band = "Low Suitability"

                profit, yield_kg = self._calculate_profit(crop_name, score, budget, farm_size)
                advisory = self._generate_advisory(crop_row, farm_data)
                reasons  = self._get_reasons(crop_name, crop_row, farm_data, c)

                rec = {
                    "rank":               rank + 1,
                    "crop_name":          crop_name,
                    "crop_name_hi":       crop_name,
                    "match_score":        score,
                    "confidence_band":    confidence_band,
                    "profit_estimate":    int(profit),
                    "estimated_yield_kg": round(yield_kg, 1),
                    "farm_size_acres":    farm_size,
                    "reasons":            reasons,
                    "advisory":           advisory,
                    "icon":               CROP_ICONS.get(crop_name, "🌱"),
                    "limited_options":    limited_options,
                }
                if c.get("over_budget_badge"):
                    rec["budget_badge"] = c["over_budget_badge"]
                if c.get("weather_badge"):
                    rec["weather_badge"] = c["weather_badge"]
                if c.get("rotation_badge"):
                    rec["rotation_badge"] = c["rotation_badge"]

                recommendations.append(rec)

            return recommendations
        except Exception as e:
            print(f"[ML] Prediction error: {e}")
            import traceback; traceback.print_exc()
            return []

    # ── Filter Engine ─────────────────────────────────────────────────────────

    def _apply_filter_engine(self, candidates, farm_data, farm_size, budget):
        result = []
        for c in candidates:
            c = dict(c)  # copy so we can mutate score safely

            # Layer 1 — Budget
            c = self._budget_filter(c, farm_size, budget)
            if c is None:
                continue

            # Layer 2 — Weather penalty
            c = self._weather_penalty(c, farm_data)
            if c is None:
                continue

            # Layer 3a — Rotation restriction penalty
            c = self._rotation_restriction(c, farm_data)

            # Layer 3b — Legume nitrogen bonus
            c = self._legume_bonus(c, farm_data)

            # Layer 3c — Soil restoration bonus
            c = self._restoration_bonus(c)

            result.append(c)
        return result

    def _budget_filter(self, c, farm_size, budget):
        """Layer 1: demotion or removal based on cultivation cost vs budget."""
        r = c["crop_row"]
        try:
            min_cost = float(r["cost_of_cultivation_min"]) * farm_size
        except Exception:
            return c  # no cost data — let it pass

        over_pct = (min_cost - budget) / budget if budget > 0 else 0

        if over_pct <= 0:
            # Within budget — no change
            return c
        elif over_pct <= 0.40:
            # 10–40% over: demote
            c["score"] *= 0.75
            c["over_budget_badge"] = f"Over budget by ~{int(over_pct*100)}%"
        else:
            # >40% over budget
            if c["score"] < 65.0:
                print(f"[ML] Budget hard-remove: {c['crop_name']} (score {c['score']:.1f}%, cost ₹{int(min_cost):,} vs budget ₹{int(budget):,})")
                return None  # hard remove
            else:
                # High confidence — demote heavily but show
                c["score"] *= 0.60
                c["over_budget_badge"] = f"Well over budget — cost ≈ ₹{int(min_cost):,}"
        return c

    def _weather_penalty(self, c, farm_data):
        """Layer 2: 3-zone temperature + rainfall penalty."""
        r   = c["crop_row"]
        badges = []

        # Temperature check
        try:
            farm_temp  = float(farm_data.get("temperature", 25))
            temp_min   = float(r["temp_min_c"])
            temp_max   = float(r["temp_max_c"])

            if farm_temp < temp_min:
                delta = temp_min - farm_temp
            elif farm_temp > temp_max:
                delta = farm_temp - temp_max
            else:
                delta = 0

            if delta > 10:
                print(f"[ML] Weather hard-remove: {c['crop_name']} (temp delta {delta:.1f}°C)")
                return None
            elif delta > 5:
                c["score"] *= 0.60
                badges.append(f"High heat stress ({delta:.0f}°C outside range)")
            elif delta > 0:
                c["score"] *= 0.85
                badges.append(f"Mild heat stress ({delta:.0f}°C outside range)")
        except Exception:
            pass

        # Rainfall check
        try:
            farm_rain  = float(farm_data.get("rainfall", 800))
            rain_min   = float(r["annual_rainfall_min_mm"])

            if farm_rain < rain_min:
                deficit_pct = (rain_min - farm_rain) / rain_min
                if deficit_pct > 0.40:
                    print(f"[ML] Rainfall hard-remove: {c['crop_name']} (deficit {deficit_pct*100:.0f}%)")
                    return None
                elif deficit_pct > 0.20:
                    c["score"] *= 0.80
                    badges.append(f"Rainfall deficit — needs {int(rain_min)}mm, you have {int(farm_rain)}mm")
        except Exception:
            pass

        if badges:
            c["weather_badge"] = "; ".join(badges)
        return c

    def _rotation_restriction(self, c, farm_data):
        """Layer 3a: penalise if previous crop is in restrictions list."""
        prev_crop = str(farm_data.get("previousCrop", "")).strip().lower()
        if not prev_crop:
            return c
        try:
            restrictions_raw = str(c["crop_row"].get("previous_crop_restrictions", ""))
            restrictions = [x.strip().lower() for x in restrictions_raw.split("|") if x.strip()]
            if prev_crop in restrictions:
                c["score"] *= 0.50
                c["rotation_badge"] = f"Caution: Soil may carry residue from your previous {farm_data.get('previousCrop')} crop"
        except Exception:
            pass
        return c

    def _legume_bonus(self, c, farm_data):
        """Layer 3b: +20% score if previous crop was a legume AND this crop needs high nitrogen."""
        prev_crop = str(farm_data.get("previousCrop", "")).strip().lower()
        if prev_crop not in LEGUMES:
            return c
        try:
            n_req = str(c["crop_row"].get("n_requirement", "")).strip().lower()
            if n_req == "high":
                c["score"] *= 1.20
                c["legume_bonus"] = True
        except Exception:
            pass
        return c

    def _restoration_bonus(self, c):
        """Layer 3c: +5% for crops that improve soil for the next cycle."""
        try:
            sri = float(c["crop_row"].get("soil_restoration_index", 0))
            if sri >= 0.75:
                c["score"] *= 1.05
                c["restoration_bonus"] = True
        except Exception:
            pass
        return c

    # ── Condition Gap Advisor ─────────────────────────────────────────────────

    def _generate_advisory(self, crop_row, farm_data) -> list:
        """Compute condition gaps and return actionable interventions."""
        advisory = []

        try:
            farm_temp = float(farm_data.get("temperature", 25))
            temp_min  = float(crop_row["temp_min_c"])
            temp_max  = float(crop_row["temp_max_c"])

            if farm_temp > temp_max:
                delta = farm_temp - temp_max
                severity = "severe" if delta > 5 else "mild"
                advisory += GAP_INTERVENTIONS["temperature_high"][severity]
            elif farm_temp < temp_min:
                delta = temp_min - farm_temp
                severity = "severe" if delta > 5 else "mild"
                advisory += GAP_INTERVENTIONS["temperature_low"][severity]
        except Exception:
            pass

        try:
            farm_rain = float(farm_data.get("rainfall", 800))
            rain_min  = float(crop_row["annual_rainfall_min_mm"])
            if farm_rain < rain_min:
                deficit_pct = (rain_min - farm_rain) / rain_min
                severity = "severe" if deficit_pct > 0.40 else "mild"
                advisory += GAP_INTERVENTIONS["rainfall_deficit"][severity]
        except Exception:
            pass

        try:
            farm_ph  = float(farm_data.get("ph", farm_data.get("soilPh", 6.5)))
            ph_min   = float(crop_row["ph_min"])
            ph_max   = float(crop_row["ph_max"])
            if farm_ph < ph_min:
                advisory += GAP_INTERVENTIONS["soil_ph_low"]["mild"]
            elif farm_ph > ph_max:
                advisory += GAP_INTERVENTIONS["soil_ph_high"]["mild"]
        except Exception:
            pass

        try:
            n_req = str(crop_row.get("n_requirement", "")).strip().lower()
            farm_n = float(farm_data.get("nitrogen", 0))
            if n_req == "high" and farm_n < 120:
                advisory += GAP_INTERVENTIONS["nitrogen_low"]["mild"]
        except Exception:
            pass

        return advisory[:3]  # cap at 3 most important tips

    # ── Dynamic reason generation ─────────────────────────────────────────────

    def _get_reasons(self, crop_name: str, crop_row, farm_data: dict, candidate: dict) -> list:
        reasons = []

        try:
            farm_rain = float(farm_data.get("rainfall", 0))
            rain_min  = float(crop_row["annual_rainfall_min_mm"])
            rain_max  = float(crop_row["annual_rainfall_max_mm"])
            if farm_rain >= rain_min:
                reasons.append(f"Your {int(farm_rain)}mm rainfall suits this crop well")
            elif farm_rain >= rain_min * 0.80:
                reasons.append(f"Low-water crop — only needs {int(rain_min)}mm, fits your region")
        except Exception:
            pass

        try:
            farm_soil = str(farm_data.get("soilType", farm_data.get("soil_type", ""))).strip()
            ideal_soils = str(crop_row.get("ideal_soil_type", ""))
            if farm_soil and farm_soil.lower() in ideal_soils.lower():
                reasons.append(f"Well-suited to {farm_soil} soil — matches your farm")
        except Exception:
            pass

        try:
            farm_ph = float(farm_data.get("ph", farm_data.get("soilPh", 6.5)))
            if float(crop_row["ph_min"]) <= farm_ph <= float(crop_row["ph_max"]):
                reasons.append(f"Your soil pH of {farm_ph} is ideal for this crop")
        except Exception:
            pass

        if candidate.get("legume_bonus"):
            prev = farm_data.get("previousCrop", "your previous crop")
            reasons.append(f"Benefits from the nitrogen your {prev} left in the soil")

        if candidate.get("restoration_bonus"):
            reasons.append("Improves your soil health — prepares land for next season")

        try:
            farm_size = float(farm_data.get("farmSize", 1.0))
            budget    = float(farm_data.get("budget", 50000))
            min_cost  = float(crop_row["cost_of_cultivation_min"]) * farm_size
            if min_cost <= budget:
                reasons.append(f"Budget-friendly — estimated cultivation cost ₹{int(min_cost):,}")
        except Exception:
            pass

        if not reasons:
            reasons.append("Suitable for your soil and climate conditions")
            reasons.append("Good market potential in your region")

        return reasons[:3]

    # ── Crop detail lookup ────────────────────────────────────────────────────

    def get_crop_details(self, crop_names: list) -> list:
        details = []
        for name in crop_names:
            info = {"crop_name": name}
            if self.merged_df is not None:
                row = self.merged_df[self.merged_df["crop_name"].str.lower() == name.lower()]
                if not row.empty:
                    r = row.iloc[0]
                    info["growth_days"]     = int(r.get("growth_duration_days_max", 120))
                    info["growth_days_min"] = int(r.get("growth_duration_days_min", 90)) if "growth_duration_days_min" in r else info["growth_days"]
                    info["yield_avg"]       = float((r["yield_min_per_acre"] + r["yield_max_per_acre"]) / 2)
                    info["cost_avg"]        = float((r["cost_of_cultivation_min"] + r["cost_of_cultivation_max"]) / 2)
                    info["price_avg"]       = float((r["expected_market_price_min"] + r["expected_market_price_max"]) / 2)
                    info["soil_type"]       = str(r.get("ideal_soil_type", ""))
                    info["climate_zone"]    = str(r.get("climate_zone", ""))
            details.append(info)
        return details

    # ── Farmer feedback ───────────────────────────────────────────────────────

    def record_feedback(self, farmer_id: str, farm_id: str, recommended_crops: list, chosen_crop: str):
        try:
            conn = get_connection()
            cur  = conn.cursor()
            cur.execute(
                "INSERT INTO farmer_feedback (farmer_id, farm_id, recommended_crops, chosen_crop) VALUES (%s, %s, %s, %s)",
                (farmer_id, farm_id, json.dumps(recommended_crops), chosen_crop),
            )
            conn.commit()
            cur.close(); conn.close()
            print(f"[ML] Feedback recorded: farmer={farmer_id} chose={chosen_crop}")
        except Exception as e:
            print(f"[ML] Feedback recording error: {e}")

    def get_feedback_history(self, farmer_id: str) -> list:
        try:
            conn = get_connection()
            cur  = conn.cursor(dictionary=True)
            cur.execute(
                "SELECT farm_id, recommended_crops, chosen_crop, chosen_at FROM farmer_feedback WHERE farmer_id = %s ORDER BY chosen_at DESC",
                (farmer_id,)
            )
            rows = cur.fetchall()
            cur.close(); conn.close()
            for row in rows:
                if isinstance(row["recommended_crops"], str):
                    try: row["recommended_crops"] = json.loads(row["recommended_crops"])
                    except: pass
                if row["chosen_at"]:
                    row["chosen_at"] = row["chosen_at"].isoformat()
            return rows
        except Exception as e:
            print(f"[ML] History fetch error: {e}")
            return []

    # ── Private helpers ───────────────────────────────────────────────────────

    def _calculate_profit(self, crop_name: str, score: float, budget, farm_size: float):
        if self.merged_df is not None:
            row = self.merged_df[self.merged_df["crop_name"].str.lower() == crop_name.lower()]
            if not row.empty:
                r          = row.iloc[0]
                yield_avg  = (r["yield_min_per_acre"] + r["yield_max_per_acre"]) / 2
                price_avg  = (r["expected_market_price_min"] + r["expected_market_price_max"]) / 2
                cost_avg   = (r["cost_of_cultivation_min"] + r["cost_of_cultivation_max"]) / 2
                total_yield = yield_avg * farm_size
                profit      = max(0, total_yield * price_avg - cost_avg * farm_size) * (score / 100)
                return profit, total_yield
        return (float(score) * 500 + float(budget) * 0.2, 0.0)

    def _encode_value(self, feature: str, value) -> int:
        try:
            if feature in self.encoders:
                enc = self.encoders[feature]
                if value in enc.classes_:
                    return enc.transform([value])[0]
        except Exception:
            pass
        return 0
