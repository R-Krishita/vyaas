# app/services/farm_service.py
# Persists farm submissions to MySQL farm_data table

import json
from app.database import get_connection


class FarmService:

    def save_farm_details(self, farm_data: dict) -> dict:
        """
        Saves farm details to MySQL.
        Uses farm_id as unique identifier per farmer session.
        """
        farm_id = farm_data.get("farm_id", "FARM_001")
        farmer_id = farm_data.get("farmer_id", "ANON")
        data_json = json.dumps(farm_data)

        try:
            conn = get_connection()
            cur = conn.cursor()
            # Remove old entry for this farm_id to keep latest
            cur.execute("DELETE FROM farm_data WHERE farm_id = %s", (farm_id,))
            cur.execute(
                "INSERT INTO farm_data (farmer_id, farm_id, data_json) VALUES (%s, %s, %s)",
                (farmer_id, farm_id, data_json),
            )
            conn.commit()
            cur.close()
            conn.close()
            print(f"[DB] ✅ Saved farm_data for farm_id={farm_id} farmer_id={farmer_id}")
        except Exception as e:
            print(f"[DB] ❌ Could not save farm data ({type(e).__name__}): {e}")
            raise  # surface the error to the router so it's not silently swallowed

        return {**farm_data, "farm_id": farm_id}

    def get_farm_details(self, farm_id: str) -> dict | None:
        """
        Retrieves latest farm details for a given farm_id from MySQL.
        Returns None if not found.
        """
        try:
            conn = get_connection()
            cur = conn.cursor()
            cur.execute(
                "SELECT data_json FROM farm_data WHERE farm_id = %s ORDER BY submitted_at DESC LIMIT 1",
                (farm_id,),
            )
            row = cur.fetchone()
            cur.close()
            conn.close()
            if row:
                return json.loads(row[0])
        except Exception as e:
            print(f"[DB] ❌ Could not retrieve farm data: {e}")
        return None

    def save_farmer_profile(self, farmer: dict) -> dict:
        """
        Upserts a farmer profile into the farmers table.
        """
        try:
            conn = get_connection()
            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO farmers
                    (farmer_id, name, phone, state, district, total_farm_size_acres, current_crop, is_new)
                VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    state = VALUES(state),
                    district = VALUES(district),
                    total_farm_size_acres = VALUES(total_farm_size_acres),
                    current_crop = VALUES(current_crop)
                """,
                (
                    farmer.get("farmer_id"),
                    farmer.get("name", ""),
                    farmer.get("phone", ""),
                    farmer.get("state", ""),
                    farmer.get("district", ""),
                    float(farmer.get("total_farm_size_acres", 1.0)),
                    farmer.get("current_crop", ""),
                ),
            )
            conn.commit()
            cur.close()
            conn.close()
            print(f"[DB] ✅ Farmer profile saved: {farmer.get('phone')}")
        except Exception as e:
            print(f"[DB] ❌ Could not save farmer profile: {e}")
            raise
        return farmer

    def get_farmer_by_phone(self, phone: str) -> dict | None:
        try:
            conn = get_connection()
            cur = conn.cursor(dictionary=True)
            cur.execute("SELECT * FROM farmers WHERE phone = %s", (phone,))
            row = cur.fetchone()
            cur.close()
            conn.close()
            return row
        except Exception as e:
            print(f"[DB] ❌ get_farmer_by_phone error: {e}")
        return None

    def get_farmer_by_id(self, farmer_id: str) -> dict | None:
        try:
            conn = get_connection()
            cur = conn.cursor(dictionary=True)
            cur.execute("SELECT * FROM farmers WHERE farmer_id = %s", (farmer_id,))
            row = cur.fetchone()
            cur.close()
            conn.close()
            return row
        except Exception as e:
            print(f"[DB] ❌ get_farmer_by_id error: {e}")
        return None

    def mark_farmer_active(self, farmer_id: str):
        """Flip is_new to FALSE after first recommendation is served."""
        try:
            conn = get_connection()
            cur = conn.cursor()
            cur.execute("UPDATE farmers SET is_new = FALSE WHERE farmer_id = %s", (farmer_id,))
            conn.commit()
            cur.close()
            conn.close()
        except Exception as e:
            print(f"[DB] ❌ mark_farmer_active error: {e}")


farm_service = FarmService()
