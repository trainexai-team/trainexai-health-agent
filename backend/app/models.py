from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class ProfileCreate(BaseModel):
    user_id: str
    name: str
    age: int
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    goal: str
    diet_preference: Optional[str] = None
    fitness_level: str
    injury_note: Optional[str] = None


class ProfileResponse(BaseModel):
    user_id: str
    name: str
    age: int
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    goal: str
    diet_preference: Optional[str] = None
    fitness_level: str
    injury_note: Optional[str] = None
    created_at: datetime


class CheckInCreate(BaseModel):
    user_id: str
    sleep_hours: Optional[float] = None
    meals_description: Optional[str] = None
    workout_done: Optional[bool] = None
    water_litres: Optional[float] = None
    mood_energy: Optional[int] = Field(default=None, ge=1, le=10)
    notes: Optional[str] = None
    raw_text: Optional[str] = None


class CheckInResponse(BaseModel):
    id: int
    user_id: str
    checkin_date: date
    sleep_hours: Optional[float] = None
    meals_description: Optional[str] = None
    workout_done: Optional[bool] = None
    water_litres: Optional[float] = None
    mood_energy: Optional[int] = None
    notes: Optional[str] = None
    raw_text: Optional[str] = None
    consistency_score: Optional[int] = None
    score_breakdown: Optional[dict] = None


class DecisionResponse(BaseModel):
    user_id: str
    decision_date: date
    main_decision: str
    nutrition_action: str
    workout_action: str
    accountability_message: str
    consistency_score: int
    score_breakdown: Optional[dict] = None
    is_fallback: bool


class WeeklyReportResponse(BaseModel):
    user_id: str
    week_start: date
    week_end: date
    avg_consistency_score: float
    workout_adherence: float
    nutrition_trend: str
    sleep_trend: str
    biggest_improvement: str
    biggest_problem: str
    next_week_plan: str


class HealthResponse(BaseModel):
    status: str
    version: str
    message: str
