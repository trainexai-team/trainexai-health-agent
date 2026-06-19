import psycopg2
import psycopg2.extras
from app.config import DATABASE_URL

def get_connection():
    """Get a database connection."""
    return psycopg2.connect(DATABASE_URL)

def init_db():
    """Create tables if they do not exist."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(100) UNIQUE NOT NULL,
            name VARCHAR(200),
            age INTEGER,
            gender VARCHAR(20),
            height_cm FLOAT,
            weight_kg FLOAT,
            goal VARCHAR(100),
            diet_preference VARCHAR(100),
            fitness_level VARCHAR(100),
            injury_note TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS checkins (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(100) NOT NULL,
            checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
            sleep_hours FLOAT,
            meals_description TEXT,
            workout_done BOOLEAN,
            water_litres FLOAT,
            mood_energy INTEGER,
            notes TEXT,
            raw_text TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id, checkin_date)
        );

        CREATE TABLE IF NOT EXISTS health_decisions (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(100) NOT NULL,
            decision_date DATE NOT NULL DEFAULT CURRENT_DATE,
            main_decision TEXT NOT NULL,
            nutrition_action TEXT,
            workout_action TEXT,
            accountability_message TEXT,
            consistency_score INTEGER,
            score_breakdown JSONB,
            is_fallback BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id, decision_date)
        );

        CREATE TABLE IF NOT EXISTS weekly_reports (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(100) NOT NULL,
            week_start DATE NOT NULL,
            week_end DATE NOT NULL,
            avg_consistency_score FLOAT,
            workout_adherence FLOAT,
            nutrition_trend TEXT,
            sleep_trend TEXT,
            biggest_improvement TEXT,
            biggest_problem TEXT,
            next_week_plan TEXT,
            generated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id, week_start, week_end)
        );
    """)
    conn.commit()
    cur.close()
    conn.close()
