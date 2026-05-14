#!/usr/bin/env python3
# dataset/retrain_from_feedback.py
# Weekly batch retrainer — reads farmer feedback from MySQL, retrains RandomForest

import os
import sys
import json
import time
import pandas as pd
from datetime import datetime

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR  = os.path.join(BASE_DIR, "..", "backend")
LOG_DIR      = os.path.join(BACKEND_DIR, "logs")
LOG_PATH     = os.path.join(LOG_DIR, "retrain.log")
INPUTS_CSV   = os.path.join(BASE_DIR, "farmer_inputs.csv")
MODEL_PATH   = os.path.join(BASE_DIR, "crop_recommendation_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "label_encoders.pkl")

MIN_NEW_ROWS = 20  # Minimum new feedback rows required to trigger retrain

os.makedirs(LOG_DIR, exist_ok=True)

# ── DB config (mirrors app/database.py) ──────────────────────────────────────
sys.path.insert(0, os.path.join(BACKEND_DIR))
from app.database import get_connection, init_db


# ── Logging ───────────────────────────────────────────────────────────────────
def log(msg: str):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def log_blank_lines():
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write("\n\n")


# ── Main ──────────────────────────────────────────────────────────────────────
def retrain():
    start = time.time()
    log("RETRAIN START")

    try:
        init_db()
    except Exception as e:
        log(f"DB init failed: {e}")
        log_blank_lines()
        return

    # 1. Count unprocessed feedback rows
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute(
            """
            SELECT f.id, f.farmer_id, f.farm_id, f.chosen_crop, f.chosen_at,
                   fd.data_json
            FROM farmer_feedback f
            JOIN farm_data fd ON fd.farm_id = f.farm_id
            WHERE f.processed = FALSE
            ORDER BY f.chosen_at ASC
            """
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
    except Exception as e:
        log(f"DB query failed: {e}")
        log_blank_lines()
        return

    count = len(rows)
    log(f"{count} new feedback rows found")

    if count < MIN_NEW_ROWS:
        log(f"Skipped — minimum {MIN_NEW_ROWS} rows required (found {count})")
        log(f"RETRAIN END — {round(time.time() - start, 1)}s")
        log_blank_lines()
        return

    # 2. Build new training rows
    new_rows = []
    feedback_ids = []
    for row in rows:
        try:
            farm = json.loads(row["data_json"])
            new_rows.append({
                "row_index":      len(new_rows),
                "nitrogen":       float(farm.get("nitrogen", 0)),
                "phosphorus":     float(farm.get("phosphorus", 0)),
                "potassium":      float(farm.get("potassium", 0)),
                "ph":             float(farm.get("ph", farm.get("soilPh", 6.5))),
                "soil_moisture":  float(farm.get("soil_moisture", farm.get("soilMoisture", 50))),
                "organic_carbon": float(farm.get("organic_carbon", farm.get("organicCarbon", 1.2))),
                "soil_type":      farm.get("soilType", farm.get("soil_type", "Loamy")),
                "temperature":    float(farm.get("temperature", 25)),
                "rainfall":       float(farm.get("rainfall", 800)),
                "humidity":       float(farm.get("humidity", 60)),
                "budget":         float(farm.get("budget", 50000)),
                "climate_zone":   farm.get("climate_zone", "Tropical"),
                "crop_name":      row["chosen_crop"],
            })
            feedback_ids.append(row["id"])
        except Exception as e:
            log(f"Skipping malformed row id={row['id']}: {e}")

    if not new_rows:
        log("No valid rows after parsing — skipping retrain.")
        log_blank_lines()
        return

    # 3. Append to farmer_inputs.csv
    try:
        existing = pd.read_csv(INPUTS_CSV)
        new_df = pd.DataFrame(new_rows)
        new_df["row_index"] = range(len(existing), len(existing) + len(new_df))
        combined = pd.concat([existing, new_df], ignore_index=True)
        combined.to_csv(INPUTS_CSV, index=False)
        log(f"Appended {len(new_rows)} samples to farmer_inputs.csv (total: {len(combined)})")
    except Exception as e:
        log(f"CSV append failed: {e}")
        log_blank_lines()
        return

    # 4. Retrain model
    try:
        sys.path.insert(0, BASE_DIR)
        from train_crop_model import train_model
        train_model()
        log("RandomForest training complete — model saved.")
    except Exception as e:
        log(f"Training failed: {e}")
        log_blank_lines()
        return

    # 5. Hot-swap model in running service (if accessible)
    try:
        from app.routers.ml_router import recommender
        recommender.reload_model()
        log("Model hot-swapped in running service. No restart needed.")
    except Exception:
        log("Note: Model saved to disk. Server reload required to apply (or restart backend).")

    # 6. Mark feedback rows as processed
    try:
        conn = get_connection()
        cur = conn.cursor()
        fmt = ",".join(["%s"] * len(feedback_ids))
        cur.execute(f"UPDATE farmer_feedback SET processed = TRUE WHERE id IN ({fmt})", feedback_ids)
        conn.commit()
        cur.close()
        conn.close()
        log(f"Marked {len(feedback_ids)} feedback rows as processed.")
    except Exception as e:
        log(f"Could not mark rows processed: {e}")

    elapsed = round(time.time() - start, 1)
    log(f"RETRAIN END — {elapsed}s")
    log_blank_lines()


if __name__ == "__main__":
    retrain()
