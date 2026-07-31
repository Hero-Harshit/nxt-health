import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { billAmount, insuranceCoverage, payeeUPI, hospitalName } = await req.json();
    if (billAmount === undefined || !payeeUPI || !hospitalName) {
      return NextResponse.json({ error: "billAmount, payeeUPI, and hospitalName are required" }, { status: 400 });
    }

    const coverage = insuranceCoverage || 0;
    const payableAmount = billAmount - (billAmount * coverage) / 100;
    const upiLink = `upi://pay?pa=${payeeUPI}&pn=${encodeURIComponent(hospitalName)}&am=${payableAmount}&cu=INR`;
    const transactionId = crypto.randomUUID();

    const { error: insertError } = await supabase
      .from("visionpay_transactions")
      .insert({
        id: transactionId,
        hospitalName,
        billAmount,
        insuranceCoverage: coverage,
        payableAmount,
        payeeUPI,
        upiLink,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Failed to insert transaction:", insertError);
      return NextResponse.json({ error: "Database error saving transaction" }, { status: 500 });
    }

    return NextResponse.json({ transactionId, payableAmount, upiLink });
  } catch (error: any) {
    console.error("Payment Generate Link Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
