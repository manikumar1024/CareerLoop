# 🌟 CareerLoop AI — Longitudinal Skill-to-Livelihood Outcome Intelligence Platform

> *Solving the critical challenge of tracking employment outcomes, skill gaps, and the real impact of skilling initiatives.*

---

## 🎯 Executive Overview

Traditional vocational and skilling platforms track candidates up to **Certification** and stop. **CareerLoop AI** tracks what happens **afterwards**:
$$\text{Train} \to \text{Certify} \to \text{Place} \to \text{Employ} \to \text{Retain} \to \text{Progress} \to \text{Analyze} \to \text{Improve}$$

CareerLoop AI answers the four fundamental skilling policy questions:
1. **What happened?** (Formal employment, self-employment, apprenticeships, wage progression, retention).
2. **Why did it happen?** (Practical curriculum divergence, localized district vacancy deficits, salary expectation mismatches).
3. **What is likely to happen?** (Explainable AI employability risk modeling, outcome forecasting).
4. **What should be done?** (Evidence-backed policy directives, curriculum modernization, district placement drives).

---

## 🏛️ System Architecture

```
CAREERLOOP AI
 │
 ├── TRAINEE  ────────  EMPLOYER  ────────  TRAINING PROVIDER  ────────  GOVERNMENT ADMIN
 │
 ├── AUTHENTICATION (Google OAuth + NextAuth JWT + RBAC)
 │
 ├── API / BACKEND (Server Actions & REST Endpoints)
 │
 ├── CORE DATA & INTELLIGENCE ENGINES
 │    ├── Relational Database (Prisma ORM + PostgreSQL / SQLite)
 │    ├── Explainable AI Engine (Gemini Generative API + Deterministic Fallback)
 │    └── Longitudinal Analytics Engine (30d, 90d, 180d, 365d Milestones)
 │
 └── GOVERNMENT POLICY INTELLIGENCE
      ├── District-Level Heatmaps & Disparity Analysis
      ├── Course Outcome ROI & Sector Wage Benchmarks
      ├── Training Provider Efficacy Scorecards
      └── Synthesized Actionable Policy Directives & CSV Exports
```

---

## 🚀 Key Features

### 1. 🎓 Trainee Portal (`/trainee`)
- **Permanent Unique Trainee ID (`CLP-XXXX`)**: Ensures lifecycle continuity across jobs, districts, and training centers.
- **Verifiable Digital Credentials**: Standardized assessment scores and NSDC-accredited digital certifications.
- **Employment Journey Tracking**: Supports formal employment, self-employment micro-enterprises, and apprenticeships.
- **Automated Longitudinal Follow-Up Engine**: 30, 90, 180, and 365-day check-in questionnaires tracking salary growth and skill relevance (1-5).
- **Explainable AI Skill Gap Analyzer**: Compares trainee skills against target role taxonomies, outputting a 3-phase personalized learning roadmap.

### 2. 🏢 Employer Verification Portal (`/employer`)
- **Two-Tier Verification State Machine**: Clearly distinguishes `Self-Reported` from `Employer-Verified` records.
- **One-Click Approval / Rejection Queue**: Confirms job designation, salary bracket, and start date.
- **Workforce Retention Analytics**: Retention curves and skill alignment metrics for hired cohorts.

### 3. 🏫 Training Provider Portal (`/provider`)
- **Cohort & Batch Management**: Program registration, syllabus scope, and attendance logging.
- **Outcome Conversion Tracking**: Real-time completion-to-placement tracking.
- **Longitudinal Wage Growth Analytics**: Tracks 3-month and 6-month graduate salary progression.

### 4. 🏛️ Government Admin Intelligence (`/admin`)
- **Macro Executive KPIs**: Monitored trainees, verified employment rate, 180-day retention %, average wage growth %.
- **District Performance Scorecards**: Multi-bar comparisons and geographic non-placement hot spots.
- **Course & Sector ROI**: Compares completion and salary progression across sectors.
- **Actionable AI Policy Directives**: Automatically converts analytical drop-offs into prioritized administrative directives.
- **Dataset Export**: One-click CSV export for offline policy analysis.
- **System Audit & Consent Logs**: Immutable audit trails and user consent governance.

### 5. 🌐 Interactive Architecture Visualizer (`/architecture`)
- Interactive node diagram explaining data flow across all system tiers.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router, TypeScript, React 18)
- **Styling**: Tailwind CSS, Custom Token Design System (warm ivory canvas, charcoal typography, emerald & amber accents)
- **Visualizations**: Recharts (Longitudinal retention curves, wage progression bars, non-placement donuts, district comparison heatbars)
- **Database & ORM**: Prisma ORM with SQLite (instant zero-config local run) & PostgreSQL support
- **Authentication**: NextAuth.js with Google OAuth & Role-Based Access Control
- **AI Intelligence**: Google Gemini API integration with robust deterministic mathematical fallback
- **Icons**: Lucide React

---

## ⚡ Quick Start & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Client
```bash
npx prisma generate
npx prisma db push
```

### 3. Seed Realistic Test Data (Optional for testing)
```bash
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Automated Tests
```bash
npm test
```

### 6. Build Production Bundle
```bash
npm run build
```

---

## 👥 Demo Personas (Pre-Seeded for Quick Testing)

| Role | Email | Password | Access Portal |
|---|---|---|---|
| **Trainee** | `arjun.verma@example.com` | `CareerLoop2026!` | `/trainee` |
| **Employer** | `hr@infosolutions.com` | `CareerLoop2026!` | `/employer` |
| **Training Provider** | `director@puneskillhub.org` | `CareerLoop2026!` | `/provider` |
| **Government Admin** | `admin@careerloop.gov.in` | `CareerLoop2026!` | `/admin` |

*Government Admin Registration Code:* `CAREERLOOP-GOV-ADMIN`

---

## 🔒 Security & Privacy by Design

- **Zero Dummy Data in Production**: Contextual empty states guide users when records are pristine.
- **Stateless Role Guards**: Client-supplied role claims are never trusted; session tokens are validated server-side.
- **Audit Logging**: All verification updates, milestone responses, and policy directives generate immutable log entries.
- **Explicit Consent**: Trainees can inspect and revoke data sharing permissions at any time.

---

## 📜 License & Acknowledgments
Developed as a Civic-Tech Outcome Intelligence solution for India's national skilling ecosystem.
