# 🌟 CareerLoop AI — Longitudinal Skill‑to‑Livelihood Outcome Intelligence Platform

> *Solving the critical challenge of tracking employment outcomes, skill gaps, and the real impact of skilling initiatives.*

---

## 📌 Problem Statement

Skilling programs worldwide focus on **training → certification** but rarely answer the pivotal question: **What happens to learners after they receive a certificate?**

Key gaps include:
- Lack of longitudinal data on employment, wage progression, and job retention.
- Inability to link training outcomes to regional labor‑market demands.
- No evidence‑based feedback loop for policymakers or training providers to improve curricula.
- Fragmented data silos across trainees, employers, providers, and government agencies.

These gaps hinder the ability to measure return‑on‑investment (ROI) for public‑funded skilling initiatives and to design data‑driven interventions.

---

## 🛠️ Solution Overview

**CareerLoop AI** is a unified, privacy‑by‑design platform that **tracks the entire employability lifecycle**:

```
Train → Certify → Place → Employ → Retain → Progress → Analyse → Improve
```

It captures post‑certification outcomes, enriches them with explainable AI‑driven skill‑gap analysis, and surfaces actionable insights for:
- **Trainees** – personalized career roadmaps and wage‑growth tracking.
- **Employers** – verification of hires, retention analytics, and skill‑fit scoring.
- **Training Providers** – cohort‑level outcome dashboards and curriculum efficacy metrics.
- **Government & Policymakers** – district‑level heat‑maps, ROI calculations, and AI‑generated policy directives.

---

## 🏛️ System Architecture

```text
CAREERLOOP AI
│
├── TRAINEE ─────── EMPLOYER ─────── TRAINING PROVIDER ─────── GOVERNMENT ADMIN
│
├── AUTHENTICATION (Google OAuth + NextAuth JWT + RBAC)
│
├── API / BACKEND (Server Actions & REST Endpoints)
│
├── CORE DATA & INTELLIGENCE ENGINES
│    ├── Relational DB (Prisma ORM + PostgreSQL / SQLite)
│    ├── Explainable AI Engine (Gemini Generative API + deterministic fallback)
│    └── Longitudinal Analytics Engine (30‑, 90‑, 180‑, 365‑day milestones)
│
└── GOVERNMENT POLICY INTELLIGENCE
      ├── District‑Level Heatmaps & Disparity Analysis
      ├── Course Outcome ROI & Sector Wage Benchmarks
      ├── Provider Efficacy Scorecards
      └── Synthesized Actionable Policy Directives & CSV Exports
```

---

## 🚀 Key Features

### 1. 🎓 Trainee Portal (`/trainee`)
- **Permanent Unique Trainee ID (`CLP-XXXX`)**: Ensures lifecycle continuity across jobs, districts, and training centers.
- **Verifiable Digital Credentials**: Standardized assessment scores and accredited digital certifications.
- **Gamified Milestone & Badges Engine**: Level progression, XP rewards, and milestone badges (e.g. *Goal Setter*, *Skill Ascender*, *Longitudinal Champion*).
- **Automated Longitudinal Follow-Up Engine**: 30, 90, 180, and 365-day check-in questionnaires tracking salary growth and skill relevance.
- **Explainable AI Skill Gap Analyzer & Roadmap**: Diagnostic gap calculation comparing trainee competencies against target role requirements.

### 2. 🏢 Employer Portal (`/employer`)
- **Smart Candidate Matching & Retention Risk**: AI and rule-based candidate-to-job fit scoring with commute and salary alignment heuristics.
- **Bulk Verification Queue (`/employer/bulk-verify`)**: Batch CSV/JSON ingestion to verify multiple employee placement records simultaneously.
- **Two-Tier Verification State Machine**: Clearly distinguishes `Self-Reported` from `Employer-Verified` records with audit logging.
- **Workforce Retention Analytics**: Retention curves and skill alignment metrics for hired cohorts.

### 3. 🏫 Training Provider Portal (`/provider`)
- **Cohort & Batch Management**: Program registration, syllabus scope, and attendance logging.
- **Outcome Conversion Tracking**: Real-time completion-to-placement tracking.
- **Longitudinal Wage Growth Analytics**: Tracks 3-month and 6-month graduate salary progression.

### 4. 🏛️ Government Admin Intelligence (`/admin`)
- **Interactive Policy Scenario Simulator (`/admin/simulator`)**: "What-if" analysis tool allowing administrators to simulate subsidy adjustments, stipend incentives, and placement drives with forecasted ROI and retention curves.
- **Macro Executive KPIs**: Monitored trainees, verified employment rate, 180-day retention %, average wage growth %.
- **District Performance Scorecards**: Multi-bar comparisons and geographic non-placement hot spots.
- **Course & Sector ROI**: Compares completion and salary progression across sectors.
- **Actionable AI Policy Directives & CSV Export**: Automatically converts analytical drop-offs into prioritized administrative directives.
- **System Audit & Consent Logs**: Immutable audit trails and user consent governance.

### 5. 🌐 Interactive Architecture Visualizer (`/architecture`)
- Interactive node diagram explaining data flow across all system tiers.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router, TypeScript, React 18)
- **Styling**: Tailwind CSS, Custom Token Design System (warm ivory canvas, charcoal typography, emerald & amber accents)
- **Visualizations**: Recharts (Longitudinal retention curves, wage progression bars, simulated policy curves, district comparison heatbars)
- **Database & ORM**: Prisma ORM with SQLite (instant zero-config local run) & PostgreSQL support
- **Authentication**: NextAuth.js with Google OAuth & Role-Based Access Control
- **AI Intelligence**: Google Gemini API integration with robust deterministic mathematical fallback
- **Containerization & CI/CD**: Docker (multi-stage Next.js standalone), Docker Compose, GitHub Actions CI
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
