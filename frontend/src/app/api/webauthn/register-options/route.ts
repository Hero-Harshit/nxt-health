import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Get or Create user
    let { data: user, error: fetchError } = await supabase
      .from("visionpay_users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      console.error("Fetch user error:", fetchError);
    }

    let userId = user ? user.id : crypto.randomUUID();

    if (!user) {
      const { error: insertError } = await supabase
        .from("visionpay_users")
        .insert({ id: userId, email });
      if (insertError) {
        console.error("Failed to insert user:", insertError);
        return NextResponse.json({ error: "Database error creating user" }, { status: 500 });
      }
    }

    // RP settings from env
    const rpName = process.env.RP_NAME || "NxtHealth";
    const rpID = process.env.RP_ID || "localhost";

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: email,
      userID: Buffer.from(userId),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform",
      },
    });

    // Update challenge in db
    const { error: updateError } = await supabase
      .from("visionpay_users")
      .update({ currentChallenge: options.challenge })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update challenge:", updateError);
      return NextResponse.json({ error: "Database error saving challenge" }, { status: 500 });
    }

    return NextResponse.json(options);
  } catch (error: any) {
    console.error("WebAuthn Register Options Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
