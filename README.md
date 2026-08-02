# NxtHealth :- Your Complete Healthcare Ecosystem.

NXT Health is an AI-powered digital healthcare platform built to empower users with smarter, faster, and more info rance policies, unclear hospital billing, emergency preparedness, and preventive healthcare. 
* The platform helps users understand medical reports, find affordable generic medicines, choose suitable health insurance without relying on middlemen, verify hospital bills for potential overcharging, make secure healthcare payments through VisionPay, maintain a digital Personal Health Passport, access instant Smart SOS emergency assistance, and organize a Virtual First Aid Box. 
* It also provides a collection of smart health utilities which includes Calorie Tracker, Hydration Tracker, Sleep Tracker, Medicine Time Wheel, Family Health Risk Map, and Breathing Exercises which encourages healthier daily habits. By combining AI-powered insights with practical healthcare tools, NXT Health enables users to make informed, transparent, and confident healthcare decisions through a single unified platform.


## ✨ Features & Modules
## 🤖 Personal Assistant & Manager (PAM)

PAM is the AI-powered healthcare companion at the heart of NxtHealth. It connects all health modules into one intelligent assistant, helping users manage their wellness with personalized insights, smart recommendations, and instant support—all from a single interface.

* ✨ What PAM Can Do
* 🩺 Analyze and summarize medical reports from the Health Vault.
* 💡 Provide personalized health recommendations to improve healthspan and daily wellness.
* 📊 Track daily health metrics like sleep, hydration, stress, and activity.
* 💊 Manage medicines with reminders and adherence tracking.
* 🧾 Verify hospital bills and identify possible overcharges or billing errors.
* 🚨 Assist during emergencies by connecting with the Smart SOS Command Center.
* 💬 Answer health-related questions and guide users using their health data.
* 📈 Monitor overall health progress and motivate users to achieve long-term wellness goals.

### 🤖 Core Health Modules

* **🛡️ Health Policy Advisor:** Breaks down health insurance policies, highlighting co-pays, exclusions, and coverage limits in clear terms. Suggests policies depending upon your budget and family size. Highly customizable & personalized. All policies are verified and stored in our supabase database.
* **🚨 Smart SOS Command Center:** A fast, voice-activated emergency screen designed for high-stress situations. It records your spoken distress scenario in real time, uses an intentional timing cushion to make sure it captures your full message, and instantly emails the transcript to your emergency contact.
* **📋 Personal Health Passport:** A centralized profile space where users store their core health data (age, weight, height, severe allergies, chronic conditions, primary doctor details, and active insurance verification). This data auto-saves securely and feeds directly into the backend SOS alert payload.
* **📅 Preventive Health Planner:** Generates personalized health check-up schedules based on age, lifestyle, and individual health profiles. Users have to fill in their accurate health details first in the profile section.
* **💊 Generic Medicine Finder:** Finds safe, approved generic alternatives for expensive branded medicines so patients can save money without sacrificing quality. If a medicine is not present in our database we don't give wrong or unknown generic medicine info.
* **📖 Medical Term Explainer:** Translates complex medical terms, lab reports, and doctor notes into plain, simple English that anyone can understand.
* **💳 VisionPay:** VisionPay is an AI-powered healthcare payment module that helps users verify hospital bills, estimate insurance coverage, and make secure UPI payments. By analyzing billing details before payment, it promotes transparency and helps users make informed financial decisions during healthcare services.
* **🏥 Hospital Bill Checker:** Compares your hospital bill with standard pricing benchmarks using AI to identify potential overcharging. It helps users make informed and transparent financial decisions before paying medical bills.
* **🗂️ Health Vault:** Health Vault is a secure platform that organizes your medical documents inside your own Google Drive for easy access and management.Connecting Google Drive allows Health Vault to create a dedicated folder where your medical documents are securely stored and organized.
* **📄OCR & Gemini Vision AI:** Extract, analyze, and understand medical documents with AI. Simply upload prescriptions, lab reports, or medical bills to instantly recognize text, receive plain-language explanations, and ask questions about the document for quick and accurate insights.

### 🧰 Quick Utilities (100% Client-Side)
* **🔥 Calorie Calculator:** A fast daily calorie and macro estimator using the Mifflin-St Jeor formula, featuring instant metric/imperial unit switching.
* **💧 Hydration Tracker:** An interactive daily water tracker with fluid progress rings and auto-resetting localStorage memory.
* **🧘 Breathing Exercise:** A stress-relief tool with visual animations guiding users through Box Breathing (4-4-4-4) and 4-7-8 relaxation techniques.
* **💊 Medicine Time Wheel:** Helps users schedule their medicines with timely reminders to avoid missed doses. It organizes medication timings in a simple visual timeline, improving adherence to prescribed treatments.
* **🧬 Family Health Risk Map:** Records your family's medical history to identify potential hereditary health risks. It helps users understand inherited conditions and encourages early preventive care and regular health screenings.
* **🌙 Sleep Tracker:** Tracks your daily sleep duration and patterns to help you build healthier sleep habits. It provides insights into your sleep routine, promoting better overall health and well-being.
* **🩹 Virtual First Aid Box:** Digitally manages your first aid kit by tracking medicines, medical supplies, and their expiry dates. It helps ensure your emergency kit is always stocked, organized, and ready when needed.
* **💚 Longevity Estimator:** Analyze how your daily habits influence your long-term health and estimated lifespan. Receive personalized insights and actionable recommendations to improve your healthspan and support healthier aging.

GitHub Markdown
### 👤 Profile Section

* **👤 View Profile:** Access and manage your personal information, health details, and account settings from a single dashboard. Keeping your profile updated helps NXT Health provide more accurate and personalized healthcare recommendations.
* **❤️ Healthy Heatmaps:** Visualize your overall health progress through an interactive health heatmap. It helps you monitor daily wellness activities, consistency, and healthy habits over time.
* **🏆 Awards and Achievements:** Earn badges and achievements as you complete health goals, maintain healthy routines, and actively use NXT Health. These milestones keep you motivated throughout your wellness journey.
* **📜 History:** View a complete record of your previous activities, searches, and health-related interactions across NXT Health. Your history helps provide a more personalized experience and better AI-powered recommendations over time.
* **📱NxtHealth Mobile App:** Install the NxtHealth Mobile App for the complete healthcare experience. Access GPS-powered Smart SOS, VisionPay QR scanning, camera-based document uploads, and other mobile-exclusive features for seamless healthcare management.

### 🛠️ Tools

* **🏥 Local Hospitals:** Find nearby hospitals with important details such as location, emergency contact numbers, and Google Maps directions. This tool helps users quickly locate trusted healthcare facilities during emergencies.
* **☎️ Emergency Helplines:** Access important emergency contact numbers for ambulance services, hospitals, police, fire, and other essential healthcare support. It ensures immediate assistance is always just a click away.

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