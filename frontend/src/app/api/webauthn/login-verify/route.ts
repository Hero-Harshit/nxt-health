import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

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

    const { data: dbCred, error: credError } = await supabase
      .from("visionpay_credentials")
      .select("*")
      .eq("id", credential.id)
      .maybeSingle();

    if (credError || !dbCred) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 });
    }

    const origin = process.env.ORIGIN || "http://localhost:3000";
    const rpID = process.env.RP_ID || "localhost";

    const publicKeyUint8 = Uint8Array.from(Buffer.from(dbCred.publicKey, "base64"));

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: dbCred.id,
        publicKey: publicKeyUint8,
        counter: dbCred.counter,
      },
    });

    if (verification.verified && verification.authenticationInfo) {
      const { newCounter } = verification.authenticationInfo;

      const { error: updateError } = await supabase
        .from("visionpay_credentials")
        .update({ counter: newCounter })
        .eq("id", dbCred.id);

      if (updateError) {
        console.error("Failed to update counter:", updateError);
        return NextResponse.json({ error: "Database error updating counter" }, { status: 500 });
      }

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false, error: "Verification failed" }, { status: 400 });
  } catch (error: any) {
    console.error("WebAuthn Login Verify Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
