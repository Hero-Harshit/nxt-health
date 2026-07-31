import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { emergencyContactEmail, patientName, hospitalName, payableAmount, upiLink, payeeUPI } = await req.json();

    if (!emergencyContactEmail || !hospitalName || !payableAmount || !upiLink) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailUser = process.env.SOS_EMAIL_USER || process.env.GMAIL_USER;
    const emailPass = process.env.SOS_EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

    if (!emailUser || !emailPass) {
      console.error("Missing email configuration env variables.");
      return NextResponse.json({ error: "Email provider not configured on server" }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Verify SMTP connection
    await transporter.verify();

    const mailOptions = {
      from: `"NxtHealth SOS Delegate" <${emailUser}>`,
      to: emergencyContactEmail,
      subject: `SOS Alert: Payment Assistance Required for ${patientName || "a patient"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">
            <span style="font-size: 24px; font-weight: bold; color: #ef4444;">🚨 NxtHealth SOS Alert</span>
          </div>
          
          <p style="font-size: 16px; color: #1e293b; line-height: 1.6;">
            <strong>Immediate Assistance Needed:</strong> 
            ${patientName || "Your contact"} requires emergency payment assistance at <strong>${hospitalName}</strong>.
          </p>
          
          <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">Hospital: <strong>${hospitalName}</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 18px; color: #ef4444; font-weight: bold;">
              Net Payable Amount: ₹${Number(payableAmount).toLocaleString()}
            </p>
          </div>

          <p style="font-size: 14px; color: #475569; margin-bottom: 25px;">
            Please click the secure button below from your mobile device to open GPay, PhonePe, or any compatible UPI application and complete the transaction immediately.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${upiLink}" style="background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 16px; font-weight: bold; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.4);">
              Authorize & Pay ₹${Number(payableAmount).toLocaleString()} via UPI ⚡
            </a>
            <p style="margin-top: 20px; font-size: 13px; color: #64748b;">
              Note: Email providers (like Google/Gmail) might block direct payment link clicks for security reasons.<br/>
              If the button doesn't open your app, manually pay to this UPI ID:<br/>
              <strong style="font-size: 15px; color: #0f172a; display: block; margin-top: 5px;">${payeeUPI || "N/A"}</strong>
            </p>
          </div>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
            This email was sent via NxtHealth VisionPay emergency delegate engine. Dispatched secure session keys.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("SOS Payment Delegation Mail Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
