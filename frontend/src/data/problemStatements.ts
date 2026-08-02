export interface ProblemStatement {
  id: string;
  title: string;
  priority: number;
  category: 'Core AI' | 'Emergency' | 'Finance' | 'Intelligence' | 'Records' | 'Wellness' | 'Utilities' | 'Platform';
  badge: string;
  problem: string;
  solution: string;
}

export const MAIN_PLATFORM_PROBLEM = {
  title: "NxtHealth Ecosystem Platform",
  problem: "Modern healthcare is deeply fragmented. Patients struggle to navigate complex medical billing, decipher technical lab reports, maintain scattered medical records, and access immediate emergency assistance—leading to administrative delay, financial stress, and compromised health outcomes.",
  solution: "NxtHealth unifies personal healthcare into an explainable decision workspace. By combining real-time AI assistance (PAM), hardware-secured emergency dispatch, automated hospital bill audits, and encrypted health records into one cohesive dashboard, NxtHealth empowers users with complete clarity and ownership over their health journey."
};

export const PROBLEM_STATEMENTS: ProblemStatement[] = [
  {
    id: 'pam',
    priority: 1,
    title: 'Personal Assistant & Manager (PAM)',
    category: 'Core AI',
    badge: 'PRIORITY 01',
    problem: 'Managing personal health data across multiple apps, diagnostic PDFs, and paper files creates cognitive overload, making proactive health management confusing.',
    solution: 'PAM serves as an intelligent health companion that synthesizes health logs, analyzes lab reports, verifies bill accuracy, and delivers actionable daily wellness guidance in natural language.'
  },
  {
    id: 'sos',
    priority: 2,
    title: 'Smart SOS Emergency Dispatcher',
    category: 'Emergency',
    badge: 'PRIORITY 02',
    problem: 'In critical medical crises, every second counts. Traditional dialer navigation and manual location sharing cause dangerous delays in emergency response times.',
    solution: 'The one-tap SOS system instantly broadcasts real-time GPS coordinates to emergency delegates and connects directly with local emergency helplines without unnecessary screen steps.'
  },
  {
    id: 'bill-checker',
    priority: 3,
    title: 'Hospital Bill Overcharge Checker',
    category: 'Finance',
    badge: 'PRIORITY 03',
    problem: 'Patients frequently face inflated medical bills without knowing the standardized regional benchmarks for procedures, leading to hidden financial exploitation.',
    solution: 'An AI price engine compares quoted procedure amounts against regional tier benchmarks (Tier 1/2/3) to instantly flag overcharges and equip patients with transparent cost data.'
  },
  {
    id: 'visionpay',
    priority: 4,
    title: 'VisionPay & Insurance Deductor',
    category: 'Finance',
    badge: 'PRIORITY 04',
    problem: 'Deciphering line-item hospital bills, verifying insurance co-pays, and completing payments at billing counters often causes long waits and confusion.',
    solution: 'VisionPay uses optical QR scanning to parse hospital invoices, automatically calculates insurance coverage deductions, and enables safe biometric UPI settlement.'
  },
  {
    id: 'policy-advisor',
    priority: 5,
    title: 'Health Policy Advisor',
    category: 'Intelligence',
    badge: 'PRIORITY 05',
    problem: 'Insurance policies are dense with legalese, fine print, and hidden exclusion clauses that leave policyholders unprotected when claiming expenses.',
    solution: 'Translates complex policy documentation into simplified language, offering side-by-side coverage comparisons and proactive clause warnings prior to plan selection.'
  },
  {
    id: 'medical-explainer',
    priority: 6,
    title: 'Medical Term & Report Explainer',
    category: 'Intelligence',
    badge: 'PRIORITY 06',
    problem: 'Clinical diagnostic jargon, Latin medical abbreviations, and lab value ranges leave patients unable to understand their own medical reports.',
    solution: 'Instantly decodes medical abbreviations and complex diagnostic terms into plain, plain-English summaries to enhance patient health literacy.'
  },
  {
    id: 'health-vault',
    priority: 7,
    title: 'Health Vault (Google Drive Integration)',
    category: 'Records',
    badge: 'PRIORITY 07',
    problem: 'Medical documents scattered across messaging apps, email threads, and physical folders are easily lost or unavailable during urgent consultations.',
    solution: 'A secure cloud vault that seamlessly indexes and categorizes medical records directly within the user’s personal Google Drive for instant, privacy-focused retrieval.'
  },
  {
    id: 'health-passport',
    priority: 8,
    title: 'Digital Health Passport',
    category: 'Records',
    badge: 'PRIORITY 08',
    problem: 'Carrying physical medical binders between multiple specialists and emergency rooms leads to incomplete clinical histories and repetitive paperwork.',
    solution: 'Consolidates allergy history, prescriptions, chronic conditions, and emergency details into a single digital passport with one-click secure sharing.'
  },
  {
    id: 'longevity-estimator',
    priority: 9,
    title: 'Longevity & Healthspan Estimator',
    category: 'Wellness',
    badge: 'PRIORITY 09',
    problem: 'Most individuals remain unaware of how chronic daily habits like sleep debt, stress, and diet compound over decades to impact biological lifespan.',
    solution: 'Evaluates lifestyle biomarkers to project estimated healthspan vs. lifespan, delivering personalized daily interventions to foster healthier aging.'
  },
  {
    id: 'preventive-planner',
    priority: 10,
    title: 'Preventive Health Planner',
    category: 'Wellness',
    badge: 'PRIORITY 10',
    problem: 'Preventive care routines are frequently abandoned due to a lack of structured schedules, personalized checkup reminders, and habit tracking.',
    solution: 'Generates customized wellness schedules with automated reminders for preventive screenings, hydration, and medication adherence.'
  },
  {
    id: 'generic-medicine',
    priority: 11,
    title: 'Generic Medicine Finder',
    category: 'Wellness',
    badge: 'PRIORITY 11',
    problem: 'Branded prescriptions impose a heavy financial burden on patients who are unaware of identical, lower-cost bioequivalent generic alternatives.',
    solution: 'Searches active pharmaceutical ingredients (APIs) to display safe, cost-effective generic alternatives alongside key usage and safety guidance.'
  },
  {
    id: 'utilities',
    priority: 12,
    title: 'Health Utilities Suite',
    category: 'Utilities',
    badge: 'PRIORITY 12',
    problem: 'Isolated tracking apps force users to download multiple single-purpose tools for basic wellness needs like calories, hydration, sleep, and breathing.',
    solution: 'An all-in-one interactive utility suite featuring Calorie & Hydration Trackers, Box Breathing timers, Medicine Time Wheels, Family Risk Maps, Sleep Trackers, and Virtual First Aid inventory.'
  },
  {
    id: 'emergency-services',
    priority: 13,
    title: 'Local Hospitals & Helplines',
    category: 'Platform',
    badge: 'PRIORITY 13',
    problem: 'Searching online for nearby emergency facilities or specialized hotline numbers during urgent situations leads to panic and lost time.',
    solution: 'Provides localized directory listings for nearby accredited hospitals with direct contact numbers, map routes, and centralized national emergency helplines.'
  },
  {
    id: 'engagement',
    priority: 14,
    title: 'Healthy Heatmap, Achievements & Profile',
    category: 'Platform',
    badge: 'PRIORITY 14',
    problem: 'Without visual progress tracking and positive reinforcement, users lose consistency with daily health management goals over time.',
    solution: 'Gamifies wellness through continuous streak heatmaps, unlockable milestone badges, and a comprehensive profile dashboard that celebrates health consistency.'
  }
];
