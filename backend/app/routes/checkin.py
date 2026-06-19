from fastapi import APIRouter, HTTPException
from app.database import get_connection
from app.models import CheckInCreate
from app.services.consistency import calculate_consistency_score
import psycopg2.extras

router = APIRouter()


@router.post("/checkin")
def create_checkin(checkin: CheckInCreate):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        # Calculate consistency score on the backend
        score, breakdown = calculate_consistency_score(
            sleep_hours=checkin.sleep_hours,
            workout_done=checkin.workout_done,
            water_litres=checkin.water_litres,
            mood_energy=checkin.mood_energy,
            meals_description=checkin.meals_description,
        )

        cur.execute(
            """INSERT INTO checkins (user_id, sleep_hours, meals_description, workout_done, water_litres, mood_energy, notes, raw_text)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
               ON CONFLICT (user_id, checkin_date) DO UPDATE SET
               sleep_hours = EXCLUDED.sleep_hours,
               meals_description = EXCLUDED.meals_description,
               workout_done = EXCLUDED.workout_done,
               water_litres = EXCLUDED.water_litres,
               mood_energy = EXCLUDED.mood_energy,
               notes = EXCLUDED.notes,
               raw_text = EXCLUDED.raw_text
               RETURNING *""",
            (checkin.user_id, checkin.sleep_hours, checkin.meals_description,
             checkin.workout_done, checkin.water_litres, checkin.mood_energy,
             checkin.notes, checkin.raw_text)
        )
        result = dict(cur.fetchone())
        conn.commit()

        # Attach calculated score
        result["consistency_score"] = score
        result["score_breakdown"] = breakdown
        return result
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


@router.get("/checkin/today/{user_id}")
def get_today_checkin(user_id: str):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(
            "SELECT * FROM checkins WHERE user_id = %s AND checkin_date = CURRENT_DATE",
            (user_id,)
        )
        result = cur.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="No check-in found for today")
        result = dict(result)
        # Calculate and attach score
        score, breakdown = calculate_consistency_score(
            sleep_hours=result.get("sleep_hours"),
            workout_done=result.get("workout_done"),
            water_litres=result.get("water_litres"),
            mood_energy=result.get("mood_energy"),
            meals_description=result.get("meals_description"),
        )
        result["consistency_score"] = score
        result["score_breakdown"] = breakdown
        return result
    finally:
        cur.close()
        conn.close()
