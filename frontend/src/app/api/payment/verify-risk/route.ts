import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { amount, payeeUPI } = await req.json();
    if (amount === undefined || !payeeUPI) {
      return NextResponse.json({ error: "Amount and payeeUPI are required" }, { status: 400 });
    }

    const warnings: string[] = [];
    if (amount > 5000) {
      warnings.push(`Large amount alert: You are paying ₹${amount}.`);
    }

    const { data: previousTransaction, error: txError } = await supabase
      .from("visionpay_transactions")
      .select("*")
      .eq("payeeUPI", payeeUPI)
      .limit(1)
      .maybeSingle();

    if (txError) {
      console.error("Failed to query transactions:", txError);
    }

    if (!previousTransaction) {
      warnings.push(`New recipient: You have not paid ${payeeUPI} before.`);
    }

    return NextResponse.json({
      requiresConfirmation: warnings.length > 0,
      warnings,
      isKnownRecipient: !!previousTransaction,
    });
  } catch (error: any) {
    console.error("Payment Verify Risk Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
