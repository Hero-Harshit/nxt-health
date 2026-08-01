import { MessageSquare } from 'lucide-react';

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
  }
];
