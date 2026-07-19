# NxtHealth :- Guiding your next healthcare decision.

NxtHealth is a full-stack digital health web platform built to solve a really common problem: **Medical terms are confusing, prescriptions are hard to read, and insurance policies feel like legal traps.**

I built NxtHealth to make health information easy to understand, guiding users to choose a perfect health insurance according to their needs without the need of any middle men or agents, help people find affordable generic medicines, provide instant smart sos emergency assistance tools, and give everyone quick, client-side utilities to manage their daily wellness habits.

## ✨ Features & Modules

### 🤖 Core Health Modules

* **🛡️ Health Policy Advisor:** Breaks down health insurance policies, highlighting co-pays, exclusions, and coverage limits in clear terms. Suggests policies depending upon your budget and family size. Highly customizable & personalized. All policies are verified and stored in our supabase database.
* **🚨 Smart SOS Command Center:** A fast, voice-activated emergency screen designed for high-stress situations. It records your spoken distress scenario in real time, uses an intentional timing cushion to make sure it captures your full message, and instantly emails the transcript to your emergency contact.
* **📋 Health Passport:** A centralized profile space where users store their core health data (age, weight, height, severe allergies, chronic conditions, primary doctor details, and active insurance verification). This data auto-saves securely and feeds directly into the backend SOS alert payload.
* **📅 Preventive Health Planner:** Generates personalized health check-up schedules based on age, lifestyle, and individual health profiles. Users have to fill in their accurate health details first in the profile section.
* **💊 Generic Medicine Finder:** Finds safe, approved generic alternatives for expensive branded medicines so patients can save money without sacrificing quality. If a medicine is not present in our database we don't give wrong or unknown generic medicine info.
* **📖 Medical Term Explainer:** Translates complex medical terms, lab reports, and doctor notes into plain, simple English that anyone can understand.

### 🧰 Quick Utilities (100% Client-Side)
* **🔥 Calorie Calculator:** A fast daily calorie and macro estimator using the Mifflin-St Jeor formula, featuring instant metric/imperial unit switching.
* **💧 Hydration Tracker:** An interactive daily water tracker with fluid progress rings and auto-resetting localStorage memory.
* **🧘 Breathing Exercise:** A stress-relief tool with visual animations guiding users through Box Breathing (4-4-4-4) and 4-7-8 relaxation techniques.

## 🛠️ Tech Stack

* **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Web Speech API (for live emergency voice transcription)
* **Backend API:** Node.js / Express hosted on Render, Next.js API Serverless Routes, Nodemailer (for instant SMTP emergency email alerts)
* **Database & Auth:** Supabase (PostgreSQL + GoTrue Authentication)
* **Deployment:** Vercel (Frontend) & Render (Backend)

## 🚀 Running the Project Locally

If you want to pull the code and run NxtHealth on your machine, follow these steps:

### 1. Clone repository & navigate to frontend directory
* git clone
* cd nxt-health/frontend

### 2. Install dependencies
* npm install

### 3. Create .env.local configuration file
* NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-link.supabase.co
* NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

### 4. Start local development server
* npm run dev

### 5. Do the same for backend
* cd nxt-health/backend
* make sure you use valid api's in .env.local file. (You can get them from google ai studio)
* npm run dev

### Thankyou for visiting my project!