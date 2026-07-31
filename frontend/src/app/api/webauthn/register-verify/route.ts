import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { verifyRegistrationResponse } from "@simplewebauthn/server";

export async function POST(req: Request) {
  try {
    const { email, credential } = await req.json();
    if (!email || !credential) {
      return NextResponse.json({ error: "Email and credential are required" }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from("visionpay_users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const origin = process.env.ORIGIN || "http://localhost:3000";
    const rpID = process.env.RP_ID || "localhost";

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;
      const { id: credentialID, publicKey: credentialPublicKey, counter } = credential;

      // Base64 encode the binary public key for storage in Supabase text field
      const pubKeyBase64 = Buffer.from(credentialPublicKey).toString("base64");

      const { error: credError } = await supabase
        .from("visionpay_credentials")
        .insert({
          id: credentialID,
          userId: user.id,
          publicKey: pubKeyBase64,
          counter: counter,
          deviceType: "platform",
          backedUp: false,
        });

      if (credError) {
        console.error("Failed to save credentials:", credError);
        return NextResponse.json({ error: "Database error saving credential" }, { status: 500 });
      }

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false, error: "Verification failed" }, { status: 400 });
  } catch (error: any) {
    console.error("WebAuthn Register Verify Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
