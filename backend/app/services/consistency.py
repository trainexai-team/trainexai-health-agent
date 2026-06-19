from typing import Optional


def calculate_consistency_score(
    sleep_hours: Optional[float],
    workout_done: Optional[bool],
    water_litres: Optional[float],
    mood_energy: Optional[int],
    meals_description: Optional[str],
) -> tuple[int, dict]:
    """Calculate consistency score out of 100 using rule-based logic.

    Scoring:
    - Workout adherence: 30 points
    - Nutrition quality: 30 points
    - Sleep: 20 points
    - Water intake: 10 points
    - Mood/energy: 10 points
    """
    breakdown = {}
    total = 0

    # Workout adherence (30 points)
    if workout_done is True:
        workout_score = 30
        workout_note = "Workout completed"
    elif workout_done is False:
        workout_score = 0
        workout_note = "Workout missed"
    else:
        workout_score = 15
        workout_note = "No workout data"
    breakdown["workout"] = {"score": workout_score, "max": 30, "note": workout_note}
    total += workout_score

    # Nutrition quality (30 points)
    nutrition_score = 15  # default middle
    nutrition_note = "Average nutrition"
    if meals_description:
        desc_lower = meals_description.lower()
        protein_keywords = ["dal", "paneer", "curd", "eggs", "sprouts", "chicken", "fish", "tofu", "milk", "protein"]
        veg_keywords = ["salad", "vegetables", "fruits", "greens", "sabzi"]
        junk_keywords = ["fried", "oily", "junk", "fast food", "pizza", "burger", "soda"]

        has_protein = any(kw in desc_lower for kw in protein_keywords)
        has_veg = any(kw in desc_lower for kw in veg_keywords)
        has_junk = any(kw in desc_lower for kw in junk_keywords)

        if has_protein and has_veg and not has_junk:
            nutrition_score = 30
            nutrition_note = "Good nutrition balance"
        elif has_protein and has_veg:
            nutrition_score = 25
            nutrition_note = "Decent nutrition with some improvements needed"
        elif has_junk:
            nutrition_score = 5
            nutrition_note = "High junk food intake"
        elif has_protein or has_veg:
            nutrition_score = 20
            nutrition_note = "Fair nutrition, could be more balanced"
    breakdown["nutrition"] = {"score": nutrition_score, "max": 30, "note": nutrition_note}
    total += nutrition_score

    # Sleep (20 points)
    sleep_score = 10
    sleep_note = "Average sleep"
    if sleep_hours is not None:
        if 7 <= sleep_hours <= 9:
            sleep_score = 20
            sleep_note = "Optimal sleep"
        elif 6 <= sleep_hours < 7 or 9 < sleep_hours <= 10:
            sleep_score = 15
            sleep_note = "Slightly off optimal range"
        elif 5 <= sleep_hours < 6:
            sleep_score = 8
            sleep_note = "Below recommended sleep"
        elif sleep_hours < 5:
            sleep_score = 3
            sleep_note = "Very low sleep"
        else:
            sleep_score = 5
            sleep_note = "Excessive sleep"
    breakdown["sleep"] = {"score": sleep_score, "max": 20, "note": sleep_note}
    total += sleep_score

    # Water intake (10 points)
    water_score = 5
    water_note = "Average water intake"
    if water_litres is not None:
        if water_litres >= 3:
            water_score = 10
            water_note = "Excellent hydration"
        elif water_litres >= 2:
            water_score = 8
            water_note = "Good hydration"
        elif water_litres >= 1.5:
            water_score = 6
            water_note = "Adequate hydration"
        elif water_litres < 1:
            water_score = 2
            water_note = "Low water intake"
    breakdown["water"] = {"score": water_score, "max": 10, "note": water_note}
    total += water_score

    # Mood/energy (10 points)
    mood_score = 5
    mood_note = "Average energy"
    if mood_energy is not None:
        if mood_energy >= 8:
            mood_score = 10
            mood_note = "High energy"
        elif mood_energy >= 6:
            mood_score = 8
            mood_note = "Good energy"
        elif mood_energy >= 4:
            mood_score = 5
            mood_note = "Moderate energy"
        elif mood_energy < 4:
            mood_score = 2
            mood_note = "Low energy"
    breakdown["mood"] = {"score": mood_score, "max": 10, "note": mood_note}
    total += mood_score

    return total, breakdown
