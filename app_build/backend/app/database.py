# app/database.py
# MySQL database connection and table initialisation via XAMPP

import mysql.connector
from mysql.connector import pooling
import os

# ── Connection config ─────────────────────────────────────────────────────────
DB_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "port": int(os.getenv("MYSQL_PORT", 3306)),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", ""),
    "database": os.getenv("MYSQL_DATABASE", "vyaas_db"),
    "autocommit": True,
}

_pool = None


def get_pool() -> pooling.MySQLConnectionPool:
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="vyaas_pool",
            pool_size=5,
            **DB_CONFIG,
        )
    return _pool


def get_connection():
    """Return a connection from the pool."""
    return get_pool().get_connection()


# ── Table DDL ─────────────────────────────────────────────────────────────────
_TABLES = [
    """
    CREATE TABLE IF NOT EXISTS farmers (
        farmer_id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(15) NOT NULL,
        state VARCHAR(50) NOT NULL,
        district VARCHAR(50) NOT NULL,
        total_farm_size_acres DECIMAL(6,2) NOT NULL,
        current_crop VARCHAR(100),
        is_new BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE KEY uq_phone (phone)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    CREATE TABLE IF NOT EXISTS farm_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farmer_id VARCHAR(36) NOT NULL DEFAULT 'ANON',
        farm_id VARCHAR(50) NOT NULL,
        data_json LONGTEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT NOW()
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    CREATE TABLE IF NOT EXISTS mandi_prices_current (
        crop_name VARCHAR(100) PRIMARY KEY,
        min_price DECIMAL(10,2),
        max_price DECIMAL(10,2),
        modal_price DECIMAL(10,2),
        mandis_json LONGTEXT,
        data_source ENUM('live','fallback') DEFAULT 'fallback',
        fetched_at TIMESTAMP DEFAULT NOW()
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    CREATE TABLE IF NOT EXISTS mandi_price_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        crop_name VARCHAR(100) NOT NULL,
        modal_price DECIMAL(10,2),
        min_price DECIMAL(10,2),
        max_price DECIMAL(10,2),
        recorded_date DATE NOT NULL,
        data_source ENUM('live','fallback'),
        INDEX idx_crop_date (crop_name, recorded_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    CREATE TABLE IF NOT EXISTS farmer_feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farmer_id VARCHAR(36),
        farm_id VARCHAR(50),
        recommended_crops JSON,
        chosen_crop VARCHAR(100) NOT NULL,
        processed BOOLEAN DEFAULT FALSE,
        chosen_at TIMESTAMP DEFAULT NOW()
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
]


def init_db():
    """Create database and all tables if they don't exist."""
    # First connect without selecting a DB to create it if needed
    base_cfg = {k: v for k, v in DB_CONFIG.items() if k != "database"}
    base_cfg.pop("autocommit", None)
    try:
        conn = mysql.connector.connect(**base_cfg)
        cur = conn.cursor()
        cur.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        cur.execute(f"USE {DB_CONFIG['database']};")
        conn.commit()

        for ddl in _TABLES:
            cur.execute(ddl)
        conn.commit()
        cur.close()
        conn.close()
        print("[DB] ✅ MySQL connected — all tables ready.")
    except Exception as e:
        print(f"[DB] ❌ Could not initialise database: {e}")
        print("[DB] ⚠️  Make sure XAMPP MySQL is running on port 3306.")
        raise
