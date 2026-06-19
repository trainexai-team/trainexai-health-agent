from fastapi import APIRouter, HTTPException
from app.database import get_connection
from app.models import HealthResponse, ProfileCreate, CheckInCreate
from app.services.consistency import calculate_consistency_score
from app.services.fallback import generate_fallback_decision
import psycopg2.extras
import json
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

            # Calculate score for fallback decision
            score, breakdown = calculate_consistency_score(
                sleep_hours=5,
                workout_done=False,
                water_litres=1.0,
                mood_energy=5,
                meals_description="3 idlis with sambar and tea"
            )

            # Generate fallback decision
            main_decision, nutrition_action, workout_action, accountability_message = generate_fallback_decision(
                sleep_hours=5,
                workout_done=False,
                water_litres=1.0,
                mood_energy=5,
                meals_description="3 idlis with sambar and tea",
                goal="Fat loss",
                diet_preference="Indian vegetarian",
                fitness_level="Beginner",
            )

            # Save demo decision
            cur.execute(
                """INSERT INTO health_decisions (user_id, main_decision, nutrition_action, workout_action, accountability_message, consistency_score, score_breakdown, is_fallback)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                   ON CONFLICT (user_id, decision_date) DO NOTHING
                   RETURNING *""",
                (demo_user_id, main_decision, nutrition_action, workout_action,
                 accountability_message, score, json.dumps(breakdown), True)
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
