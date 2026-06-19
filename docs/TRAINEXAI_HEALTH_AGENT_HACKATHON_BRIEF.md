# TrainexAI Health Agent — Hackathon Execution Brief

## 1. Final Decision

Build a **hybrid hackathon product**:

> **TrainexAI Health Agent — AI Health Decision Engine**

This should be a **new repository inside the existing GitHub organization**, not inside the production TrainexAI repo.

Recommended repo name:

```txt
trainexai-health-agent
```

Relationship:

```txt
trainexai-team
├── trainexai                 # Main startup / production repo
└── trainexai-health-agent    # Hackathon-focused product
```

## 2. Why Hybrid Is Best

Do **not** build directly inside the existing production TrainexAI repo for the hackathon.

Reason:

- Production repo may have unrelated bugs
- Existing auth/admin/API issues can affect demo
- Judges may get confused by large codebase
- Risk of exposing production architecture
- Hackathon demo must be clean and stable

The hackathon repo should reuse:

- TrainexAI branding
- Health/fitness domain logic
- UI style
- Product story
- Future scalability roadmap

But it should not reuse production dependencies like:

- Existing subscription system
- Existing Telegram bot
- Existing admin panel
- Existing production database tables
- Existing feature flags
- Existing payment system

## 3. Product Positioning

Do not pitch it as just an AI fitness chatbot.

Pitch it as:

> **TrainexAI Health Agent helps users stay consistent with fitness and nutrition by converting daily health data into simple personalized decisions.**

Core problem:

> People fail health goals because tracking is boring, advice is generic, and motivation fades.

Core solution:

> Low-effort check-ins + memory + consistency score + AI decision card + weekly health report.

## 4. What To Check Before Starting

### GitHub Organization

Check:

- You can create a new repo inside `trainexai-team`
- Repo can be public/private based on hackathon rules
- You have admin permission in the org
- No secrets are committed
- `.env.example` is included

### Existing TrainexAI Assets

Collect only safe reusable assets:

- Logo
- Brand colors
- Font choices
- Basic landing page style
- Fitness/nutrition calculation ideas
- Screenshots if needed

Do not copy production secrets or full production code.

### Hackathon Rules

Check:

- Whether repo must be public
- Whether deployment link is required
- Whether commit history matters
- Whether AI/API keys are allowed
- Whether open-source license is required
- Submission deadline
- Presentation duration

### Deployment

Decide early:

Frontend:

```txt
Cloudflare Pages
```

Backend:

```txt
Render / Railway / Koyeb / FastAPI deploy option
```

Database:

```txt
Supabase PostgreSQL
```

AI:

```txt
Gemini Flash primary
Rule-based fallback mandatory
```

## 5. Exact Features To Build

Build only these 5 core features.

### Feature 1: User Health Profile

Fields:

- Name
- Age
- Gender optional
- Height
- Weight
- Goal
- Diet preference
- Fitness level
- Injury note optional

Example goals:

- Fat loss
- Muscle gain
- General fitness
- Better consistency

### Feature 2: Daily Check-In

User enters:

- Sleep hours
- Meals eaten
- Workout done or missed
- Water intake
- Mood/energy
- Any note

Input can be simple text first.

Example:

```txt
I slept 5 hours, ate 3 idlis with sambar and tea, skipped workout, drank 1 litre water.
```

### Feature 3: Consistency Score

Score out of 100.

Suggested logic:

```txt
Workout adherence: 30 points
Nutrition quality: 30 points
Sleep: 20 points
Water intake: 10 points
Mood/energy: 10 points
```

No AI needed for this calculation.

### Feature 4: AI Decision Card

This is the hero feature.

Output:

```txt
Today's Health Decision:
Your sleep was low and protein intake is weak. Do a light 15-minute workout today and add dal, paneer, curd, eggs, or sprouts to dinner.
```

AI should generate:

1. One main decision
2. One nutrition action
3. One workout action
4. One accountability message

### Feature 5: Weekly Health Report

Show:

- Average consistency score
- Workout adherence
- Nutrition trend
- Sleep trend
- Biggest improvement
- Biggest problem
- Next week plan

This should be visually clean and demo-friendly.

## 6. What Not To Build

Avoid these for hackathon:

- Symptom analyzer
- Disease diagnosis
- Medicine recommendation
- Emergency health advice
- Full wearable integration
- Payment system
- Subscription plans
- Full admin panel
- Telegram bot
- Complex authentication
- Mobile app

Reason:

These increase risk and reduce demo stability.

## 7. Recommended Tech Stack

### Frontend

Use:

```txt
Next.js
TypeScript
Tailwind CSS
Framer Motion
Chart.js
Lucide Icons
```

Pages:

```txt
/
/profile
/checkin
/decision
/report
/demo
```

### Backend

Recommended for hackathon:

```txt
FastAPI
Python
```

Reason:

- Quick API creation
- Easy AI integration
- Simple Swagger docs
- Lightweight

Alternative:

Use Django only if your team is faster with Django.

### Database

Use:

```txt
Supabase PostgreSQL
```

Tables:

```txt
profiles
checkins
health_decisions
weekly_reports
```

### AI API

Primary:

```txt
Google Gemini Flash
```

Backup:

```txt
Rule-based fallback
```

Optional backup:

```txt
Groq / OpenRouter / Ollama local demo fallback
```

## 8. Backend API Plan

Create these endpoints:

```txt
GET  /health
POST /profile
GET  /profile/{user_id}
POST /checkin
GET  /checkin/today/{user_id}
POST /decision/generate
GET  /decision/today/{user_id}
GET  /weekly-report/{user_id}
GET  /demo-user
```

## 9. Decision Engine Logic

Flow:

```txt
User submits check-in
↓
Backend stores data
↓
Backend calculates consistency score
↓
Backend estimates simple nutrition/workout status
↓
Backend checks if decision already exists today
↓
If exists: return cached decision
↓
If not: call Gemini
↓
If Gemini fails: use rule-based fallback
↓
Save final decision
↓
Return to frontend
```

## 10. AI Cost Control Rules

Important:

```txt
Do not call AI on every page load.
```

Use these rules:

- Maximum 1 AI decision per user per day
- Maximum 1 weekly report per user per week
- Cache AI responses in DB
- Reuse cached result on refresh
- Use backend calculations wherever possible

AI should only explain and personalize.

Backend should calculate:

- Score
- Trends
- Basic nutrition flags
- Workout adherence
- Sleep quality

## 11. AI Safety Rules

TrainexAI must not act like a doctor.

Add disclaimer:

```txt
TrainexAI provides fitness and nutrition guidance only. It does not diagnose, treat, or replace medical professionals.
```

AI must avoid:

- Disease diagnosis
- Medicine dosage
- Treatment claims
- Emergency advice

If user mentions serious symptoms:

```txt
Please consult a qualified healthcare professional immediately.
```

## 12. Rule-Based Fallback Logic

If AI API fails, return fallback decision.

Example rules:

```txt
If sleep < 6 hours:
Recommend light workout and better sleep tonight.

If workout missed:
Recommend 15-minute beginner workout.

If protein appears low:
Suggest dal, paneer, curd, eggs, sprouts, or chicken based on diet preference.

If water < 2 litres:
Suggest drinking 2-3 more glasses.

If mood is low:
Suggest walking and a lighter goal for the day.
```

This protects the demo.

## 13. Frontend Demo Flow

Demo should take 3 minutes.

### Step 1: Problem

Say:

```txt
People fail health goals because tracking is tedious, advice is generic, and motivation fades.
```

### Step 2: Profile

Create user:

```txt
Age: 24
Goal: Fat loss
Diet: Indian vegetarian
Fitness level: Beginner
```

### Step 3: Check-In

Enter:

```txt
I slept 5 hours, ate 3 idlis with sambar and tea, skipped workout, drank 1 litre water.
```

### Step 4: Decision Card

Show AI decision.

### Step 5: Consistency Score

Show score and reason.

### Step 6: Weekly Report

Show trends and next week plan.

### Step 7: Scalability

Explain:

```txt
AI is cached, backend calculates scores, fallback protects demo, and the module can be merged into the main TrainexAI platform later.
```

## 14. Repository Structure

Recommended:

```txt
trainexai-health-agent/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
│
├── backend/
│   ├── app/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── docs/
│   ├── problem-statement.md
│   ├── architecture.md
│   ├── scalability.md
│   └── safety.md
│
├── screenshots/
├── README.md
└── LICENSE
```

## 15. README Must Include

README sections:

```txt
Project title
Problem statement
Solution
Key features
Architecture
Tech stack
AI safety
Scalability
Demo flow
Setup instructions
Environment variables
Future roadmap
```

Opening:

```md
# TrainexAI Health Agent

AI-powered Health Decision Engine built for HackIndia 2026.

TrainexAI Health Agent helps users stay consistent with fitness and nutrition goals by converting daily health data into personalized actions, accountability, and insights.

Built as an innovation module within the broader TrainexAI ecosystem.
```

## 16. Pitch Message

Use this pitch:

```txt
TrainexAI Health Agent is not another fitness tracker or AI chatbot. It is a Health Decision Engine that helps users stay consistent by converting daily food, sleep, workout, and mood data into one simple action plan every day.
```

## 17. Judging Criteria Mapping

### Innovation and Originality

- Decision engine, not chatbot
- Memory-based personalization
- Indian lifestyle and food focus
- AI + rule-based safety fallback

### Technical Implementation

- Next.js frontend
- FastAPI backend
- Supabase database
- Gemini AI integration
- Cached AI responses
- Rule-based fallback

### Real World Impact

- Helps users stay consistent
- Reduces manual tracking burden
- Gives practical daily actions
- Useful for students, employees, gym users, and beginners

### User Experience

- Simple check-in
- One decision card
- No complex dashboard first
- Clear score and weekly report

### Scalability

- AI calls are cached
- Backend does calculations
- Modular architecture
- Can merge into main TrainexAI later

### Presentation Quality

- Easy 3-minute demo
- Strong problem statement
- Clear before/after story
- Clean UI and charts

## 18. Development Order

### Phase 1

- Create repo
- Add README
- Add frontend skeleton
- Add backend skeleton
- Add `.env.example`

### Phase 2

- Build profile form
- Build check-in form
- Add DB tables
- Save and fetch data

### Phase 3

- Add consistency score
- Add rule-based fallback
- Add decision card UI

### Phase 4

- Add Gemini integration
- Add AI caching
- Add safety prompt

### Phase 5

- Add weekly report
- Add charts
- Add demo user
- Polish UI

### Phase 6

- Deploy frontend
- Deploy backend
- Test demo flow
- Record backup demo video
- Prepare pitch

## 19. Final Checklist Before Submission

Check:

- Repo is clean
- README is clear
- No secrets committed
- `.env.example` exists
- Demo URL works
- Backend health route works
- AI fallback works
- Demo user works
- Weekly report works
- Mobile view works
- Pitch is ready
- Screenshots added
- Architecture doc added
- Safety disclaimer visible

## 20. Final Recommendation

Build the hackathon product as:

```txt
TrainexAI Health Agent
```

Inside:

```txt
trainexai-team/trainexai-health-agent
```

Do not directly modify production TrainexAI for the hackathon.

After hackathon, merge the validated feature into the main TrainexAI product as:

```txt
/health-agent
```

Final winning angle:

```txt
Low-effort tracking + Indian lifestyle personalization + daily decision engine + consistency accountability.
```
