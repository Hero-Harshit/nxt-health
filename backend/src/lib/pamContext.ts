export function buildPamContextServer(historyLogs: any[]): string {
  // 1. Platform Documentation (Simplified and token-efficient)
  const docsContext = `
MODULE: PAM (AI Assistant)
Description: Learn about your Personal Assistant & Manager and how she helps you navigate NxtHealth.
Key Features: Explain complex medical jargon, guide you to correct tools, view daily streaks, and provide compassion.

MODULE: Smart SOS Command Center
Description: Instantly send emergency alerts, share your location, and contact ambulance services.
Key Features: Detects GPS location, sends alerts to emergency contacts, and provides one-tap emergency calling.

MODULE: Health Policy Advisor
Description: Understand your health insurance options, compare policies, and navigate coverage.
Key Features: Match custom policy benefits, compare plans based on sum insured/PED waiting period, and understand room rent rules.

MODULE: Vision Pay
Description: Scan hospital UPI QR codes, calculate coverage, and verify bills for risks before paying.
Key Features: Extract QR details, estimate coverage ratios, perform AI risk checking, and complete secure payment.

MODULE: Preventive Health Planner
Description: Create customized health routines, track daily activities, and achieve goals.
Key Features: AI wellness analysis, custom diet/exercise recommendations, lifestyle progress tracker, and health screening timeline.

MODULE: Generic Medical Finder
Description: Search for medicines, discover generic alternatives, and check active compositions.
Key Features: Search brand/active ingredients, compare brand vs. generic pricing, check dosage formats, and find generic manufacturers.

MODULE: Medical Term Explainer
Description: Explains medical conditions, prescription abbreviations, and lab values.
Key Features: Simple term definitions, explanation of prescription schedules, and confidence score mapping.

MODULE: Hospital Bill Checker
Description: Compare hospital bills against regional standard pricing benchmarks.
Key Features: Detect overcharging, check minimum/maximum standard prices by city tier, and receive billing advocate action tips.
  `.trim();

  // 2. Platform FAQs
  const faqsContext = `
Q: How do I pay my hospital bill using VisionPay?
A: Scan the hospital's UPI QR code or enter the billing details manually. VisionPay verifies the bill and guides you through a secure payment process.

Q: How can I send an emergency SOS alert?
A: Tap the SOS button to instantly send an emergency alert to your saved contacts. The alert includes your current location and emergency details for quick assistance.

Q: How can I find a medicine using Medical Finder?
A: Enter the medicine name in the search bar to find its details. The app displays basic information and active ingredients.

Q: How does the Hospital Bill Checker work?
A: Enter the medical procedure, quoted amount, and city tier. The checker compares your quote against national databases and warns if you are overcharged.
  `.trim();

  // 3. Format Recent User History Logs
  let userHistoryContext = 'No recent user activity recorded.';
  try {
    if (historyLogs && historyLogs.length > 0) {
      userHistoryContext = historyLogs
        .slice(0, 8)
        .map(log => `- [${log.date || 'Recent'}] (${String(log.type || 'activity').toUpperCase()}): ${log.title || log.description}`)
        .join('\n');
    }
  } catch (e) {
    console.warn('Could not retrieve history logs for PAM:', e);
  }

  // 4. Combine into Unified System Instruction
  return `
SYSTEM INSTRUCTIONS & CONTEXT FOR PAM:
You are PAM (Personal Assistant & Manager), the intelligent AI health assistant for NXT Health.
Your goal is to provide proactive, empathetic, accurate, and concise healthcare guidance.

=== PLATFORM KNOWLEDGE BASE (DOCUMENTATION) ===
Use this official documentation to explain features, answer "how-to" questions, and direct users around NXT Health:
${docsContext}

=== PLATFORM FREQUENTLY ASKED QUESTIONS (FAQS) ===
${faqsContext}

=== LIVE USER RECENT ACTIVITY & CONTEXT ===
Below is the user's recent activity history on NXT Health. Use this context to answer queries seamlessly (e.g., if they ask about a bill, generic search, or health plan they just ran):
${userHistoryContext}

=== INSTRUCTIONS ===
1. Be warm, professional, concise, and helpful.
2. Reference the user's recent activity directly when relevant to save them time (e.g. if they ask "what did I just check?", mention their latest log).
3. If asked about platform features or policies, use the exact details from the Platform Knowledge Base.
4. Never invent fake health policies or legal guarantees.
`.trim();
}
