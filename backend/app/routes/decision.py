from fastapi import APIRouter, HTTPException
from app.config import GEMINI_API_KEY
from app.database import get_connection
from app.models import DecisionResponse
from app.services.consistency import calculate_consistency_score
from app.services.ai_service import generate_decision_prompt, call_gemini
from app.services.fallback import generate_fallback_decision
import psycopg2.extras
import json

router = APIRouter()


@router.post("/decision/generate")
def generate_decision(user_id: str):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        # Check if decision already exists for today (cache)
        cur.execute(
            "SELECT * FROM health_decisions WHERE user_id = %s AND decision_date = CURRENT_DATE",
            (user_id,)
        )
        existing = cur.fetchone()
        if existing:
            return dict(existing)

        # Get user profile
        cur.execute("SELECT * FROM profiles WHERE user_id = %s", (user_id,))
        profile = cur.fetchone()
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found. Please create a profile first.")

        # Get today's check-in
        cur.execute(
            "SELECT * FROM checkins WHERE user_id = %s AND checkin_date = CURRENT_DATE",
            (user_id,)
        )
        checkin = cur.fetchone()
        if not checkin:
            raise HTTPException(status_code=404, detail="No check-in found for today. Please check in first.")

        # Calculate consistency score
        score, breakdown = calculate_consistency_score(
            sleep_hours=checkin.get("sleep_hours"),
            workout_done=checkin.get("workout_done"),
            water_litres=checkin.get("water_litres"),
            mood_energy=checkin.get("mood_energy"),
            meals_description=checkin.get("meals_description"),
        )

        # Try AI first if API key is configured
        ai_result = None
        is_fallback = False
        if GEMINI_API_KEY:
            prompt = generate_decision_prompt(
                age=profile["age"],
                goal=profile["goal"],
                diet_preference=profile.get("diet_preference"),
                fitness_level=profile["fitness_level"],
                sleep_hours=checkin.get("sleep_hours"),
                workout_done=checkin.get("workout_done"),
                water_litres=checkin.get("water_litres"),
                mood_energy=checkin.get("mood_energy"),
                meals_description=checkin.get("meals_description"),
                consistency_score=score,
                score_breakdown=breakdown,
            )
            ai_result = await_call_gemini_sync(prompt)

        if ai_result:
            main_decision = ai_result.get("main_decision", "")
            nutrition_action = ai_result.get("nutrition_action", "")
            workout_action = ai_result.get("workout_action", "")
            accountability_message = ai_result.get("accountability_message", "")
        else:
            # Fallback to rule-based
            is_fallback = True
            main_decision, nutrition_action, workout_action, accountability_message = generate_fallback_decision(
                sleep_hours=checkin.get("sleep_hours"),
                workout_done=checkin.get("workout_done"),
                water_litres=checkin.get("water_litres"),
                mood_energy=checkin.get("mood_energy"),
                meals_description=checkin.get("meals_description"),
                goal=profile.get("goal"),
                diet_preference=profile.get("diet_preference"),
                fitness_level=profile["fitness_level"],
            )

        # Save decision to DB
        cur.execute(
            """INSERT INTO health_decisions (user_id, main_decision, nutrition_action, workout_action, accountability_message, consistency_score, score_breakdown, is_fallback)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
               RETURNING *""",
            (user_id, main_decision, nutrition_action, workout_action,
             accountability_message, score, json.dumps(breakdown), is_fallback)
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


@router.get("/decision/today/{user_id}")
def get_today_decision(user_id: str):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(
            "SELECT * FROM health_decisions WHERE user_id = %s AND decision_date = CURRENT_DATE",
            (user_id,)
        )
        result = cur.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="No decision found for today")
        return dict(result)
    finally:
        cur.close()
        conn.close()


def await_call_gemini_sync(prompt: str):
    """Synchronous wrapper for async Gemini call."""
    import asyncio
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(call_gemini(prompt))
