import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toEmail, userName, transcript, policyDetails, allergies, demographics } = body;

    if (!toEmail || typeof toEmail !== "string" || !toEmail.trim()) {
      return NextResponse.json({ success: false, error: "Missing destination email (toEmail)" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("❌ Resend API Key is missing from env variables.");
      return NextResponse.json({ success: false, error: "Email provider config error" }, { status: 500 });
    }

    const resend = new Resend(apiKey);

    const emailSubject = `🚨 EMERGENCY: NxtHealth Smart SOS Alert for ${userName || "Patient"}`;

    const emailText = `
🚨 NXTHEALTH EMERGENCY SOS ALERT DISPATCHED

Patient Name: ${userName || "Unknown"}
Demographics: ${demographics || "Not Configured"}
Current Policy: ${policyDetails || "Not Configured"}
Allergies: ${allergies || "Not Configured"}

=== LIVE TRANSCRIPT OF EMERGENCY SCENARIO ===
"${transcript || "No voice transcription recorded."}"
=============================================

This alert was triggered automatically. Please contact the patient immediately.
`;

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #e11d48; border-radius: 12px; background-color: #fff;">
        <div style="background-color: #e11d48; color: #fff; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">🚨 NXTHEALTH EMERGENCY SOS</h2>
        </div>
        
        <div style="margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
          <p style="font-size: 14px; color: #64748b; margin: 0 0 5px 0;">Patient Identity</p>
          <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 800;">${userName || "Unknown"}</h3>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 140px;">Demographics:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${demographics || "Not Configured"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Current Policy:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${policyDetails || "Not Configured"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Known Allergies:</td>
            <td style="padding: 6px 0; color: #ef4444; font-weight: bold;">${allergies || "Not Configured"}</td>
          </tr>
        </table>

        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Live Scenario Transcript</h4>
          <p style="margin: 0; font-size: 14px; color: #0f172a; font-style: italic; line-height: 1.6; font-weight: 500;">
            "${transcript || "No voice transcription recorded."}"
          </p>
        </div>

        <p style="font-size: 11px; color: #94a3b8; margin: 0; text-align: center;">
          This emergency transmission was generated automatically via the NxtHealth Smart SOS interface.
        </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "SOS Alert <onboarding@resend.dev>",
      to: toEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });

    if (error) {
      console.error("❌ Resend Email send failure:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("❌ API smart-sos exception:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
