<div align="center">

# 🔁 CareerLoop

### AI-Powered Outcome Intelligence Platform

**CareerLoop** connects skills, training, employment, and long-term livelihood outcomes into one measurable, actionable intelligence journey — built for trainees, training providers, employers, and government bodies.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

> *"Make every skill count."* — CareerLoop tracks vocational outcomes beyond certification, ensuring no trainee falls through the cracks.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Role-Based System](#-role-based-system)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Certification Wallet](#-certification-wallet)
- [AI Integration](#-ai-integration)
- [Docker Deployment](#-docker-deployment)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

CareerLoop is a **full-stack, production-ready vocational training intelligence platform** that goes beyond simple certification tracking. Traditional training portals stop at the point of course completion — CareerLoop tracks what happens *after* certification across **8 longitudinal lifecycle milestones**:

| # | Milestone | Description |
|---|-----------|-------------|
| 01 | **Train** | NSDC-accredited curriculum delivery |
| 02 | **Certify** | Digital, verifiable skill credentials |
| 03 | **Place** | Employer matching & apprenticeships |
| 04 | **Employ** | Formal & self-employment tracking |
| 05 | **Retain** | 30, 90, 180 & 365-day check-ins |
| 06 | **Progress** | Wage increments & role promotions |
| 07 | **Analyze** | AI skill gap & risk diagnosis |
| 08 | **Improve** | Evidence-backed policy interventions |

This creates a **continuous feedback loop** — hence the name *CareerLoop* — that provides actionable intelligence to every stakeholder in the ecosystem.

---

## ✨ Key Features

### 🎓 For Trainees / Students
- **Certification Wallet** — Upload, manage, and showcase all certifications in one place
- **Digital Credential Storage** — Secure file storage for PDF, JPG, PNG certificates
- **Verification Tracking** — Submit certificates to training providers for verification; track status (Pending → Verified / Rejected)
- **Employment Journey** — Log employment history, salary progressions, and job milestones
- **AI Career Insights** — AI-powered skill gap analysis and career recommendations
- **Longitudinal Tracking** — Automated follow-up at 30d, 90d, 180d, 365d milestones

### 🏢 For Employers
- **Talent Discovery** — Browse verified, employer-ready trainees
- **Bulk Verification** — Verify multiple candidate credentials simultaneously
- **Outcome Reporting** — Report on trainee retention and performance
- **Apprenticeship Management** — Track apprenticeship placements end-to-end

### 🏫 For Training Providers
- **Provider Dashboard** — Overview of all enrolled trainees and placement rates
- **Certificate Verification Portal** — Review and approve/reject submitted credentials
- **Cohort Analytics** — Real-time employment and retention rates per cohort
- **Trainer Management** — Manage trainer profiles and program assignments

### 🏛️ For Government / Administrators
- **District Heat Maps** — Geographic employment outcome visualization
- **National Outcome Dashboard** — Aggregate metrics across all providers and districts
- **Policy Intelligence** — Evidence-backed data for scheme design
- **Compliance Oversight** — Audit logs and consent management
- **Scheme Analytics** — Cross-provider performance comparison

### 🔐 Platform-Wide
- **Role-Based Access Control (RBAC)** — 6 distinct roles with permission-gated routes
- **NextAuth.js Authentication** — Secure session management with credential-based login
- **Audit Logging** — Every sensitive action is logged with timestamp and actor
- **GDPR-style Consent Management** — User consent tracking with timestamped records
- **Admin Approval Workflow** — New accounts require admin approval before access

---

## 👥 Role-Based System

CareerLoop implements a strict **6-role permission system**:

```
TRAINEE              → Student/vocational trainee portal
TRAINER              → Individual trainer managing cohorts
TRAINING_PROVIDER    → Institution managing programs & trainees
EMPLOYER             → Companies hiring & tracking trainees
GOVERNMENT_ADMIN     → Government body for oversight & analytics
ADMINISTRATOR        → Super-admin with full platform access
```

Each role has its own:
- **Dedicated portal** (`/trainee`, `/trainer`, `/provider`, `/employer`, `/government`, `/admin`)
- **Role-specific navigation** and dashboard
- **API route protection** via server-side session validation
- **Scoped data access** — users only see their own data or data within their authority

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | Full-stack React with server components |
| **Language** | TypeScript 5.6 | Type safety across frontend and backend |
| **Styling** | Tailwind CSS 3.4 | Utility-first responsive design |
| **Database** | SQLite (via Prisma) | Portable, file-based relational DB |
| **ORM** | Prisma 5.22 | Type-safe database access & migrations |
| **Auth** | NextAuth.js 4 | Session-based authentication |
| **AI** | Google Generative AI (Gemini) | AI skill gap analysis & recommendations |
| **Charts** | Recharts 2 | Data visualization for outcome dashboards |
| **Icons** | Lucide React | Consistent icon system |
| **Utilities** | clsx, tailwind-merge | Conditional class management |
| **Containerization** | Docker + Docker Compose | Portable deployment |
| **CI/CD** | GitHub Actions | Automated testing & build validation |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CAREERLOOP                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Next.js    │  │  NextAuth.js │  │  Google Gemini   │  │
│  │  App Router  │  │     Auth     │  │   AI Engine      │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│  ┌──────▼─────────────────▼────────────────────▼─────────┐  │
│  │              API Layer (/api/*)                        │  │
│  │  • /auth        • /trainee      • /employer           │  │
│  │  • /admin       • /provider     • /government         │  │
│  │  • /trainer     • /ai                                 │  │
│  └──────────────────────────┬─────────────────────────────┘  │
│                             │                               │
│  ┌──────────────────────────▼─────────────────────────────┐  │
│  │              Prisma ORM Layer                          │  │
│  └──────────────────────────┬─────────────────────────────┘  │
│                             │                               │
│  ┌──────────────────────────▼─────────────────────────────┐  │
│  │              SQLite Database                           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

```
Client Request
    │
    ▼
Next.js Middleware (Auth Check + Role Guard)
    │
    ├── Unauthenticated → /signin
    ├── Wrong Role → /unauthorized
    └── Authorized → Server Component / API Route
                          │
                          ▼
                    Prisma Client
                          │
                          ▼
                    SQLite Database
```

---

## 🗄️ Database Schema

CareerLoop uses a rich relational schema with **18+ models**:

```
User ─────────────┬──► TraineeProfile ──────┬──► Certification
                  │                         ├──► Employment
                  ├──► EmployerProfile       ├──► LongitudinalOutcome
                  │                         └──► SkillAssessment
                  ├──► TrainingProviderProfile
                  │         └──► TrainingProgram ──► Enrollment
                  ├──► TrainerProfile
                  ├──► AuditLog
                  └──► ConsentRecord

Certification ──► TrainingProgram (optional provider link)
Employment ──────► EmployerProfile (employer reference)
```

**Core Models:**

| Model | Description |
|-------|-------------|
| `User` | Central auth entity with role assignment |
| `TraineeProfile` | Extended profile for trainees (district, skills, education) |
| `EmployerProfile` | Company details, industry, verification status |
| `TrainingProviderProfile` | Institution details, accreditation, NSDC codes |
| `TrainerProfile` | Individual trainer qualifications |
| `TrainingProgram` | Courses/programs with duration, fees, and sector |
| `Enrollment` | Many-to-many: trainee ↔ program |
| `Certification` | Digital credentials with file upload & verification status |
| `Employment` | Job history with salary tracking |
| `LongitudinalOutcome` | Milestone check-ins at 30/90/180/365 days |
| `SkillAssessment` | AI-generated skill gap reports |
| `AuditLog` | Immutable action history |
| `ConsentRecord` | GDPR-compliant consent management |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/manikumar1024/CareerLoop.git
cd CareerLoop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#-environment-variables) below).

### 4. Set Up the Database

```bash
# Push schema to SQLite
npm run db:push

# Generate Prisma client
npm run db:generate

# (Optional) Seed with sample data
npm run db:seed
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your First Admin Account

After starting, register at `/signin`. Then manually update your user's role to `ADMINISTRATOR` and set `adminApproved = true` in the database, or use the seed script which creates default accounts.

---

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
# ─── Database ────────────────────────────────────────────────
DATABASE_URL="file:./dev.db"

# ─── NextAuth ────────────────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# ─── Google Gemini AI ────────────────────────────────────────
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
```

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore` by default.

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy it into `GOOGLE_GENERATIVE_AI_API_KEY`

---

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload (http://localhost:3000)

# Production
npm run build        # Build optimized production bundle
npm run start        # Start production server

# Database
npm run db:push      # Sync Prisma schema to database
npm run db:generate  # Regenerate Prisma client
npm run db:seed      # Seed database with sample data

# Code Quality
npm run lint         # Run ESLint checks

# Testing
npm run test         # Run test suite (test/runner.js)
```

---

## 📁 Project Structure

```
CareerLoop/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI pipeline
│
├── prisma/
│   ├── schema.prisma               # Database schema (18+ models)
│   ├── seed.js                     # Database seeding script
│   └── dev.db                      # SQLite database file (gitignored)
│
├── public/
│   └── uploads/
│       └── certificates/           # Uploaded certificate files
│
├── src/
│   ├── app/
│   │   ├── page.tsx                # Landing page
│   │   ├── layout.tsx              # Root layout
│   │   ├── globals.css             # Global styles & design tokens
│   │   │
│   │   ├── signin/                 # Authentication pages
│   │   ├── onboarding/             # Post-registration onboarding
│   │   │
│   │   ├── trainee/                # 🎓 Trainee Portal
│   │   │   ├── dashboard/          #   Overview & stats
│   │   │   ├── certifications/     #   Certification Wallet
│   │   │   ├── employment/         #   Job history tracking
│   │   │   └── profile/            #   Profile management
│   │   │
│   │   ├── employer/               # 🏢 Employer Portal
│   │   │   ├── dashboard/          #   Hiring overview
│   │   │   ├── talent/             #   Trainee discovery
│   │   │   └── verify/             #   Credential verification
│   │   │
│   │   ├── provider/               # 🏫 Training Provider Portal
│   │   │   ├── dashboard/          #   Program overview
│   │   │   ├── programs/           #   Course management
│   │   │   └── certifications/     #   Certificate approvals
│   │   │
│   │   ├── trainer/                # 👨‍🏫 Trainer Portal
│   │   ├── government/             # 🏛️ Government Dashboard
│   │   ├── admin/                  # ⚙️ Super Admin Panel
│   │   │
│   │   └── api/                    # API Routes
│   │       ├── auth/               #   NextAuth handlers
│   │       ├── trainee/            #   Trainee CRUD & certifications
│   │       ├── employer/           #   Employer routes
│   │       ├── provider/           #   Provider management
│   │       ├── government/         #   Analytics & reporting
│   │       ├── admin/              #   Admin management
│   │       └── ai/                 #   AI analysis endpoints
│   │
│   ├── components/
│   │   ├── Charts/                 # Recharts data visualizations
│   │   │   ├── OutcomeRetentionChart.tsx
│   │   │   ├── WageProgressionChart.tsx
│   │   │   ├── DistrictHeatBar.tsx
│   │   │   └── NonPlacementPie.tsx
│   │   └── ui/                     # Reusable UI primitives
│   │
│   ├── lib/
│   │   ├── prisma.ts               # Prisma client singleton
│   │   └── auth.ts                 # NextAuth configuration
│   │
│   └── types/                      # Global TypeScript type definitions
│
├── test/
│   └── runner.js                   # Integration test suite
│
├── Dockerfile                      # Production Docker image
├── docker-compose.yml              # Multi-service Docker setup
├── tailwind.config.js              # Tailwind + design tokens
├── next.config.mjs                 # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
└── .env.example                    # Environment variable template
```

---

## 🔌 API Reference

All API routes are protected by NextAuth session validation. Role authorization is enforced server-side.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/[...nextauth]` | NextAuth sign in/out/session |

### Trainee

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/trainee/profile` | Get trainee profile |
| `POST` | `/api/trainee/profile` | Create/update profile |
| `GET` | `/api/trainee/certifications` | List all certifications |
| `POST` | `/api/trainee/certifications` | Upload new certification |
| `DELETE` | `/api/trainee/certifications/[id]` | Delete a certification |
| `PATCH` | `/api/trainee/certifications/[id]` | Update verification status |
| `GET` | `/api/trainee/employment` | Get employment history |
| `POST` | `/api/trainee/employment` | Add employment record |

### Employer

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/employer/profile` | Get employer profile |
| `GET` | `/api/employer/talent` | Browse available trainees |
| `POST` | `/api/employer/bulk-verify` | Bulk verify credentials |
| `POST` | `/api/employer/outcomes` | Report employment outcomes |

### Government / Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/government/metrics` | National aggregate metrics |
| `GET` | `/api/government/district` | District-level breakdowns |
| `GET` | `/api/government/providers` | Provider performance league |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/skill-gap` | AI skill gap analysis |
| `POST` | `/api/ai/career-path` | AI career path recommendations |

---

## 🏆 Certification Wallet

The **Certification Wallet** is a core feature that allows trainees to manage their digital credentials:

### Upload Flow

```
Trainee selects file (PDF/JPG/PNG)
    │
    ▼
Fill in certificate details
(Name, Issuer, Issue Date, Expiry, Credential ID, Provider)
    │
    ▼
POST /api/trainee/certifications
(multipart/form-data with file)
    │
    ▼
File saved to /public/uploads/certificates/{userId}/{filename}
    │
    ▼
Certification record created in DB with status: PENDING
    │
    ▼
Certificate appears in wallet with status badge
```

### Verification Status Flow

```
PENDING ──► Submitted to Training Provider
    │
    ├──► VERIFIED  ✅  (Provider approves credential)
    └──► REJECTED  ❌  (Provider rejects with reason)
```

### Supported File Formats
- PDF documents
- JPEG / JPG images
- PNG images

---

## 🤖 AI Integration

CareerLoop integrates **Google Gemini AI** for intelligent career support:

### Skill Gap Analysis
- Analyzes a trainee's current certifications, employment history, and sector
- Identifies missing skills for target roles
- Generates personalized upskilling recommendations

### Career Path Intelligence
- Maps trainee profile to viable career trajectories
- Suggests relevant training programs
- Predicts salary progression based on similar profiles

### Configuration

```env
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
```

The AI module uses the `@google/generative-ai` SDK with the `gemini-pro` model.

---

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build the image
docker build -t careerloop:latest .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./prod.db" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  careerloop:latest
```

### Docker Environment

The `Dockerfile` uses a **multi-stage build**:
1. **deps** — Install node_modules
2. **builder** — Build the Next.js app
3. **runner** — Lean production image with only necessary files

---

## ⚙️ CI/CD Pipeline

CareerLoop includes a **GitHub Actions** CI pipeline at `.github/workflows/ci.yml`:

### Pipeline Stages

```yaml
on: [push, pull_request]

jobs:
  test:
    - Checkout code
    - Setup Node.js 18
    - Install dependencies
    - Run lint checks
    - Run test suite
    - Build production bundle
```

### Automated Checks
- ✅ ESLint code quality checks
- ✅ TypeScript type checking (via build)
- ✅ Integration test suite
- ✅ Production build validation

---

## 🎨 Design System

CareerLoop uses a custom **beige & brown luxury** design palette:

| Token | Color | Usage |
|-------|-------|-------|
| `brown-900` | `#2C1A0E` | Primary dark text |
| `brown-800` | `#3D2314` | Headings, brand |
| `brown-700` | `#5C3317` | Interactive elements |
| `brown-500` | `#8B5E3C` | Accent / secondary |
| `brown-300` | `#C4956A` | Borders, muted |
| `beige-50` | `#FAF7F2` | Page background |
| `beige-100` | `#F5EFE6` | Card surfaces |
| `charcoal-800` | `#2D2926` | Body text |

**Typography:** `DM Serif Display` (headings) + `Inter` (body)

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork locally
3. Create a **feature branch**: `git checkout -b feat/your-feature-name`
4. Make your changes
5. **Test**: `npm run test && npm run build`
6. **Commit** with a clear message: `git commit -m "feat: add certificate bulk download"`
7. **Push** to your fork: `git push origin feat/your-feature-name`
8. Open a **Pull Request** against `main`

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Formatting, no logic change
refactor: Code restructuring
test:     Adding/updating tests
chore:    Build process, tooling
```

### Code Style

- TypeScript strict mode enabled
- ESLint + Next.js recommended rules
- Prettier formatting recommended
- Tailwind CSS for all styling

---

## 🔒 Security

- All API routes validate session server-side
- Passwords hashed with **bcryptjs** (salted)
- Role authorization enforced at every API endpoint
- File uploads validated by type and stored outside the API path
- Audit logs record every sensitive action (role changes, approvals, deletions)
- `.env` is `.gitignore`d — secrets never committed

---

## 📊 Sample Data

Run the seed script to populate the database with realistic sample data for testing:

```bash
npm run db:seed
```

This creates:
- Sample users for each role
- Training providers and programs
- Trainee profiles with employment history
- Longitudinal outcome records at various milestones
- Government district metrics

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Manikumar**
- GitHub: [@manikumar1024](https://github.com/manikumar1024)
- Repository: [CareerLoop](https://github.com/manikumar1024/CareerLoop)

---

<div align="center">

**Built with ❤️ to make every skill count.**

⭐ Star this repo if CareerLoop helps you!

</div>
