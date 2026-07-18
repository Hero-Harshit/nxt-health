import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    // 1. Parse incoming request body
    const body = await request.json();
    const { 
      symptoms, 
      latitude, 
      longitude, 
      isMyself, 
      healthPassport, 
      age, 
      gender 
    } = body;

    if (!symptoms) {
      return NextResponse.json(
        { success: false, error: "Symptoms description is required." },
        { status: 400 }
      );
    }

    // 2. Prepare context context for the AI prompt
    const patientName = isMyself ? (healthPassport?.userName || "NxtHealth User") : "Bystander Rescue Patient";
    const patientAge = isMyself ? (healthPassport?.dob ? `${new Date().getFullYear() - new Date(healthPassport.dob).getFullYear()}` : "N/A") : (age || "Unknown");
    const patientGender = isMyself ? (healthPassport?.gender || "N/A") : (gender || "Unknown");
    
    const passportContext = healthPassport 
      ? `
- Blood Type: ${healthPassport.bloodType || "N/A"}
- Chronic Conditions: ${Array.isArray(healthPassport.chronicConditions) ? healthPassport.chronicConditions.join(", ") : "None"}
- Allergies: ${Array.isArray(healthPassport.allergies) ? healthPassport.allergies.join(", ") : "None"}
      `
      : "No portable health passport details provided.";

    const prompt = `
Patient Symptoms: "${symptoms}"
Current GPS Location: Latitude ${latitude || "N/A"}, Longitude ${longitude || "N/A"}
Emergency Contact Details: Name: ${healthPassport?.emergencyContactName || "N/A"}, Email: ${healthPassport?.emergencyContactEmail || "N/A"}
Patient Profile: Name: ${patientName}, Age: ${patientAge}, Gender: ${patientGender}
Health Baseline (Passport):
${passportContext}
    `;

    // 3. Initialize Google GenAI client
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ [Smart SOS API Error]: GEMINI_API_KEY environment variable is not set.");
      return NextResponse.json(
        { success: false, error: "Server AI configuration error." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // 4. Generate triage using live-search-grounded Gemini 1.5 Flash
    console.log("🧠 [Smart SOS API]: Querying Gemini 1.5 Flash with live search grounding...");
    const aiResponse = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite emergency medical dispatch officer. Analyze the incoming patient symptoms, coordinates, and health baseline data. Calculate triage severity, formulate immediate bystander first-aid actions, write a concise clinical brief for emergency crews, and use your Google Search tool to find actual open hospitals specializing in the condition nearest to the provided latitude/longitude. Format everything strictly into the requested JSON data contract.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const rawText = aiResponse.text;
    if (!rawText) {
      throw new Error("Empty response received from Gemini.");
    }

    console.log("📦 [Smart SOS API Raw AI Response]:", rawText);
    const parsedData = JSON.parse(rawText.trim());

    // 5. Send automated fail-safe email via Resend if isMyself is exactly true and healthPassport contains a valid email
    if (
      isMyself === true && 
      healthPassport && 
      typeof healthPassport.emergencyContactEmail === "string" && 
      healthPassport.emergencyContactEmail.trim() !== ""
    ) {
      const emergencyEmail = healthPassport.emergencyContactEmail.trim();
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        console.warn("⚠️ [Smart SOS API Warning]: RESEND_API_KEY is not set. Skipping emergency email dispatch.");
      } else {
        console.log(`📨 [Smart SOS API]: Dispatching emergency email to ${emergencyEmail} via Resend...`);
        const resend = new Resend(resendApiKey);

        const emailContentHtml = `
          <div style="font-family: sans-serif; background-color: #FBF6EE; padding: 24px; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #FFFFFF; border: 3px solid #D9383A; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <h2 style="color: #D9383A; margin-top: 0; font-size: 24px; border-bottom: 2px solid #D9383A; padding-bottom: 12px;">🚨 EMERGENCY CRISIS ALERT</h2>
              
              <p style="font-size: 16px; color: #24322F; line-height: 1.5;">
                An emergency medical triage has been triggered by <strong>${patientName}</strong> via NxtHealth Smart SOS.
              </p>

              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background-color: #F9FAFB;">
                  <td style="padding: 10px; font-weight: bold; border: 1px solid #E5E7EB; width: 35%;">Suspected Issue:</td>
                  <td style="padding: 10px; border: 1px solid #E5E7EB; color: #D9383A; font-weight: bold;">${parsedData.suspectedCondition || "Unknown"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; border: 1px solid #E5E7EB;">Severity Level:</td>
                  <td style="padding: 10px; border: 1px solid #E5E7EB; font-weight: bold;">${parsedData.severity || "CRITICAL"}</td>
                </tr>
                <tr style="background-color: #F9FAFB;">
                  <td style="padding: 10px; font-weight: bold; border: 1px solid #E5E7EB;">GPS Coordinates:</td>
                  <td style="padding: 10px; border: 1px solid #E5E7EB; font-family: monospace;">Lat ${latitude || "N/A"}, Lon ${longitude || "N/A"}</td>
                </tr>
              </table>

              <div style="background-color: #F8FAFC; border-left: 4px solid #1F5B5B; padding: 15px; border-radius: 4px; margin-top: 20px;">
                <h4 style="margin: 0 0 8px 0; color: #1F5B5B; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Digital ER Handover Brief</h4>
                <pre style="margin: 0; white-space: pre-wrap; font-family: monospace; font-size: 13px; color: #334155; line-height: 1.4;">${parsedData.erHandoverBrief || ""}</pre>
              </div>

              <div style="margin-top: 24px; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 12px; text-align: center;">
                This is a fail-safe automated broadcast from NxtHealth Smart SOS.
              </div>
            </div>
          </div>
        `;

        await resend.emails.send({
          from: "NxtHealth Emergency <emergency@nxthealth.support>",
          to: emergencyEmail,
          subject: `🚨 URGENT: Emergency Medical Alert for ${patientName}`,
          html: emailContentHtml,
        }).catch((err) => {
          console.error("❌ [Smart SOS API Resend Error]:", err);
        });
      }
    }

    // 6. Return successful JSON response
    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("❌ [Smart SOS Route Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process emergency triage." },
      { status: 500 }
    );
  }
}
