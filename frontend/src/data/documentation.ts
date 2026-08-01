import { MessageSquare, ShieldAlert, ShieldCheck } from 'lucide-react';

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
  }
];
