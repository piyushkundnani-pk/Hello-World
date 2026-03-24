# PM SkillForge — AI-Powered PM Skills Assessment Platform

> Paste any PM job posting + upload your resume → Get a personalized skill assessment with case studies, MCQs, and a gap analysis with a study plan — calibrated to YOUR experience against THAT specific role.

## MVP Features

- **Resume Analysis** — Upload PDF or paste text; Claude AI extracts PM skills, experience, seniority, and recruiter-perspective notes
- **JD-Specific Assessment** — 10 scenario-based MCQs + 2 open-ended questions generated per resume+JD combination
- **Live Evaluation** — MCQ answers evaluated locally; open-ended answers evaluated by Claude against PM interview standards
- **Skill Radar Chart** — Visual spider chart showing your levels vs job requirements across 6 skill categories
- **Gap Analysis** — Advantages ✅, Needs Work 🔶, Critical Gaps 🔴 with specific feedback for each skill
- **Personalized Study Plan** — Week-by-week curriculum targeting your specific gaps with prioritized resources

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native + Expo |
| Navigation | React Navigation v6 |
| State Management | Zustand |
| Backend API | Node.js + Express + TypeScript |
| AI Engine | Anthropic Claude (`claude-sonnet-4-20250514`) |
| PDF Parsing | pdf-parse |
| Charts | Custom SVG Radar Chart (react-native-svg) |

## Project Structure

```
skillforge/
├── app/                    # React Native Expo app
│   ├── src/
│   │   ├── screens/        # All app screens
│   │   ├── components/ui/  # Reusable UI components
│   │   ├── stores/         # Zustand state management
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   ├── constants/      # Theme, colors, skill taxonomy
│   │   └── navigation/     # React Navigation setup
│   ├── App.tsx
│   └── package.json
└── server/                 # Node.js backend
    ├── routes/             # API routes
    │   ├── resume.ts       # POST /api/resume/parse-text & parse-pdf
    │   ├── jobPosting.ts   # POST /api/job/parse
    │   ├── assessment.ts   # POST /api/assessment/generate & evaluate-answer
    │   └── analysis.ts     # POST /api/analysis/gap & study-plan
    ├── services/
    │   ├── claude.ts       # All Claude API calls
    │   └── prompts.ts      # All prompt templates
    └── index.ts
```

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Anthropic API key

### 1. Set up the backend

```bash
cd skillforge/server
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm run dev
```

The server starts on `http://localhost:3001`.

### 2. Set up the mobile app

```bash
cd skillforge/app
npm install
# Edit src/services/api.ts and update BASE_URL if needed
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `w` for web.

### 3. Set the API URL

In `app/src/services/api.ts`, set:
```ts
const BASE_URL = 'http://YOUR_LOCAL_IP:3001';  // Use your machine's IP for device testing
```

Or set `EXPO_PUBLIC_API_URL` in a `.env` file in the `app/` directory.

## API Reference

### POST `/api/resume/parse-text`
```json
{ "resumeText": "Full resume as string..." }
```

### POST `/api/resume/parse-pdf`
Multipart form: `resume` (PDF file)

### POST `/api/job/parse`
```json
{ "jobText": "Full job description..." }
```

### POST `/api/assessment/generate`
```json
{
  "resumeJson": { ...parsed resume... },
  "jobJson": { ...parsed job... },
  "mcqCount": 10,
  "openEndedCount": 2
}
```

### POST `/api/assessment/evaluate-answer`
```json
{
  "answer": "A",
  "questionJson": { ...question object... },
  "resumeJson": { ... },
  "jobJson": { ... }
}
```

### POST `/api/analysis/gap`
```json
{
  "resumeJson": { ... },
  "jobJson": { ... },
  "assessmentScores": { ... }
}
```

### POST `/api/analysis/study-plan`
```json
{
  "gapAnalysis": { ... },
  "resumeJson": { ... },
  "jobJson": { ... },
  "daysUntilInterview": 14
}
```

## PM Skill Taxonomy

The app evaluates candidates across 6 categories:

1. **Product Discovery & Strategy** — Problem framing, user research, market analysis, vision
2. **Execution & Delivery** — PRD writing, prioritization, roadmap management, agile
3. **Metrics & Analytics** — Metric frameworks, A/B testing, business/financial metrics
4. **Technical Acumen** — System design, AI/ML product thinking, technical communication
5. **Stakeholder & Leadership** — Cross-functional work, stakeholder management, GTM
6. **Domain Expertise** — Industry/platform knowledge, regulatory awareness (extracted from JD)

Each skill is rated 1–5: Novice → Beginner → Competent → Proficient → Expert

## Roadmap

### V2 (Next)
- Deep Assessment with full case studies
- Text-based Mock Interview (AI hiring manager)
- Adaptive difficulty engine (IRT-inspired)
- Progress tracking over multiple assessments
- PDF report export

### V3 (Future)
- Voice-based mock interview
- Company-specific question banks (FAANG, unicorns)
- Community benchmarks
- Real job board integration
- Interview recording + AI analysis

## Design Philosophy

- **Tone**: Professional but encouraging — like a tough-but-fair mentor
- **Scoring**: Calibrated to real PM interview distributions (8-10 is rare)
- **Specificity**: Every question knows your background and targets this specific JD
- **Honesty**: Gaps are shown clearly with why they matter and how to close them
