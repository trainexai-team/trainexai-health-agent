from fastapi import APIRouter, HTTPException
from app.database import get_connection
from app.models import WeeklyReportResponse
from app.services.consistency import calculate_consistency_score
import psycopg2.extras
from datetime import date, timedelta

router = APIRouter()


@router.get("/weekly-report/{user_id}", response_model=WeeklyReportResponse)
def get_weekly_report(user_id: str):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        # Check for cached report
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)

        cur.execute(
            "SELECT * FROM weekly_reports WHERE user_id = %s AND week_start = %s AND week_end = %s",
            (user_id, week_start, week_end)
        )
        cached = cur.fetchone()
        if cached:
            return dict(cached)

        # Get check-ins for the past week
        cur.execute(
            "SELECT * FROM checkins WHERE user_id = %s AND checkin_date >= %s AND checkin_date <= %s ORDER BY checkin_date",
            (user_id, week_start, week_end)
        )
        checkins = cur.fetchall()

        if not checkins:
            raise HTTPException(status_code=404, detail="No check-in data for this week")

        # Calculate scores
        scores = []
        workout_count = 0
        total_days = len(checkins)
        sleep_values = []
        nutrition_notes = []

        for c in checkins:
            score, breakdown = calculate_consistency_score(
                sleep_hours=c.get("sleep_hours"),
                workout_done=c.get("workout_done"),
                water_litres=c.get("water_litres"),
                mood_energy=c.get("mood_energy"),
                meals_description=c.get("meals_description"),
            )
            scores.append(score)
            if c.get("workout_done"):
                workout_count += 1
            if c.get("sleep_hours") is not None:
                sleep_values.append(c["sleep_hours"])
            if c.get("meals_description"):
                nutrition_notes.append(c["meals_description"])

        avg_score = sum(scores) / len(scores) if scores else 0
        workout_adherence = (workout_count / total_days * 100) if total_days > 0 else 0
        avg_sleep = sum(sleep_values) / len(sleep_values) if sleep_values else 0

        # Generate trends
        if avg_sleep < 6:
            sleep_trend = f"Low sleep averaging {avg_sleep:.1f}h. Focus on bedtime routine."
        elif avg_sleep < 7:
            sleep_trend = f"Borderline sleep at {avg_sleep:.1f}h. Try to add 30 more minutes."
        else:
            sleep_trend = f"Good sleep averaging {avg_sleep:.1f}h. Keep it up!"

        if avg_score >= 75:
            nutrition_trend = "Strong week with balanced nutrition and good habits."
        elif avg_score >= 50:
            nutrition_trend = "Decent week. Some room for improvement in meal planning."
        else:
            nutrition_trend = "Needs improvement. Focus on consistent meal timing and balanced plates."

        # Determine improvements and problems
        if workout_adherence >= 70:
            biggest_improvement = f"Great workout consistency at {workout_adherence:.0f}% adherence!"
        elif avg_score > 60:
            biggest_improvement = "Showing improvement in overall health awareness."
        else:
            biggest_improvement = "Taking the first step is the biggest improvement."

        if avg_score < 50:
            biggest_problem = "Inconsistent daily routine — work on showing up every day."
        elif workout_adherence < 50:
            biggest_problem = "Workout consistency needs attention."
        elif avg_sleep < 6:
            biggest_problem = "Sleep debt accumulating — prioritize rest."
        else:
            biggest_problem = "Small inconsistencies adding up. Focus on one habit at a time."

        # Generate next week plan
        next_week_plan_parts = []
        if workout_adherence < 70:
            next_week_plan_parts.append("Aim for at least 4 workouts next week")
        if avg_sleep < 7:
            next_week_plan_parts.append("Target 7-8 hours of sleep each night")
        if avg_score < 60:
            next_week_plan_parts.append("Focus on meal prep and water intake daily")
        next_week_plan_parts.append("Track every day to build the streak")

        next_week_plan = " | ".join(next_week_plan_parts)

        # Cache the report
        cur.execute(
            """INSERT INTO weekly_reports (user_id, week_start, week_end, avg_consistency_score, workout_adherence, nutrition_trend, sleep_trend, biggest_improvement, biggest_problem, next_week_plan)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
               RETURNING *""",
            (user_id, week_start, week_end, round(avg_score, 1), round(workout_adherence, 1),
             nutrition_trend, sleep_trend, biggest_improvement, biggest_problem, next_week_plan)
        )
        result = dict(cur.fetchone())
        conn.commit()
        return result

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
