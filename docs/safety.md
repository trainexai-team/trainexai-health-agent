# AI Safety & Compliance

## Core Principles

TrainexAI Health Agent operates under strict safety guidelines:

> **TrainexAI provides fitness and nutrition guidance only. It does not diagnose, treat, or replace medical professionals.**

## What the AI Can Do ✅

- Suggest fitness and workout routines based on user profile
- Recommend nutrition improvements based on diet preferences
- Provide motivational accountability messages
- Analyze sleep patterns and suggest improvements
- Recommend hydration goals

## What the AI Must Never Do ❌

- Diagnose any disease or medical condition
- Recommend medicine, supplements, or dosages
- Provide emergency medical advice
- Make treatment claims or promises
- Replace professional medical consultation
- Analyze symptoms for diagnosis

## Safety Implementation

### 1. AI System Prompt
The AI is given a strict system prompt that:
- Limits responses to fitness and nutrition only
- Explicitly forbids diagnosis and medical advice
- Instructs the AI to recommend professional help for serious symptoms

### 2. Rule-Based Fallback
If the AI API fails or returns unsafe content, the system falls back to:
- Pre-defined rule-based logic
- No AI dependency for core functionality
- Safe, conservative recommendations

### 3. User-Facing Disclaimer
Every page displays:
```
TrainexAI provides fitness and nutrition guidance only. It does not
diagnose, treat, or replace medical professionals.
```

### 4. Symptom Detection
The AI prompt includes instructions to detect and redirect:
- If user mentions chest pain → redirect to emergency services
- If user mentions severe injury → recommend professional care
- If user mentions symptoms → clarify it's not a diagnostic tool

### 5. No Medical Claims
The application architecture ensures:
- No medical diagnosis features
- No medicine database
- No symptom checker
- No treatment recommendations

## Safety Checklist

- [ ] AI system prompt restricts scope to fitness/nutrition
- [ ] Rule-based fallback for AI failure
- [ ] Safety disclaimer visible on all pages
- [ ] No medical diagnosis features
- [ ] No medicine recommendations
- [ ] No emergency advice
- [ ] Emergency symptom detection in prompt
- [ ] Data privacy (no health record storage beyond check-ins)

## Emergency Protocol

If a user types in serious symptoms:

```
Please consult a qualified healthcare professional immediately.
If this is an emergency, call your local emergency services.
```

The AI is instructed to never attempt to handle medical emergencies and always redirect to professional care.
