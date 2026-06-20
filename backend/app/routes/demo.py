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


# Demo user configurations
DEMO_USERS = {
    "demo-user-001": {
        "name": "Priya Sharma",
        "age": 24,
        "gender": "female",
        "height_cm": 162,
        "weight_kg": 92,
        "goal": "Fat loss",
        "diet_preference": "Indian vegetarian",
        "fitness_level": "Beginner",
        "initial_weight_kg": 96,
        "description": "Fat loss journey — started at 96kg, now 92kg",
        "checkin": {
            "sleep_hours": 5,
            "meals": "3 idlis with sambar and tea",
            "workout": False,
            "water": 1.0,
            "mood": 5,
            "raw": "I slept 5 hours, ate 3 idlis with sambar and tea, skipped workout, drank 1 litre water."
        }
    },
    "demo-user-002": {
        "name": "Arjun Mehta",
        "age": 31,
        "gender": "male",
        "height_cm": 175,
        "weight_kg": 58,
        "goal": "Muscle gain",
        "diet_preference": "Non-vegetarian",
        "fitness_level": "Intermediate",
        "initial_weight_kg": 55,
        "description": "Muscle gain journey — started at 55kg, now 58kg",
        "checkin": {
            "sleep_hours": 7,
            "meals": "Chicken breast, rice, eggs, salad, protein shake",
            "workout": True,
            "water": 2.5,
            "mood": 7,
            "raw": "Slept 7 hours, ate chicken breast with rice, eggs and salad, did chest day workout, drank 2.5L water."
        }
    },
    "demo-user-003": {
        "name": "Suresh Patel",
        "age": 45,
        "gender": "male",
        "height_cm": 170,
        "weight_kg": 84,
        "goal": "Better health",
        "diet_preference": "Vegetarian",
        "fitness_level": "Beginner",
        "initial_weight_kg": 86,
        "description": "Better health journey — started at 86kg, now 84kg",
        "checkin": {
            "sleep_hours": 6,
            "meals": "Roti, dal, sabzi, curd",
            "workout": True,
            "water": 2.0,
            "mood": 6,
            "raw": "Slept 6 hours, ate roti dal sabzi and curd, did 20 min walk, drank 2L water."
        }
    }
}


@router.get("/demo-user")
def get_or_create_demo_user(user_type: str = "1"):
    """Get or create a demo user. Pass user_type=1,2,3 for different profiles."""
    user_key = f"demo-user-00{user_type}"
    if user_key not in DEMO_USERS:
        raise HTTPException(status_code=404, detail="Invalid demo user type. Use 1, 2, or 3.")

    cfg = DEMO_USERS[user_key]
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        # Check if demo user exists
        cur.execute("SELECT * FROM profiles WHERE user_id = %s", (user_key,))
        existing = cur.fetchone()

        if not existing:
            # Create demo profile with weight tracking
            cur.execute(
                """INSERT INTO profiles (user_id, name, age, gender, height_cm, weight_kg, goal, diet_preference, fitness_level, injury_note)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   ON CONFLICT (user_id) DO NOTHING
                   RETURNING *""",
                (user_key, cfg["name"], cfg["age"], cfg["gender"],
                 cfg["height_cm"], cfg["weight_kg"], cfg["goal"],
                 cfg["diet_preference"], cfg["fitness_level"], None)
            )
            cur.fetchone()

            c = cfg["checkin"]

            # Create demo check-in for today with weight
            cur.execute(
                """INSERT INTO checkins (user_id, sleep_hours, meals_description, workout_done, water_litres, mood_energy, raw_text, weight_kg)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                   ON CONFLICT (user_id, checkin_date) DO NOTHING
                   RETURNING *""",
                (user_key, c["sleep_hours"], c["meals"], c["workout"],
                 c["water"], c["mood"], c["raw"], cfg["weight_kg"])
            )
            cur.fetchone()

            # Create demo check-ins for past 6 days with progressive weight
            start_weight = cfg["initial_weight_kg"]
            target_weight = cfg["weight_kg"]
            for i in range(1, 7):
                past_date = date.today() - timedelta(days=i)
                is_good = i % 2 == 0
                # Simulate gradual weight change
                weight_progress = start_weight - (start_weight - target_weight) * (i / 7)

                cur.execute(
                    """INSERT INTO checkins (user_id, checkin_date, sleep_hours, meals_description, workout_done, water_litres, mood_energy, weight_kg)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                       ON CONFLICT (user_id, checkin_date) DO NOTHING""",
                    (user_key, past_date,
                     7.5 if is_good else 5.5 if cfg["goal"] == "Fat loss" else 6.5,
                     "Dal, roti, sabzi, curd" if is_good else "Biscuits, tea, rice, pickle",
                     is_good,
                     2.5 if is_good else 1.0,
                     8 if is_good else 4,
                     round(weight_progress, 1))
                )

            # Delete any cached fallback decision so demo generates a fresh AI decision
            cur.execute(
                "DELETE FROM health_decisions WHERE user_id = %s AND decision_date = CURRENT_DATE",
                (user_key,)
            )

            conn.commit()

        return {
            "user_id": user_key,
            "message": f"Demo user ready: {cfg['description']}",
            "suggested_checkin": c["raw"],
            "profile": {
                "name": cfg["name"],
                "age": cfg["age"],
                "goal": cfg["goal"],
                "diet": cfg["diet_preference"],
                "fitness_level": cfg["fitness_level"],
                "weight_kg": cfg["weight_kg"],
                "initial_weight_kg": cfg["initial_weight_kg"],
            }
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
