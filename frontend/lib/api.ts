const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://trainexai-health-agent.onrender.com";

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "API request failed");
  }

  return res.json();
}

// Profile
export async function createProfile(data: {
  user_id: string;
  name: string;
  age: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  goal: string;
  diet_preference?: string;
  fitness_level: string;
  injury_note?: string;
}) {
  return fetchAPI("/profile", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getProfile(userId: string) {
  return fetchAPI(`/profile/${userId}`);
}

// Check-in
export async function createCheckin(data: {
  user_id: string;
  sleep_hours?: number;
  meals_description?: string;
  workout_done?: boolean;
  water_litres?: number;
  mood_energy?: number;
  notes?: string;
  raw_text?: string;
}) {
  return fetchAPI("/checkin", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getTodayCheckin(userId: string) {
  return fetchAPI(`/checkin/today/${userId}`);
}

// Decision
export async function generateDecision(userId: string) {
  return fetchAPI(`/decision/generate?user_id=${userId}`, {
    method: "POST",
  });
}

export async function getTodayDecision(userId: string) {
  return fetchAPI(`/decision/today/${userId}`);
}

// Weekly Report
export async function getWeeklyReport(userId: string) {
  return fetchAPI(`/weekly-report/${userId}`);
}

// Demo
export async function getDemoUser() {
  return fetchAPI("/demo-user");
}

// Health
export async function healthCheck() {
  return fetchAPI("/health");
}
