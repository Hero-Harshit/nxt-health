# NxtHealth :- Guiding your next healthcare decision.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)

NxtHealth is a full-stack digital health web platform built to solve a really common problem: **Medical terms are confusing, prescriptions are hard to read, and insurance policies feel like legal traps.**

I built NxtHealth to make health information easy to understand, guiding them to choose a perfect health insurance according to their needs without the need of any middle men or agents, help people find affordable generic medicines, and give everyone quick, client-side tools to manage their daily wellness habits.


## ✨ Features & Modules

### 🤖 Core Health Modules

* **🛡️ Health Policy Advisor:** Breaks down health insurance policies, highlighting co-pays, exclusions, and coverage limits in clear terms. Suggests policy depending upon you budget and family size. Highly customizable & personalized. All policies are verified and store in our supabase database.
* **📅 Preventive Health Planner:** Generates personalized health check-up schedules based on age, lifestyle, and individual health profiles. Users have to fill in their accurate health details first in profile section.
* **💊 Generic Medicine Finder:** Finds safe, approved generic alternatives for expensive branded medicines so patients can save money without sacrificing quality. If a medicine is not present in out database we don't give wrong or unknown generic medicine info.
* **📖 Medical Term Explainer:** Translates complex medical terms, lab reports, and doctor notes into plain, simple English that anyone can understand.




### 🧰 Quick Utilities (100% Client-Side)
* **🔥 Calorie Calculator:** A fast daily calorie and macro estimator using the Mifflin-St Jeor formula, featuring instant metric/imperial unit switching.
* **💧 Hydration Tracker:** An interactive daily water tracker with fluid progress rings and auto-resetting localStorage memory.
* **🧘 Breathing Exercise:** A stress-relief tool with visual animations guiding users through Box Breathing (4-4-4-4) and 4-7-8 relaxation techniques.




## 🛠️ Tech Stack

* **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons
* **Backend API:** Node.js / Express hosted on Render
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
