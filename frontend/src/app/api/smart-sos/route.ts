import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      toEmail, 
      userName, 
      transcript, 
      weight, 
      height, 
      policyDetails, 
      allergies, 
      chronicConditions, 
      doctorName, 
      doctorNumber 
    } = body;

    if (!toEmail || typeof toEmail !== "string" || !toEmail.trim()) {
      return NextResponse.json({ success: false, error: "Missing destination email (toEmail)" }, { status: 400 });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
      console.error("❌ GMAIL_USER or GMAIL_APP_PASSWORD is missing from environment variables.");
      return NextResponse.json({ success: false, error: "Email provider configuration error" }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    const emailSubject = `🚨 EMERGENCY: NxtHealth Smart SOS Alert for ${userName || "Patient"}`;

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        
        <!-- Red Alert Header Banner -->
        <div style="background: linear-gradient(135deg, #e11d48, #be123c); color: #ffffff; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">🚨 NxtHealth Smart SOS Alert</h2>
          <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9; font-weight: 500;">High-priority medical dispatch summary issued automatically.</p>
        </div>
        
        <!-- Table Section for Patient Identity -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Patient Identity</h3>
          <p style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 800;">${userName || "Unknown Patient"}</p>
        </div>

        <!-- Core Vitals & Demographics -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Core Vitals & Demographics</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 120px;">Weight:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${weight || "Not Configured"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Height:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${height || "Not Configured"}</td>
            </tr>
          </table>
        </div>

        <!-- Medical Profile details -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Medical Profile</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 120px; vertical-align: top;">Known Allergies:</td>
              <td style="padding: 6px 0; color: #ef4444; font-weight: 700;">${allergies || "None Listed"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; vertical-align: top;">Chronic Conditions:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${chronicConditions || "None Listed"}</td>
            </tr>
          </table>
        </div>

        <!-- Primary Care Contact -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Primary Care Contact</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 120px;">Doctor Name:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${doctorName || "Not Configured"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Doctor Contact:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${doctorNumber || "Not Configured"}</td>
            </tr>
          </table>
        </div>

        <!-- Insurance Verification -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Insurance Verification</h3>
          <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.5; font-weight: 600;">
            ${policyDetails || "Not Available"}
          </p>
        </div>

        <!-- Live Scenario Transcript -->
        <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.02);">
          <h4 style="margin: 0 0 8px 0; font-size: 11px; font-weight: 800; color: #be123c; text-transform: uppercase; letter-spacing: 0.8px;">🔴 Live Scenario Transcript</h4>
          <p style="margin: 0; font-size: 15px; color: #881337; font-style: italic; line-height: 1.6; font-weight: 600;">
            &ldquo;${transcript || "No spoken scenario recorded."}&rdquo;
          </p>
        </div>

        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <p style="font-size: 11px; color: #94a3b8; margin: 0; font-weight: 500;">
            This emergency alert transmission was generated automatically via the secure NxtHealth Smart SOS console. Please take immediate action.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"NxtHealth Smart SOS" <${gmailUser}>`,
      to: toEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Nodemailer SOS Dispatch failure:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
