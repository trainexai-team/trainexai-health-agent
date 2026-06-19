# Architecture

## System Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Frontend  │────▶│   Backend    │────▶│    Supabase DB   │
│  Next.js    │◀────│  FastAPI     │◀────│  PostgreSQL      │
│  Tailwind   │     │  Python      │     │                  │
│  Chart.js   │     │              │     │  - profiles      │
│  Framer     │     │  /health     │     │  - checkins      │
│  Motion     │     │  /profile    │     │  - decisions     │
└─────────────┘     │  /checkin    │     │  - reports       │
                    │  /decision   │     └─────────────────┘
                    │  /report          │
                    │  /demo-user       │
                    └───────┬───────────┘
                            │
                    ┌───────▼───────────┐
                    │   Gemini AI       │
                    │   (Flash Model)   │
                    └───────────────────┘
                            │
                    ┌───────▼───────────┐
                    │  Rule-based       │
                    │  Fallback         │
                    │  (No AI needed)   │
                    └───────────────────┘
```

## Data Flow

### Daily Decision Flow

```
User submits check-in
        │
        ▼
Backend stores data in Supabase
        │
        ▼
Backend calculates consistency score (rule-based, no AI)
        │
        ▼
Backend checks if decision already exists for today (cache)
        │
        ├── Yes → Return cached decision
        │
        └── No  → Call Gemini AI
                    │
                    ├── Success → Save & return AI decision
                    │
                    └── Fail → Use rule-based fallback
                                │
                                ▼
                        Save & return fallback decision
```

### Weekly Report Flow

```
User requests weekly report
        │
        ▼
Check if cached report exists
        │
        ├── Yes → Return cached report
        │
        └── No  → Aggregate last 7 check-ins
                    │
                    ▼
            Calculate averages and trends
                    │
                    ▼
            Generate insights and next week plan
                    │
                    ▼
            Cache and return report
```

## Cost Control

- Maximum 1 AI call per user per day
- Maximum 1 weekly report per user per week
- AI responses cached in database
- Backend calculates scores and trends (no AI)
- Fallback protects demo and production

## Safety Architecture

- AI safety prompt prevents medical advice
- Rule-based fallback removes AI dependency
- Safety disclaimer on every page
- Emergency symptom detection in prompt
- No diagnosis, medicine, or treatment claims

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| Charts | Chart.js + react-chartjs-2 |
| Icons | Lucide Icons |
| Backend | FastAPI, Python 3.11+ |
| Database | Supabase PostgreSQL |
| AI | Google Gemini Flash 2.0 |
| Fallback | Rule-based Python engine |
| Frontend Deploy | Cloudflare Pages |
| Backend Deploy | Render / Railway / Koyeb |
