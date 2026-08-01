import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Securely initialize Gemini (Checks both standard and NEXT_PUBLIC prefixes to avoid mismatch)
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey as string);

// Hardcoded Backend Reference Data (Zero Database Latency)
const PROCEDURES_DATA: Record<string, { min: number; max: number }> = {
  "MRI Scan": { "min": 3000, "max": 15000 },
  "CT Scan": { "min": 2000, "max": 8000 },
  "X-Ray": { "min": 300, "max": 1200 },
  "Ultrasound Scan": { "min": 800, "max": 3000 },
  "ECG": { "min": 200, "max": 700 },
  "2D Echo": { "min": 2000, "max": 6000 },
  "TMT (Stress Test)": { "min": 2000, "max": 5000 },
  "Blood Test (CBC)": { "min": 300, "max": 800 },
  "Thyroid Function Test": { "min": 500, "max": 2000 },
  "Liver Function Test": { "min": 700, "max": 2500 },
  "Kidney Function Test": { "min": 700, "max": 2500 },
  "Endoscopy": { "min": 4000, "max": 15000 },
  "Colonoscopy": { "min": 8000, "max": 25000 },
  "Appendectomy (Appendix Removal)": { "min": 45000, "max": 100000 },
  "Gallbladder Removal": { "min": 60000, "max": 200000 },
  "Hernia Repair": { "min": 50000, "max": 150000 },
  "Normal Delivery": { "min": 40000, "max": 120000 },
  "Cesarean Delivery (C-Section)": { "min": 70000, "max": 200000 },
  "Kidney Stone Removal (Laser)": { "min": 50000, "max": 200000 },
  "Dialysis (Per Session)": { "min": 2500, "max": 5500 },
  "Angiography": { "min": 18000, "max": 45000 },
  "Angioplasty (1 Stent)": { "min": 180000, "max": 450000 },
  "Cataract Surgery": { "min": 25000, "max": 80000 },
  "LASIK Eye Surgery": { "min": 25000, "max": 100000 },
  "Root Canal Treatment": { "min": 4000, "max": 12000 },
  "Dental Implant": { "min": 25000, "max": 60000 },
  "Hair Transplant": { "min": 50000, "max": 180000 },
  "Dengue Treatment": { "min": 15000, "max": 80000 },
  "Typhoid Treatment": { "min": 10000, "max": 50000 },
  "Pneumonia Treatment": { "min": 25000, "max": 120000 },
  "Tonsillectomy": { "min": 40000, "max": 90000 },
  "Sinus Surgery": { "min": 70000, "max": 200000 },
  "Thyroid Surgery": { "min": 80000, "max": 220000 },
  "Hysterectomy": { "min": 80000, "max": 250000 },
  "Knee Replacement": { "min": 250000, "max": 550000 },
  "Hip Replacement": { "min": 280000, "max": 600000 },
  "Varicose Vein Surgery": { "min": 60000, "max": 180000 },
  "Hemorrhoid (Piles) Surgery": { "min": 40000, "max": 120000 },
  "Chemotherapy (Per Cycle)": { "min": 20000, "max": 120000 },
  "Pacemaker Implantation": { "min": 200000, "max": 600000 }
};

export async function POST(req: Request) {
  try {
    const { procedure, amount, cityTier } = await req.json();

    if (!procedure || !amount || !cityTier) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const benchmark = PROCEDURES_DATA[procedure];
    if (!benchmark) {
      return NextResponse.json({ error: "Procedure not found in database" }, { status: 404 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a fierce, expert Medical Billing Advocate in India. 
      Analyze this hospital bill quote to protect the patient from overcharging.
      
      Patient's Scenario:
      - Procedure: ${procedure}
      - Quoted Amount: ₹${amount}
      - Location: ${cityTier}
      
      National Benchmark Database:
      - Absolute Minimum: ₹${benchmark.min}
      - Absolute Maximum: ₹${benchmark.max}

      Analysis Rules:
      1. Tier 3/Rural locations should be billed very close to the Minimum.
      2. Tier 2 locations should be around the middle range.
      3. Tier 1 (Metros) can be near the Maximum, but should not exceed it.
      4. Do NOT give generic advice. Use specific healthcare billing terms (e.g., 'itemized bill', 'consumables', 'implant price caps').

      Output your response EXACTLY in the following JSON format without any markdown backticks (\`\`\`) or extra text:
      {
        "verdict": "Fair Price" | "Slightly High" | "Severe Overcharge" | "Great Deal",
        "color": "GREEN" | "YELLOW" | "RED" | "BLUE",
        "explanation": "A 2-3 sentence nuanced explanation referencing their specific city tier and the benchmark gap.",
        "tips": ["Specific action step 1", "Specific action step 2", "Specific action step 3"]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Log the raw response to the server terminal for debugging
    console.log("Raw Gemini Response:", responseText);

    // Bulletproof JSON Extraction: Find the first '{' and the last '}'
    const startIndex = responseText.indexOf('{');
    const endIndex = responseText.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Gemini response did not contain a valid JSON object.");
    }

    const cleanJsonString = responseText.substring(startIndex, endIndex + 1);
    const aiData = JSON.parse(cleanJsonString);

    return NextResponse.json(aiData, { status: 200 });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ 
      error: "Failed to analyze bill", 
      details: error?.message || String(error) 
    }, { status: 500 });
  }
}
