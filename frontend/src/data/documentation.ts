import { MessageSquare, ShieldAlert, ShieldCheck, QrCode, CalendarDays, Pill, BookText, ClipboardList } from 'lucide-react';

export type DocSection = {
  heading: string;
  body?: string;
  list?: string[];
};

export type DocModule = {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
  content: DocSection[];
};

export const moduleDocs: DocModule[] = [
  {
    id: 'pam',
    title: 'PAM (AI Assistant)',
    description: 'Learn about your Personal Assistant & Manager and how she helps you navigate NxtHealth.',
    icon: MessageSquare,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'hover:border-indigo-200',
    content: [
      {
        heading: 'What is PAM?',
        body: 'PAM stands for Personal Assistant & Manager. She is the intelligent, empathetic AI receptionist built directly into the NxtHealth platform. Powered by advanced natural language processing, PAM is designed to act as your personal guide, helping you understand complex medical data and seamlessly navigate the application.'
      },
      {
        heading: 'How it Works',
        body: 'PAM is equipped with "System Context Injection," meaning she knows the entire NxtHealth platform inside and out. When you chat with her, she instantly references your current dashboard, the platform\'s available utilities, and built-in medical knowledge to provide accurate, real-time responses formatted in clean, easy-to-read Markdown.'
      },
      {
        heading: 'How it Helps You',
        body: 'PAM is designed to reduce friction and eliminate confusion when managing your healthcare. She can help you by:',
        list: [
          'Explaining complex medical jargon or test results in simple, easy-to-understand terms.',
          'Guiding you to the correct tools, such as the Hospital Bill Checker or the SOS Command Center.',
          'Providing quick summaries of your daily health streaks and Preventive Health Planner.',
          'Acting as a compassionate first point of contact for any platform-related questions.'
        ]
      },
      {
        heading: 'Important Limitations',
        body: 'While PAM is highly intelligent, she is an AI assistant, not a licensed medical professional. She cannot provide official medical diagnoses, prescribe medications, or replace the advice of a human doctor. In the event of a true medical emergency, always use the SOS Emergency Command Center to contact real healthcare providers.'
      }
    ]
  },
  {
    id: 'sos',
    title: 'Smart SOS Command Center',
    description: 'Instantly send emergency alerts, share your location, and contact ambulance services during critical situations.',
    icon: ShieldAlert,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'hover:border-red-200',
    content: [
      {
        heading: 'What is the SOS Command Center?',
        body: 'The Smart SOS Command Center is a life-saving emergency module designed to get you help as fast as possible. With a single tap, it activates an emergency workflow that alerts your loved ones and provides immediate access to emergency services.'
      },
      {
        heading: 'How It Works',
        body: 'When you trigger an SOS, the system performs several critical actions to ensure your safety:',
        list: [
          'Automatically detects your exact GPS location (once permission is granted) to avoid manual entry during urgent situations.',
          'Instantly sends emergency alerts to your selected contacts, including your current location and emergency details.',
          'Provides a dedicated emergency calling option for one-tap access to ambulance and support services without needing to search for numbers.'
        ]
      },
      {
        heading: 'Accidental Triggers',
        body: 'We understand that panic buttons can sometimes be pressed by mistake. If you accidentally trigger an SOS, the system provides a brief window where you can cancel the alert before it is dispatched, preventing unnecessary notifications to your emergency contacts.'
      }
    ]
  },
  {
    id: 'policy-advisor',
    title: 'Health Policy Advisor',
    description: 'Understand your health insurance options, compare policies, and navigate coverage details with AI-powered guidance.',
    icon: ShieldCheck,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'hover:border-teal-200',
    content: [
      {
        heading: 'What is the Health Policy Advisor?',
        body: 'The Health Policy Advisor is your personal guide to navigating the complex world of health insurance. It helps you understand policy options, translates confusing insurance jargon into simple language, and provides personalized guidance based on your specific healthcare needs.'
      },
      {
        heading: 'Finding the Right Policy',
        body: 'Choosing the right insurance can be overwhelming. The Advisor simplifies this by analyzing factors such as your age, family needs, and expected medical expenses to recommend suitable policy features. It allows you to:',
        list: [
          'Compare different health plans based on premiums, coverage limits, hidden benefits, and limitations.',
          'Evaluate critical factors like hospitalization coverage, network hospitals, and claim benefits.',
          'Receive personalized guidance on how much insurance coverage you should realistically consider.'
        ]
      },
      {
        heading: 'Understanding Your Existing Plan',
        body: 'If you already have a health insurance policy, the Advisor helps you make the most of it.',
        list: [
          'Policy Demystification: Explains your current policy terms, coverage details, and hidden benefits in clear, simple language.',
          'Treatment Coverage Check: Helps you review whether a specific medical treatment or procedure might be covered under your policy (Note: Final approval always depends on your insurance provider).'
        ]
      }
    ]
  },
  {
    id: 'vision-pay',
    title: 'Vision Pay',
    description: 'Securely scan hospital UPI QR codes, calculate insurance coverage, and verify bills for potential risks before paying.',
    icon: QrCode,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'hover:border-emerald-200',
    content: [
      {
        heading: 'What is Vision Pay?',
        body: 'Vision Pay is a smart, secure payment assistant designed specifically for healthcare. By simply scanning a hospital\'s UPI QR code (which requires camera permission), it automatically extracts the hospital details and auto-fills your payment form, speeding up the process and reducing manual entry errors.'
      },
      {
        heading: 'How to Use Vision Pay',
        body: 'Vision Pay offers flexibility depending on your situation at the billing counter:',
        list: [
          'Smart QR Scanning: Scan the hospital\'s UPI QR code to instantly capture billing information.',
          'Manual Entry: If a QR code is unavailable, you can manually enter the hospital name, UPI ID, and bill amount.',
          'Insurance Application: Enter your insurance coverage percentage before analysis. Vision Pay will automatically estimate the covered amount and calculate your expected out-of-pocket payable balance.'
        ]
      },
      {
        heading: 'Analyze Bill & Verify Risk',
        body: 'Before you make a payment, Vision Pay acts as a financial safeguard. The "Analyze Bill & Verify Risk" feature checks the extracted billing details for possible inconsistencies and verifies authenticity. This helps identify potential risks, ensuring you make safer and more informed payments at the hospital.'
      }
    ]
  },
  {
    id: 'preventive-planner',
    title: 'Preventive Health Planner',
    description: 'Create customized health routines, track daily activities, and achieve your wellness goals with AI-driven recommendations.',
    icon: CalendarDays,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'hover:border-rose-200',
    content: [
      {
        heading: 'Personalized Health Planning',
        body: 'The Preventive Health Planner lets you create a custom health plan by simply entering your health goals (like fitness, weight management, or general wellness) and preferences. The AI then generates suitable activities, routines, and recommendations tailored specifically to you.'
      },
      {
        heading: 'Daily Tracking & Reports',
        body: 'Stay on top of your wellness journey by tracking your daily progress directly through the dashboard:',
        list: [
          'Activity Logging: Record completed tasks like daily exercise, water intake, and other healthy habits.',
          'Progress Reports: Access health summaries and progress reports to analyze your improvement over time.'
        ]
      },
      {
        heading: 'AI Suggestions & Flexibility',
        body: 'Your health journey is dynamic, and so is the planner:',
        list: [
          'Smart Suggestions: The AI continually analyzes your inputs and progress to provide customized health recommendations that improve over time.',
          'Seamless Updates: You can modify your health goals and routines whenever required. The planner automatically adjusts its recommendations based on your new updates.'
        ]
      }
    ]
  },
  {
    id: 'medical-finder',
    title: 'Generic Medical Finder',
    description: 'Search for medicines, discover cost-effective generic alternatives, and check active compositions.',
    icon: Pill,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'hover:border-orange-200',
    content: [
      {
        heading: 'What is the Generic Medical Finder?',
        body: 'The Generic Medical Finder is a powerful search tool designed to help you understand your medications better. By entering a brand or generic medicine name, you instantly receive basic information, availability, and its active composition.'
      },
      {
        heading: 'Finding Alternatives',
        body: 'One of the core features is finding generic alternatives. The app identifies similar generic medicines with the exact same active ingredients (composition), allowing you to compare available alternatives and potentially save on healthcare costs.'
      },
      {
        heading: 'Usage & Dosage Information',
        body: 'The module provides quick reference details for any searched medicine:',
        list: [
          'Purpose & Usage: Understand what the medicine is used for and its general benefits.',
          'Composition Details: View the active ingredients to easily identify similar medicines.',
          'General Dosage: Provides general dosage guidelines (Note: Always follow your doctor\'s official instructions for actual usage).'
        ]
      }
    ]
  },
  {
    id: 'term-explainer',
    title: 'Medical Term Explainer',
    description: 'Translate complex medical jargon, lab report abbreviations, and conditions into simple language.',
    icon: BookText,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'hover:border-cyan-200',
    content: [
      {
        heading: 'What is the Medical Term Explainer?',
        body: 'Healthcare is full of confusing terminology. The Medical Term Explainer converts difficult healthcare terms, diseases, and conditions into simple, easy-to-understand explanations.'
      },
      {
        heading: 'Understanding Your Documents',
        body: 'You can use the Explainer to decode various types of medical paperwork:',
        list: [
          'Lab Reports: Enter unfamiliar terms mentioned in your medical reports to get a user-friendly explanation of what they mean.',
          'Doctor Prescriptions: Search for medical words or abbreviations found on prescriptions to better understand your doctor\'s notes.',
          'Abbreviations: The module acts as a dictionary for common medical abbreviations, providing their full forms so you can read healthcare documents with confidence.'
        ]
      }
    ]
  },
  {
    id: 'health-passport',
    title: 'Personal Health Passport',
    description: 'Access a complete summary of your medical history, health activities, and insurance details in one centralized report.',
    icon: ClipboardList,
    color: 'text-fuchsia-600',
    bg: 'bg-fuchsia-50',
    border: 'hover:border-fuchsia-200',
    content: [
      {
        heading: 'What is the Personal Health Passport?',
        body: 'The Personal Health Passport (also known as the Personal Health Report) provides a complete, 360-degree summary of your health and insurance information. It intelligently combines your medical records, daily health activities, and insurance details into a single, easy-to-access digital profile.'
      },
      {
        heading: 'What Does It Include?',
        body: 'By organizing your data as you use the NxtHealth platform, your passport consolidates critical information:',
        list: [
          'Medical History & Reports: Quick access to your uploaded medical documents, previous lab results, and general health profile.',
          'Insurance Information: View your insurance provider details, active policy information, and coverage benefits in one dashboard.',
          'Claim Tracking: Monitor insurance claim-related information, eligible medical expenses, and remaining policy benefits.'
        ]
      },
      {
        heading: 'Crucial for Emergencies',
        body: 'Beyond daily organization, this consolidated report is designed to be a lifesaver during critical moments. In an emergency situation, doctors and hospitals can quickly review this passport to understand your vital health and insurance information, leading to faster, safer treatment and smoother administrative processing.'
      }
    ]
  }
];
