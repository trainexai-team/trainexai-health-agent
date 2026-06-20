from fastapi import APIRouter, HTTPException
from app.database import get_connection
from app.models import HealthResponse
import psycopg2.extras
from datetime import date, timedelta

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="ok",
        version="1.0.0",
        message="TrainexAI Health Agent API is running."
    )


@router.get("/demo-user")
def get_or_create_demo_user():
    """Get or create a demo user with sample data for hackathon demo."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        demo_user_id = "demo-user-001"

        # Check if demo user exists
        cur.execute("SELECT * FROM profiles WHERE user_id = %s", (demo_user_id,))
        existing = cur.fetchone()

        if not existing:
            # Create demo profile
            cur.execute(
                """INSERT INTO profiles (user_id, name, age, gender, height_cm, weight_kg, goal, diet_preference, fitness_level, injury_note)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   ON CONFLICT (user_id) DO NOTHING
                   RETURNING *""",
                (demo_user_id, "Demo User", 24, "female", 162, 62,
                 "Fat loss", "Indian vegetarian", "Beginner", None)
            )
            existing_profile = cur.fetchone()

            # Create demo check-in for today
            cur.execute(
                """INSERT INTO checkins (user_id, sleep_hours, meals_description, workout_done, water_litres, mood_energy, raw_text)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)
                   ON CONFLICT (user_id, checkin_date) DO NOTHING
                   RETURNING *""",
                (demo_user_id, 5, "3 idlis with sambar and tea", False, 1.0, 5,
                 "I slept 5 hours, ate 3 idlis with sambar and tea, skipped workout, drank 1 litre water.")
            )
            existing_checkin = cur.fetchone()

            # Create demo check-ins for past 6 days (for weekly report)
            for i in range(1, 7):
                past_date = date.today() - timedelta(days=i)
                # Alternate between good and bad days for realistic trend
                is_good = i % 2 == 0
                cur.execute(
                    """INSERT INTO checkins (user_id, checkin_date, sleep_hours, meals_description, workout_done, water_litres, mood_energy)
                       VALUES (%s, %s, %s, %s, %s, %s, %s)
                       ON CONFLICT (user_id, checkin_date) DO NOTHING""",
                    (demo_user_id, past_date,
                     7.5 if is_good else 5.5,
                     "Dal, roti, sabzi, curd" if is_good else "Biscuits, tea, rice, pickle",
                     is_good,
                     2.5 if is_good else 1.0,
                     8 if is_good else 4)
                )

            # Delete any cached fallback decision so demo generates a fresh AI decision
            cur.execute(
                "DELETE FROM health_decisions WHERE user_id = %s AND decision_date = CURRENT_DATE",
                (demo_user_id,)
            )

            conn.commit()

        return {
            "user_id": demo_user_id,
            "message": "Demo user ready. Use this user_id to test all features.",
            "suggested_checkin": "I slept 5 hours, ate 3 idlis with sambar and tea, skipped workout, drank 1 litre water.",
            "profile": {
                "age": 24,
                "goal": "Fat loss",
                "diet": "Indian vegetarian",
                "fitness_level": "Beginner"
            }
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
