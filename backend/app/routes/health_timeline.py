from fastapi import APIRouter, HTTPException
from app.database import get_connection
from app.services.consistency import calculate_consistency_score
import psycopg2.extras
from datetime import date, timedelta

router = APIRouter()


@router.get("/timeline/{user_id}")
def get_health_timeline(user_id: str):
    """Get a monthly/periodic health timeline showing weight progress and metric improvements."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        # Get user profile for starting weight
        cur.execute("SELECT * FROM profiles WHERE user_id = %s", (user_id,))
        profile = cur.fetchone()
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        # Get all check-ins ordered by date
        cur.execute(
            "SELECT * FROM checkins WHERE user_id = %s ORDER BY checkin_date ASC",
            (user_id,)
        )
        checkins = cur.fetchall()

        if not checkins:
            raise HTTPException(status_code=404, detail="No check-in data found")

        # Build timeline entries
        timeline_entries = []
        start_weight = profile.get("weight_kg")
        prev_score = None
        nutrition_improved_count = 0
        workout_count = 0
        total_checkins = len(checkins)

        for i, c in enumerate(checkins):
            score, breakdown = calculate_consistency_score(
                sleep_hours=c.get("sleep_hours"),
                workout_done=c.get("workout_done"),
                water_litres=c.get("water_litres"),
                mood_energy=c.get("mood_energy"),
                meals_description=c.get("meals_description"),
            )

            entry = {
                "date": c["checkin_date"].isoformat(),
                "consistency_score": score,
                "weight_kg": c.get("weight_kg"),
                "workout_done": c.get("workout_done"),
                "sleep_hours": c.get("sleep_hours"),
                "water_litres": c.get("water_litres"),
                "mood_energy": c.get("mood_energy"),
                "score_breakdown": breakdown,
            }

            # Track improvements
            if prev_score is not None and score > prev_score + 5:
                entry["improvement"] = "consistency_up"
            elif prev_score is not None and score < prev_score - 5:
                entry["improvement"] = "consistency_down"
            else:
                entry["improvement"] = "stable"

            if c.get("workout_done"):
                workout_count += 1

            # Check nutrition improvement
            if c.get("meals_description"):
                desc = c["meals_description"].lower()
                protein_kw = ["dal", "paneer", "curd", "eggs", "sprouts", "chicken", "fish", "tofu"]
                if any(kw in desc for kw in protein_kw):
                    nutrition_improved_count += 1

            timeline_entries.append(entry)
            prev_score = score

        # Generate AI-style insights
        insights = []

        # Weight progress
        weights = [e["weight_kg"] for e in timeline_entries if e["weight_kg"] is not None]
        if len(weights) >= 2:
            start_w = weights[0]
            end_w = weights[-1]
            diff = end_w - start_w
            if abs(diff) > 0:
                direction = "lost" if diff < 0 else "gained"
                insights.append(f"Your weight changed from {start_w:.0f}kg to {end_w:.0f}kg — you {direction} {abs(diff):.1f}kg over this period.")

        # Workout consistency
        if total_checkins > 0:
            adherence = (workout_count / total_checkins) * 100
            if adherence >= 70:
                insights.append(f"Strong workout consistency at {adherence:.0f}% — this is driving your progress.")
            elif adherence >= 40:
                insights.append(f"Moderate workout consistency at {adherence:.0f}%. Increasing frequency could accelerate results.")
            else:
                insights.append(f"Workout consistency is at {adherence:.0f}%. Try to add more workout days.")

        # Nutrition improvement
        if total_checkins > 0:
            nutrition_rate = (nutrition_improved_count / total_checkins) * 100
            if nutrition_rate >= 60:
                insights.append("Your protein intake has improved significantly — this supports muscle maintenance and recovery.")
            elif nutrition_rate >= 30:
                insights.append("You're making progress with nutrition. Focus on adding protein to more meals.")
            else:
                insights.append("Nutrition is an area to focus on. Try adding protein sources like dal, paneer, or eggs.")

        # Score trend
        scores = [e["consistency_score"] for e in timeline_entries]
        if len(scores) >= 2:
            first_half = scores[:len(scores)//2]
            second_half = scores[len(scores)//2:]
            avg_first = sum(first_half) / len(first_half)
            avg_second = sum(second_half) / len(second_half)
            if avg_second > avg_first + 5:
                insights.append(f"Your consistency score improved from {avg_first:.0f} to {avg_second:.0f} — your habits are building momentum.")
            elif avg_second < avg_first - 5:
                insights.append(f"Your consistency score dropped from {avg_first:.0f} to {avg_second:.0f}. Focus on rebuilding your routine.")
            else:
                insights.append(f"Your consistency score is stable around {avg_first:.0f}. Small daily improvements will push it higher.")

        if not insights:
            insights.append("Start tracking daily to see your health timeline and progress insights.")

        return {
            "user_id": user_id,
            "profile": {
                "name": profile.get("name"),
                "goal": profile.get("goal"),
                "diet_preference": profile.get("diet_preference"),
                "fitness_level": profile.get("fitness_level"),
                "initial_weight_kg": profile.get("weight_kg"),
            },
            "timeline": timeline_entries,
            "insights": insights,
            "summary": {
                "total_checkins": total_checkins,
                "workout_adherence_pct": round((workout_count / total_checkins * 100) if total_checkins > 0 else 0, 1),
                "current_avg_score": round(sum(scores) / len(scores), 1) if scores else 0,
                "weight_change_kg": round(weights[-1] - weights[0], 1) if len(weights) >= 2 else None,
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
