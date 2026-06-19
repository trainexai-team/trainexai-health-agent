from fastapi import APIRouter, HTTPException
from app.database import get_connection
from app.models import ProfileCreate, ProfileResponse
import psycopg2.extras

router = APIRouter()


@router.post("/profile", response_model=ProfileResponse)
def create_profile(profile: ProfileCreate):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(
            """INSERT INTO profiles (user_id, name, age, gender, height_cm, weight_kg, goal, diet_preference, fitness_level, injury_note)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
               ON CONFLICT (user_id) DO UPDATE SET
               name = EXCLUDED.name,
               age = EXCLUDED.age,
               gender = EXCLUDED.gender,
               height_cm = EXCLUDED.height_cm,
               weight_kg = EXCLUDED.weight_kg,
               goal = EXCLUDED.goal,
               diet_preference = EXCLUDED.diet_preference,
               fitness_level = EXCLUDED.fitness_level,
               injury_note = EXCLUDED.injury_note,
               updated_at = NOW()
               RETURNING *""",
            (profile.user_id, profile.name, profile.age, profile.gender,
             profile.height_cm, profile.weight_kg, profile.goal,
             profile.diet_preference, profile.fitness_level, profile.injury_note)
        )
        result = dict(cur.fetchone())
        conn.commit()
        return result
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


@router.get("/profile/{user_id}", response_model=ProfileResponse)
def get_profile(user_id: str):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM profiles WHERE user_id = %s", (user_id,))
        result = cur.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Profile not found")
        return dict(result)
    finally:
        cur.close()
        conn.close()
