from typing import Optional


def generate_fallback_decision(
    sleep_hours: Optional[float],
    workout_done: Optional[bool],
    water_litres: Optional[float],
    mood_energy: Optional[int],
    meals_description: Optional[str],
    goal: Optional[str],
    diet_preference: Optional[str],
    fitness_level: Optional[str],
) -> tuple[str, str, str, str]:
    """Generate rule-based fallback decision when AI is unavailable.

    Returns (main_decision, nutrition_action, workout_action, accountability_message).
    """
    parts = []

    # Sleep analysis
    sleep_issue = None
    if sleep_hours is not None:
        if sleep_hours < 6:
            sleep_issue = f"Your sleep was only {sleep_hours} hours"
            parts.append("sleep")
        elif sleep_hours >= 9:
            sleep_issue = f"You slept {sleep_hours} hours"
            parts.append("oversleep")

    # Workout analysis
    workout_issue = None
    if workout_done is False:
        workout_issue = "You skipped your workout yesterday"
        parts.append("workout_missed")
    elif workout_done is True:
        parts.append("workout_done")

    # Water analysis
    water_issue = None
    if water_litres is not None and water_litres < 2:
        water_issue = f"You drank only {water_litres}L water"
        parts.append("water")

    # Nutrition analysis
    protein_low = False
    has_junk = False
    if meals_description:
        desc_lower = meals_description.lower()
        protein_keywords = ["dal", "paneer", "curd", "eggs", "sprouts", "chicken", "fish", "tofu", "milk", "protein", "beans", "lentils"]
        junk_keywords = ["fried", "oily", "junk", "fast food", "pizza", "burger", "soda", "chips", "biscuit"]
        protein_low = not any(kw in desc_lower for kw in protein_keywords)
        has_junk = any(kw in desc_lower for kw in junk_keywords)
        if protein_low:
            parts.append("protein")
        if has_junk:
            parts.append("junk")

    # Mood analysis
    mood_low = False
    if mood_energy is not None and mood_energy < 5:
        mood_low = True
        parts.append("low_mood")

    if fitness_level is None:
        fitness_level = "beginner"

    # Build main decision
    if not parts:
        main_decision = "Great job! You're doing well. Keep up the consistency and challenge yourself a little more today."
        nutrition_action = "Keep eating balanced meals with protein, fiber, and healthy fats."
        workout_action = f"Try a {workout_intensity(fitness_level)} 20-minute workout today."
        accountability_message = "You're on track! Consistency is your superpower."
        return main_decision, nutrition_action, workout_action, accountability_message

    main_decision_parts = []
    if sleep_issue and "sleep" in parts:
        main_decision_parts.append("your sleep was low")
    if workout_issue and "workout_missed" in parts:
        main_decision_parts.append("you missed your workout")
    if "protein" in parts:
        main_decision_parts.append("your protein intake needs attention")
    if "water" in parts:
        main_decision_parts.append("your hydration is low")
    if "junk" in parts:
        main_decision_parts.append("you had some junk food")
    if mood_low:
        main_decision_parts.append("your energy seems low")

    if main_decision_parts:
        main_decision = "Today's focus: "
        if len(main_decision_parts) == 1:
            main_decision += f"Since {main_decision_parts[0]}, "
        else:
            joined = ", ".join(main_decision_parts[:-1]) + f", and {main_decision_parts[-1]}"
            main_decision += f"Since {joined}, "

    # Build specific actions
    if "sleep" in parts:
        main_decision += "do a light activity today and prioritize sleep tonight."
        workout_action = f"Do a gentle 15-minute {workout_type(fitness_level, 'light')} — stretching, walking, or yoga."
    elif "workout_missed" in parts:
        main_decision += "get back on track with a short but effective workout today."
        workout_action = f"Do a {workout_intensity(fitness_level)} 20-minute {workout_type(fitness_level, 'moderate')} today."
    else:
        main_decision += "keep up the good momentum and push slightly harder today."
        workout_action = f"Try a {workout_intensity(fitness_level)} 25-minute {workout_type(fitness_level, 'moderate')}."

    # Nutrition action
    nutrition_action_parts = []
    if "protein" in parts:
        protein_sources = get_protein_sources(diet_preference)
        nutrition_action_parts.append(f"Add more protein: {protein_sources}")
    if "water" in parts:
        nutrition_action_parts.append("Drink 2-3 more glasses of water today")
    if "junk" in parts:
        nutrition_action_parts.append("Try to reduce fried and processed foods")
    if not nutrition_action_parts:
        nutrition_action_parts.append("Keep your meals balanced with protein, fiber, and healthy fats")

    nutrition_action = ". ".join(nutrition_action_parts) + "."

    if "low_mood" in parts:
        main_decision += " Take it easy and focus on small wins today."
        if "workout_action" not in locals() or workout_action == "":
            workout_action = "Go for a 15-minute walk in fresh air to boost your mood."
        accountability_message = "Some days are just about showing up. You've got this."
    else:
        accountability_message = "Small daily actions lead to big results. Stay consistent!"

    return main_decision, nutrition_action, workout_action, accountability_message


def get_protein_sources(diet_preference: Optional[str]) -> str:
    if diet_preference and "vegetarian" in diet_preference.lower():
        return "dal, paneer, curd, eggs, sprouts, tofu, and legumes"
    return "eggs, chicken, fish, paneer, curd, dal, and sprouts"


def workout_type(fitness_level: str, intensity: str) -> str:
    if fitness_level == "beginner":
        return "full body routine"
    elif fitness_level == "intermediate":
        return "strength and cardio mix"
    else:
        return "intense interval training"


def workout_intensity(fitness_level: str) -> str:
    if fitness_level == "beginner":
        return "light"
    elif fitness_level == "intermediate":
        return "moderate"
    else:
        return "challenging"
