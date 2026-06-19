# TrainexAI Health Agent

> **AI-powered Health Decision Engine — Built for HackIndia 2026**

TrainexAI Health Agent helps users stay consistent with fitness and nutrition goals by converting daily health data into personalized actions, accountability, and insights.

Built as an innovation module within the broader TrainexAI ecosystem.

---

## Problem Statement

People fail health goals because:
- **Tracking is tedious** — logging every detail is exhausting
- **Advice is generic** — no personalization for Indian lifestyles
- **Motivation fades** — without accountability, consistency drops

## Solution

TrainexAI Health Agent is not another fitness tracker or AI chatbot. It is a **Health Decision Engine** that converts daily food, sleep, workout, and mood data into **one simple action plan every day**.

## Key Features

| Feature | Description |
|---------|-------------|
| **User Health Profile** | Age, goal, diet preference, fitness level — personalized guidance |
| **Daily Check-In** | Log sleep, meals, workout, water, and mood in seconds |
| **Consistency Score** | Score out of 100 with 5-metric breakdown (no AI needed) |
| **AI Decision Card** | One daily decision + nutrition + workout + accountability |
| **Weekly Health Report** | Trends, improvements, problems, and next week plan |
| **Rule-Based Fallback** | Demo works even without AI API key |

## Safety

> **TrainexAI provides fitness and nutrition guidance only. It does not diagnose, treat, or replace medical professionals.**

See [docs/safety.md](docs/safety.md) for complete safety documentation.

## Architecture

```
Frontend (Next.js + Tailwind)  ←→  Backend (FastAPI + Python)  ←→  Database (Supabase PostgreSQL)
                                       ↕
                                  Gemini AI (Flash)  ←→  Rule-based Fallback
```

See [docs/architecture.md](docs/architecture.md) for detailed architecture.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Chart.js, Lucide Icons |
| Backend | FastAPI, Python |
| Database | Supabase PostgreSQL |
| AI | Google Gemini Flash (primary) + Rule-based fallback (mandatory) |
| Deployment | Cloudflare Pages (frontend) / Render or Railway (backend) |

## Project Structure

```
trainexai-health-agent/
├── frontend/                 # Next.js application
│   ├── app/                  # Pages (/, /profile, /checkin, /decision, /report, /demo)
│   ├── components/           # Reusable UI components
│   └── lib/                  # API client and utilities
├── backend/                  # FastAPI application
│   └── app/
│       ├── routes/           # API endpoints
│       └── services/         # Business logic (consistency, AI, fallback)
├── docs/                     # Documentation
│   ├── problem-statement.md
│   ├── architecture.md
│   ├── scalability.md
│   └── safety.md
├── screenshots/              # Demo screenshots
├── .env.example              # Environment variables template
├── README.md
└── LICENSE
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/profile` | Create/update profile |
| GET | `/profile/{user_id}` | Get profile |
| POST | `/checkin` | Create daily check-in |
| GET | `/checkin/today/{user_id}` | Get today's check-in |
| POST | `/decision/generate` | Generate AI decision |
| GET | `/decision/today/{user_id}` | Get today's cached decision |
| GET | `/weekly-report/{user_id}` | Get weekly report |
| GET | `/demo-user` | Create/get demo user |

## Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.11+
- Supabase PostgreSQL database (or any PostgreSQL)
- Google Gemini API key (optional — fallback works without it)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and GEMINI_API_KEY

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with NEXT_PUBLIC_API_URL

# Run the development server
npm run dev
# or
pnpm dev
```

### Environment Variables

See `.env.example` for all required variables:

```env
# Backend
DATABASE_URL=postgresql://user:password@host:5432/postgres
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.0-flash
CORS_ORIGINS=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Demo Flow (3 Minutes)

1. **Go to `/demo`** — click "Start Demo"
2. **Profile** — Auto-creates: Age 24, Fat Loss, Indian Vegetarian, Beginner
3. **Check-In** — "I slept 5 hours, ate 3 idlis with sambar and tea, skipped workout, drank 1 litre water"
4. **AI Decision** — Personalized action plan based on check-in
5. **Consistency Score** — 65/100 with full breakdown
6. **Weekly Report** — Trends and next week plan
7. **Scalability** — AI cached, scores backend-calculated, fallback active

## AI Cost Control

- Maximum **1** AI decision per user per day
- Maximum **1** weekly report per user per week
- AI responses **cached** in database
- Backend calculates scores and trends (no AI)
- Rule-based fallback protects demo

## Scalability

See [docs/scalability.md](docs/scalability.md) for detailed scaling strategy, cost projections, and future roadmap.

## Future Roadmap

- [ ] Wearable device integration (Fitbit, Apple Watch)
- [ ] Meal photo recognition
- [ ] Hindi and regional language support
- [ ] Push notifications
- [ ] Social accountability features
- [ ] Merge into main TrainexAI platform

## License

MIT — see [LICENSE](LICENSE) for details.

---

Built with ❤️ for HackIndia 2026
