import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from("visionpay_users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: credentials, error: credError } = await supabase
      .from("visionpay_credentials")
      .select("id")
      .eq("userId", user.id);

    if (credError) {
      console.error("Failed to fetch credentials:", credError);
      return NextResponse.json({ error: "Database error fetching credentials" }, { status: 500 });
    }

    const rpID = process.env.RP_ID || "localhost";

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: (credentials || []).map((cred: any) => ({
        id: cred.id,
        type: "public-key",
      })),
      userVerification: "preferred",
    });

    const { error: updateError } = await supabase
      .from("visionpay_users")
      .update({ currentChallenge: options.challenge })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update challenge:", updateError);
      return NextResponse.json({ error: "Database error saving challenge" }, { status: 500 });
    }

    return NextResponse.json(options);
  } catch (error: any) {
    console.error("WebAuthn Login Options Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
