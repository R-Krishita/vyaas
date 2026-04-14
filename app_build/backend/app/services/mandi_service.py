# app/services/mandi_service.py
# Service for fetching real-time mandi prices from data.gov.in API

import httpx
from typing import Optional
from datetime import datetime, timedelta


class MandiService:
    """
    Service to fetch agricultural commodity prices from data.gov.in
    
    API Documentation: https://data.gov.in/
    Resource: Daily Market Prices of Commodities
    """
    
    def __init__(self, api_key: str, resource_id: str, base_url: str):
        self.api_key = api_key
        self.resource_id = resource_id
        self.base_url = base_url
        
        # Mapping of our crop names to data.gov.in commodity names
        self.crop_mapping = {
            "tulsi": "Tulsi (Basil)",
            "turmeric": "Turmeric",
            "ashwagandha": "Ashwagandha", 
            "ginger": "Ginger(Green)",
            "aloe vera": "Aloe Vera",
            "amla": "Amla(Nelli Kai)",
            "neem": "Neem Seed",
            "shatavari": "Shatavari",
            "brahmi": "Brahmi",
            "giloy": "Giloy",
            "haldi": "Turmeric"
        }
    
    async def get_mandi_prices(
        self, 
        crop: str, 
        state: Optional[str] = None,
        district: Optional[str] = None,
        limit: int = 10
    ) -> dict:
        """
        Fetch real-time mandi prices for a given crop.
        
        Args:
            crop: Crop name (e.g., "tulsi", "turmeric")
            state: Optional state filter (e.g., "Maharashtra")
            district: Optional district filter (e.g., "Pune")
            limit: Number of records to fetch
            
        Returns:
            Dictionary with mandi prices and metadata
        """
        
        # Map our crop name to data.gov.in commodity name
        commodity = self.crop_mapping.get(crop.lower(), crop.title())
        
        # Build API URL
        url = f"{self.base_url}/{self.resource_id}"
        
        params = {
            "api-key": self.api_key,
            "format": "json",
            "limit": limit,
            "filters[commodity]": commodity
        }
        
        # Add optional filters
        if state:
            params["filters[state]"] = state
        if district:
            params["filters[district]"] = district
            
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                return self._parse_mandi_response(data, crop)
                
        except httpx.HTTPStatusError as e:
            return self._get_fallback_data(crop, f"API Error: {e.response.status_code}")
        except httpx.RequestError as e:
            return self._get_fallback_data(crop, f"Connection Error: {str(e)}")
        except Exception as e:
            return self._get_fallback_data(crop, f"Error: {str(e)}")
    
    def _parse_mandi_response(self, data: dict, crop: str) -> dict:
        """Parse the data.gov.in API response into our format."""
        
        records = data.get("records", [])
        
        if not records:
            return self._get_fallback_data(crop, "No data available")
        
        # Extract mandi prices
        mandis = []
        prices = []
        
        for record in records:
            mandi_info = {
                "name": f"{record.get('market', 'Unknown')} Mandi",
                "state": record.get("state", ""),
                "district": record.get("district", ""),
                "price_min": float(record.get("min_price", 0)),
                "price_max": float(record.get("max_price", 0)),
                "price_modal": float(record.get("modal_price", 0)),
                "arrival_date": record.get("arrival_date", ""),
                "variety": record.get("variety", "")
            }
            mandis.append(mandi_info)
            prices.append(mandi_info["price_modal"])
        
        # Calculate statistics
        avg_price = sum(prices) / len(prices) if prices else 0
        min_price = min(prices) if prices else 0
        max_price = max(prices) if prices else 0
        
        # Sort mandis by price (highest first for best selling)
        mandis_sorted = sorted(mandis, key=lambda x: x["price_modal"], reverse=True)
        
        return {
            "success": True,
            "crop": crop,
            "data_source": "data.gov.in (Agmarknet)",
            "last_updated": datetime.now().isoformat(),
            "current_price_avg": round(avg_price, 2),
            "price_range": {
                "min": round(min_price, 2),
                "max": round(max_price, 2)
            },
            "trend": self._calculate_trend(prices),
            "nearby_mandis": mandis_sorted[:5],
            "best_mandi": mandis_sorted[0] if mandis_sorted else None,
            "total_mandis_found": len(mandis)
        }
    
    def _calculate_trend(self, prices: list) -> str:
        """Simple trend calculation based on price variance."""
        if len(prices) < 2:
            return "stable"
        
        avg = sum(prices) / len(prices)
        variance = sum((p - avg) ** 2 for p in prices) / len(prices)
        
        if variance > 1000:
            return "volatile"
        elif prices[0] > avg:
            return "increasing"
        elif prices[0] < avg:
            return "decreasing"
        return "stable"
    
    def _get_fallback_data(self, crop: str, error_message: str) -> dict:
        """Return placeholder data when API fails."""
        
        # Fallback prices for Ayurvedic crops (approximate market rates)
        fallback_prices = {
            "tulsi": 150,
            "turmeric": 180,
            "ashwagandha": 350,
            "ginger": 120,
            "aloe vera": 80,
            "amla": 60,
            "neem": 90,
            "shatavari": 400,
            "brahmi": 200,
            "giloy": 100
        }
        
        base_price = fallback_prices.get(crop.lower(), 150)
        
        return {
            "success": False,
            "error": error_message,
            "crop": crop,
            "data_source": "Fallback (offline data)",
            "last_updated": datetime.now().isoformat(),
            "current_price_avg": base_price,
            "price_range": {
                "min": base_price * 0.8,
                "max": base_price * 1.2
            },
            "trend": "stable",
            "nearby_mandis": [
                {
                    "name": "Local Mandi",
                    "price_modal": base_price,
                    "state": "Maharashtra",
                    "district": "Pune"
                }
            ],
            "note": "Using cached/fallback data. Connect to internet for live prices."
        }
    
    async def get_price_history(
        self, 
        crop: str, 
        days: int = 30
    ) -> dict:
        """
        Get price history for trend analysis.
        Note: data.gov.in may have limited historical data access.
        """
        
        # For now, return simulated history based on current price
        current_data = await self.get_mandi_prices(crop)
        base_price = current_data.get("current_price_avg", 150)
        
        # Generate simulated price history
        import random
        history = []
        for i in range(days):
            date = datetime.now() - timedelta(days=days - i)
            # Add some random variation
            variation = random.uniform(-0.1, 0.1)
            price = base_price * (1 + variation)
            history.append({
                "date": date.strftime("%Y-%m-%d"),
                "price": round(price, 2)
            })
        
        return {
            "crop": crop,
            "days": days,
            "history": history,
            "note": "Historical data simulated. Real historical API integration pending."
        }
