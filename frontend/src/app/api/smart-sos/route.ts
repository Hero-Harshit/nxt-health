import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📩 [BACKEND RECEIVED PAYLOAD]:", body);
    
    const { 
      toEmail, 
      full_name, 
      age, 
      gender, 
      height_cm, 
      weight_kg, 
      pre_existing_conditions, 
      family_history, 
      current_policy_details, 
      doctorName, 
      doctorNumber, 
      transcript, 
      allergies,
      latitude,
      longitude
    } = body;

    const hasLocation = latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null;
    const mapsUrl = hasLocation ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}` : null;

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

    // Destructure with strong default fallbacks
    const displayUserName = full_name || "Unknown Patient";
    const displayAge = age || "Not Configured";
    const displayGender = gender || "Not Configured";
    const displayWeight = weight_kg ? (String(weight_kg).includes("kg") ? String(weight_kg) : `${weight_kg} kg`) : "Not Configured";
    const displayHeight = height_cm ? (String(height_cm).includes("cm") ? String(height_cm) : `${height_cm} cm`) : "Not Configured";
    const displayChronicConditions = pre_existing_conditions || "None Listed";
    const displayFamilyHistory = family_history || "None Listed";
    const displayPolicyDetails = current_policy_details || "Not Available";
    const displayDoctorName = doctorName || "Not Configured";
    const displayDoctorNumber = doctorNumber || "Not Configured";
    const displayTranscript = transcript || "No spoken scenario recorded.";
    const displayAllergies = allergies || "None Listed";

    const emailSubject = `🚨 EMERGENCY: NxtHealth Smart SOS Alert for ${displayUserName}`;

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        
        <!-- Red Alert Header Banner -->
        <div style="background: linear-gradient(135deg, #e11d48, #be123c); color: #ffffff; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">🚨 NxtHealth Smart SOS Alert</h2>
          <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9; font-weight: 500;">High-priority medical dispatch summary issued automatically.</p>
        </div>
        
        <!-- Patient Identity -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Patient Identity</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 120px;">Full Name:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700; font-size: 16px;">${displayUserName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Age:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${displayAge}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Gender:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-transform: capitalize;">${displayGender}</td>
            </tr>
          </table>
        </div>

        <!-- Core Vitals & Demographics -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Core Vitals & Demographics</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 120px;">Weight:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${displayWeight}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Height:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${displayHeight}</td>
            </tr>
          </table>
        </div>

        <!-- Medical Profile details -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Medical Profile</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 120px; vertical-align: top;">Known Allergies:</td>
              <td style="padding: 6px 0; color: #ef4444; font-weight: 700;">${displayAllergies}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; vertical-align: top;">Chronic Conditions:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${displayChronicConditions}</td>
            </tr>
          </table>
        </div>

        <!-- History & Records -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">History & Records</h3>
          <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.5; font-weight: 600;">
            ${displayFamilyHistory}
          </p>
        </div>

        <!-- Primary Care Contact -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Primary Care Contact</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 120px;">Doctor Name:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${displayDoctorName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Doctor Contact:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${displayDoctorNumber}</td>
            </tr>
          </table>
        </div>

        <!-- Insurance Verification -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Insurance Verification</h3>
          <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.5; font-weight: 600;">
            ${displayPolicyDetails}
          </p>
        </div>

        <!-- Live Scenario Transcript -->
        <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.02);">
          <h4 style="margin: 0 0 8px 0; font-size: 11px; font-weight: 800; color: #be123c; text-transform: uppercase; letter-spacing: 0.8px;">🔴 Live Scenario Transcript</h4>
          <p style="margin: 0; font-size: 15px; color: #881337; font-style: italic; line-height: 1.6; font-weight: 600;">
            &ldquo;${displayTranscript}&rdquo;
          </p>
        </div>

        ${mapsUrl ? `
        <!-- Patient Location Button -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${mapsUrl}" target="_blank" style="display: inline-block; background-color: #e11d48; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(225,29,72,0.3); border: none; text-align: center;">
            Location of the patient
          </a>
        </div>
        ` : ""}

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
