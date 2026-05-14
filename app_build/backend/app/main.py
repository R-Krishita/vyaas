# app/main.py
# Smart Ayurvedic Crop Advisor — FastAPI entry point
# Startup: DB init → stale cache check → APScheduler (6:30 AM IST daily)

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import market_router, farm_router, ml_router
from app.routers.auth import router as auth_router
from app.config import get_settings
from app.database import init_db


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialise MySQL DB + create tables
    try:
        init_db()
    except Exception as e:
        print(f"[STARTUP] ⚠️  DB init failed: {e} — running in limited mode.")

    # 2. Start APScheduler for daily mandi refresh (6:30 AM IST)
    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        from apscheduler.triggers.cron import CronTrigger
        from app.routers.market import get_mandi_service

        settings = get_settings()
        mandi_service = get_mandi_service(settings)

        async def scheduled_mandi_refresh():
            print("[SCHEDULER] ⏰ 6:30 AM IST — Starting daily mandi price refresh...")
            await mandi_service.refresh_all_crops()

        scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")
        scheduler.add_job(
            scheduled_mandi_refresh,
            CronTrigger(hour=6, minute=30, timezone="Asia/Kolkata"),
            id="daily_mandi_refresh",
            replace_existing=True,
        )
        scheduler.start()
        print("[SCHEDULER] ✅ APScheduler started — daily mandi refresh at 6:30 AM IST")

        # 3. Startup lazy check — refresh immediately if prices are stale (> 24 hrs)
        if mandi_service.is_cache_stale():
            print("[STARTUP] 🔄 Mandi prices are stale — refreshing now in background...")
            asyncio.create_task(mandi_service.refresh_all_crops())
        else:
            print("[STARTUP] ✅ Mandi prices are fresh — no startup refresh needed.")

    except ImportError:
        print("[STARTUP] ⚠️  APScheduler not installed. Run: pip install APScheduler")
    except Exception as e:
        print(f"[STARTUP] ⚠️  Scheduler error: {e}")

    yield  # App is running
    # Shutdown cleanup if needed


# ── App initialisation ────────────────────────────────────────────────────────
app = FastAPI(
    lifespan=lifespan,
    title="Smart Ayurvedic Crop Advisor API",
    description="""
    🌿 Backend API for the Vyaas Smart Ayurvedic Crop Advisor mobile app.

    ## Features
    - **ML Crop Recommendations** — RandomForest model with farm-specific inputs
    - **Real-time Mandi Prices** — data.gov.in Agmarknet, refreshed daily at 6:30 AM IST
    - **Price History & Harvest Prediction** — Linear regression from accumulated daily prices
    - **Farmer Feedback Loop** — Explicit crop selection feeds weekly model retraining
    - **MySQL Persistence** — All data survives server restarts

    ## Data Source
    Prices from Government of India's Agmarknet database via data.gov.in API.
    """,
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(market_router)
app.include_router(farm_router.router)
app.include_router(ml_router.router)
app.include_router(auth_router)


@app.get("/")
async def root():
    return {
        "app": "Smart Ayurvedic Crop Advisor",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "ml_recommend":    "POST /api/ml/recommend",
            "ml_feedback":     "POST /api/ml/feedback",
            "crop_details":    "GET  /api/ml/crop-details?crop=Tulsi,Ashwagandha",
            "market_prices":   "GET  /api/market/prices?crop=tulsi",
            "price_history":   "GET  /api/market/prices/history?crop=turmeric",
            "harvest_predict": "GET  /api/market/predict-harvest?crop=tulsi&growth_days=90&current_price=150",
            "best_mandis":     "GET  /api/market/best-mandis?crop=ashwagandha",
        },
    }


@app.get("/health")
async def health_check():
    settings = get_settings()
    return {
        "status": "healthy",
        "version": "2.0.0",
        "api_key_configured": bool(
            settings.data_gov_api_key and settings.data_gov_api_key != "your_api_key_here"
        ),
        "data_source": "data.gov.in",
        "database": "MySQL via XAMPP",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
