
class FarmService:
    # In-memory storage for demo purposes
    # In a real app, this would be a database call
    _storage = {}

    def save_farm_details(self, farm_data: dict):
        """
        Saves farm details. If farm_id is not provided, generates one.
        """
        farm_id = farm_data.get('farm_id', 'FARM_001')
        self._storage[farm_id] = farm_data
        print(f"✅ Saved farm details for {farm_id}: {farm_data}")
        return {**farm_data, "farm_id": farm_id}

    def get_farm_details(self, farm_id: str):
        """
        Retrieves farm details by ID.
        """
        return self._storage.get(farm_id)

farm_service = FarmService()
