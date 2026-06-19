import json
from typing import Optional
from app.config import GEMINI_API_KEY, GEMINI_MODEL


SAFETY_SYSTEM_PROMPT = """You are TrainexAI Health Agent, a fitness and nutrition decision engine.

STRICT RULES:
- Provide fitness and nutrition guidance ONLY
- NEVER diagnose diseases
- NEVER recommend medicine or dosage
- NEVER give emergency advice
- NEVER make treatment claims
- If the user mentions serious symptoms (chest pain, difficulty breathing, severe injury, etc.), advise consulting a healthcare professional immediately
- Focus on Indian lifestyle and food context

Always respond in JSON format exactly as specified."""


def generate_decision_prompt(
    age: int,
    goal: str,
    diet_preference: Optional[str],
    fitness_level: str,
    sleep_hours: Optional[float],
    workout_done: Optional[bool],
    water_litres: Optional[float],
    mood_energy: Optional[int],
    meals_description: Optional[str],
    consistency_score: int,
    score_breakdown: dict,
) -> str:
    return f"""Based on the following user data, generate a health decision card in JSON format.

User Profile:
- Age: {age}
- Goal: {goal}
- Diet: {diet_preference or 'No preference'}
- Fitness Level: {fitness_level}

Today's Check-in:
- Sleep: {sleep_hours if sleep_hours is not None else 'Not recorded'} hours
- Workout: {'Done' if workout_done else 'Missed' if workout_done is False else 'Not recorded'}
- Water: {water_litres if water_litres is not None else 'Not recorded'} litres
- Mood/Energy: {mood_energy if mood_energy is not None else 'Not recorded'}/10
- Meals: {meals_description or 'Not recorded'}

Consistency Score: {consistency_score}/100
Score Breakdown: {json.dumps(score_breakdown)}

Respond ONLY with this JSON structure (no markdown, no extra text):
{{
  "main_decision": "One clear personalized decision for today (1-2 sentences)",
  "nutrition_action": "One specific nutrition action (1 sentence)",
  "workout_action": "One specific workout action (1 sentence)",
  "accountability_message": "One motivational accountability message (1 sentence)",
  "safety_note": "This is fitness and nutrition guidance only. Consult a doctor for medical concerns."
}}"""


async def call_gemini(prompt: str) -> Optional[dict]:
    """Call Gemini AI and return parsed response."""
    if not GEMINI_API_KEY:
        return None

    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                {"role": "user", "parts": [{"text": SAFETY_SYSTEM_PROMPT + "\n\n" + prompt}]}
            ],
            config={
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 40,
                "max_output_tokens": 1024,
            }
        )

        text = response.text.strip()
        # Try to parse JSON from response
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()

        return json.loads(text)
    except Exception as e:
        print(f"Gemini API error: {e}")
        return None
