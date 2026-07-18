import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });

import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { callGeminiJSON } from "./lib/geminiClient.js";

const app = express();

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "placeholder-anon-key";

console.log("📂 Current Working Directory:", process.cwd());
console.log("🔑 Available Env Keys:", Object.keys(process.env).filter(key => 
  ['PORT', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'GEMINI_API_KEY'].includes(key)
));

const supabase = createClient(supabaseUrl, supabaseKey);

const getAuthUser = async (req: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
};

const calculateCompletion = (profile: any) => {
  const fields = [
    "full_name",
    "age",
    "gender",
    "height_cm",
    "weight_kg",
    "pre_existing_conditions",
    "family_history",
    "smoking_status",
    "activity_level",
    "dietary_preference"
  ];
  let filledCount = 0;
  fields.forEach((field) => {
    const val = profile[field];
    if (val === undefined || val === null) return;
    if (Array.isArray(val)) {
      if (val.length > 0) filledCount++;
    } else if (typeof val === "number") {
      if (val > 0) filledCount++;
    } else if (typeof val === "string") {
      if (val.trim() !== "") filledCount++;
    } else {
      filledCount++;
    }
  });
  return Math.round((filledCount / fields.length) * 100);
};

async function recordUserHistory(userId: string, moduleName: string, queryText: string, summaryResult: string) {
  try {
    console.log(`⏳ [HISTORY DB INSERT]: Attempting insert for User: ${userId} (${moduleName})`);
    const { data, error } = await supabase.from("user_history").insert({
      user_id: userId,
      module: moduleName,
      query_text: queryText || "N/A",
      summary_result: summaryResult || "Completed",
    });
    if (error) {
      console.error("❌ [HISTORY DB ERROR]:", error.message, error.details);
    } else {
      console.log(`✅ [HISTORY DB SUCCESS]: Module: "${moduleName}" for User: ${userId}`);
    }
  } catch (err) {
    console.error("❌ [HISTORY EXCEPTION]:", err);
  }
}

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.CORS_ORIGIN,
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
  }),
);
app.use(express.json());

app.get("/api/ping", (_, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/api/insurance-advisor", async (req, res) => {
  try {
    const {
      age,
      budgetBand,
      kidsCount,
      policyType,
      cityTier,
      maxPedWaitingMonths,
      requiresMaternity,
      requiresNoRoomRentCap,
      requiresOpd
    } = req.body ?? {};

    if (typeof age !== "number" || typeof budgetBand !== "string" || typeof kidsCount !== "number") {
      res.status(400).json({
        status: "error",
        message: "Invalid input. age, budgetBand, and kidsCount are required and must be of correct types.",
      });
      return;
    }

    const budgetBands: Record<string, { min: number; max: number }> = {
      Economy: { min: 5000, max: 15000 },
      Moderate: { min: 15000, max: 35000 },
      Premium: { min: 35000, max: Infinity },
    };

    const budget = budgetBands[budgetBand] || { min: 0, max: Infinity };

    const queryPolicies = async (options: {
      useKids: boolean;
      useBudget: boolean;
      budgetMultiplier: number;
      usePed: boolean;
      usePolicyType: boolean;
    }) => {
      let query = supabase
        .from("policies")
        .select("*, policy_details!policy_id(*)")
        .lte("min_entry_age", age)
        .gte("max_entry_age", age);

      if (options.useKids) {
        query = query.or(`max_dependents.gte.${kidsCount + 1},max_dependents.is.null`);
      }

      if (options.useBudget) {
        let minCol = "premium_min_20_35";
        let maxCol = "premium_max_20_35";
        if (age >= 36 && age <= 50) {
          minCol = "premium_min_36_50";
          maxCol = "premium_max_36_50";
        } else if (age > 50) {
          minCol = "premium_min_50plus";
          maxCol = "premium_max_50plus";
        }

        const effectiveMax = budget.max * options.budgetMultiplier;
        if (effectiveMax !== Infinity) {
          query = query.lte(minCol, effectiveMax);
        }
        if (budget.min !== 0) {
          query = query.gte(maxCol, budget.min);
        }
      }

      if (options.usePed && typeof maxPedWaitingMonths === "number" && maxPedWaitingMonths > 0) {
        query = query.lte("ped_waiting_months", maxPedWaitingMonths);
      }

      if (options.usePolicyType && policyType) {
        query = query.or(`policy_type.eq.${policyType},policy_type.eq.Both`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    };

    let matchedPolicies: any[] = [];
    let relaxationTag = "strict";

    matchedPolicies = await queryPolicies({
      useKids: true,
      useBudget: true,
      budgetMultiplier: 1.0,
      usePed: true,
      usePolicyType: true
    });

    if (matchedPolicies.length === 0) {
      matchedPolicies = await queryPolicies({
        useKids: true,
        useBudget: true,
        budgetMultiplier: 1.1,
        usePed: true,
        usePolicyType: true
      });
      relaxationTag = "soft_budget";
    }
    if (matchedPolicies.length === 0) {
      matchedPolicies = await queryPolicies({
        useKids: true,
        useBudget: false,
        budgetMultiplier: 1.0,
        usePed: true,
        usePolicyType: true
      });
      relaxationTag = "drop_budget";
    }
    if (matchedPolicies.length === 0) {
      matchedPolicies = await queryPolicies({
        useKids: false,
        useBudget: true,
        budgetMultiplier: 1.0,
        usePed: true,
        usePolicyType: true
      });
      relaxationTag = "drop_kids";
    }
    if (matchedPolicies.length === 0) {
      matchedPolicies = await queryPolicies({
        useKids: false,
        useBudget: false,
        budgetMultiplier: 1.0,
        usePed: false,
        usePolicyType: false
      });
      relaxationTag = "drop_additional_constraints";
    }

    if (matchedPolicies.length === 0) {
      res.status(200).json({ status: "no_match", results: [] });
      return;
    }

    const topMatches = matchedPolicies.slice(0, 3);

    const candidatesPrompt = topMatches.map((policy) => {
      const details = Array.isArray(policy.policy_details) ? policy.policy_details[0] : policy.policy_details;
      return {
        id: policy.id,
        insurer_name: policy.insurer_name,
        plan_name: policy.plan_name,
        min_entry_age: policy.min_entry_age,
        max_entry_age: policy.max_entry_age,
        sum_insured_options: policy.sum_insured_options,
        ped_waiting_months: policy.ped_waiting_months,
        policy_type: policy.policy_type,
        max_dependents: policy.max_dependents,
        premiums: {
          age_20_35: { min: policy.premium_min_20_35, max: policy.premium_max_20_35 },
          age_36_50: { min: policy.premium_min_36_50, max: policy.premium_max_36_50 },
          age_50plus: { min: policy.premium_min_50plus, max: policy.premium_max_50plus }
        },
        room_rent_capping_rules: details?.room_rent_capping_rules || null,
        maternity_benefit_details: details?.maternity_benefit_details || null,
        copay_percentage: details?.copay_percentage || null,
        claim_settlement_ratio_percentage: details?.claim_settlement_ratio_percentage || null,
        opd_coverage_details: details?.opd_coverage_details || null,
        consumables_cover_status: details?.consumables_cover_status || null,
        restoration_benefit_rules: details?.restoration_benefit_rules || null,
      };
    });

    const prompt = `
System Guardrail: You are an explainable healthcare decision assistant for NxtHealth. You are NOT a doctor, symptom checker, or disease predictor. Explain why these policies match, why others might not, and trade-offs. Return ONLY valid JSON matching the schema.

User Profile:
- Age: ${age}
- Kids Count: ${kidsCount}
- Selected Budget Band: ${budgetBand} (Range: ₹${budget.min} - ₹${budget.max === Infinity ? "Infinity" : budget.max})
- Preferred Policy Type: ${policyType || "Any"}
- Max PED Waiting Months: ${maxPedWaitingMonths || "Any"}
- City Tier: ${cityTier || "Any"}
- Requires Maternity Benefits: ${requiresMaternity ? "Yes" : "No"}
- Requires No Room Rent Capping: ${requiresNoRoomRentCap ? "Yes" : "No"}
- Requires OPD Coverage: ${requiresOpd ? "Yes" : "No"}
- Constraint Match Level: ${relaxationTag}

Candidate Policies:
${JSON.stringify(candidatesPrompt, null, 2)}

Evaluate these candidate policies based on the user's specific inputs and preferences. Provide explanations for these top candidate policies. Set 'reference_id' to the policy ID as a string, and 'title' as the plan name. Rank them in order of match quality.
`;

    const geminiResult = await callGeminiJSON(prompt);

    if (geminiResult.status === "error") {
      res.status(500).json(geminiResult);
      return;
    }

    const user = await getAuthUser(req);
    if (!user) {
      console.warn("⚠️ [AUTH WARNING]: API request received without Bearer token. History will NOT be saved.");
    } else {
      const policyName = topMatches[0]?.plan_name || "Policy Match";
      await recordUserHistory(user.id, "Policy Advisor", req.body.userQuery || policyName, "Policy analysis generated");
    }

    res.status(200).json(geminiResult);
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error?.message || "Internal server error" });
  }
});

app.post("/api/term-explainer", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) {
    console.warn("⚠️ [AUTH WARNING]: API request received without Bearer token. History will NOT be saved.");
    res.status(401).json({ status: "error", message: "Unauthorized session for term explainer." });
    return;
  }

  const { context, input } = req.body ?? {};

  if (
    (context !== "term" && context !== "prescription") ||
    typeof input !== "string" ||
    !input.trim()
  ) {
    res.status(400).json({
      status: "error",
      message: "Provide a context of term or prescription and a non-empty input.",
    });
    return;
  }

  const contextInstruction =
    context === "term"
      ? "Explain this healthcare term in plain, everyday language."
      : "Explain this prescription text in plain, everyday language, including what each listed item generally means without recommending a treatment path.";

  const result = await callGeminiJSON(`${contextInstruction}

Input: ${input.trim()}

Return exactly one result item. Set why_not, alternatives, and trade_offs to null.`);

  if (result.status === "error") {
    res.status(500).json(result);
    return;
  }

  const explanation = result.results[0];
  if (
    result.results.length !== 1 ||
    !explanation ||
    explanation.why_not !== null ||
    explanation.alternatives !== null ||
    explanation.trade_offs !== null
  ) {
    res.status(500).json({
      status: "error",
      message: "Gemini returned an invalid Term/Prescription Explainer response.",
    });
    return;
  }

  await recordUserHistory(user.id, "Prescription & Term Explainer", input, "Term explained");

  res.status(200).json(result);
});



app.get("/api/profile", async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      res.status(401).json({ status: "error", message: "Unauthorized user session." });
      return;
    }

    let { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code === "PGRST116") {
      const { data: newProfile, error: insertError } = await supabase
        .from("user_profiles")
        .insert({ id: user.id })
        .select()
        .single();
      
      if (insertError) throw insertError;
      profile = newProfile;
    } else if (error) {
      throw error;
    }

    const completion = calculateCompletion(profile || {});
    res.status(200).json({
      status: "ok",
      profile,
      isComplete: completion === 100,
      completion_percentage: completion
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error?.message || "Internal server error" });
  }
});

app.post("/api/profile", async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      res.status(401).json({ status: "error", message: "Unauthorized user session." });
      return;
    }

    const {
      full_name,
      age,
      gender,
      height_cm,
      weight_kg,
      pre_existing_conditions,
      family_history,
      smoking_status,
      activity_level,
      dietary_preference
    } = req.body ?? {};

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .upsert({
        id: user.id,
        full_name,
        age,
        gender,
        height_cm,
        weight_kg,
        pre_existing_conditions,
        family_history,
        smoking_status,
        activity_level,
        dietary_preference,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    const completion = calculateCompletion(profile || {});
    res.status(200).json({
      status: "ok",
      profile,
      completion_percentage: completion
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error?.message || "Internal server error" });
  }
});

app.post("/api/preventive-health", async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      console.warn("⚠️ [AUTH WARNING]: API request received without Bearer token. History will NOT be saved.");
      res.status(401).json({ status: "error", message: "Unauthorized user session." });
      return;
    }

    const { userQuery } = req.body ?? {};

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      res.status(400).json({ status: "error", message: "Could not retrieve user profile." });
      return;
    }

    const completion = calculateCompletion(profile || {});
    if (completion < 100) {
      res.status(400).json({
        status: "error",
        code: "PROFILE_INCOMPLETE",
        message: "Your health profile must be 100% complete first.",
        completion_percentage: completion
      });
      return;
    }

    const prompt = `
System Guardrail: You are a health information assistant for NxtHealth. You are NOT a doctor, symptom checker, or disease predictor. Provide structured, personalized, non-diagnostic guidance based on the user's profile and query. Encourage confirming important information with a qualified doctor.

User Health Profile:
- Name: ${profile.full_name}
- Age: ${profile.age}
- Gender: ${profile.gender}
- Height: ${profile.height_cm} cm
- Weight: ${profile.weight_kg} kg
- Pre-existing Conditions: ${JSON.stringify(profile.pre_existing_conditions)}
- Family History: ${JSON.stringify(profile.family_history)}
- Smoking Status: ${profile.smoking_status}
- Activity Level: ${profile.activity_level}
- Dietary Preference: ${profile.dietary_preference}

User Query:
${userQuery || "Provide general preventive health guidance."}

Provide a personalized plan. You MUST encode the plan as a single serialized JSON string inside the 'explanation' key of the required response schema. The serialized JSON string inside 'explanation' must match this exact structure:
{
  "lifestyle": [
    { "topic": "Diet", "advice": "Short direct action..." },
    { "topic": "Sleep", "advice": "Short direct action..." },
    { "topic": "Exercise", "advice": "Short direct action..." }
  ],
  "screenings": [
    { "test": "Test Name", "timeline": "Frequency or Age", "reason": "Why recommended..." }
  ],
  "risks": [
    "Short risk factor 1 to monitor",
    "Short risk factor 2 to monitor"
  ]
}

Respond ONLY with valid JSON matching the following schema:
{
  "status": "ok",
  "results": [
    {
      "title": "Personalized Preventive Health Plan",
      "reference_id": null,
      "explanation": "SERIALIZED_JSON_STRING_GOES_HERE",
      "why_not": null,
      "alternatives": null,
      "trade_offs": null,
      "confidence_level": "high",
      "confidence_note": "Based on comprehensive profile matches."
    }
  ]
}
`;

    const geminiResult = await callGeminiJSON(prompt);

    if (geminiResult.status === "error") {
      res.status(500).json(geminiResult);
      return;
    }

    const explanationStr = geminiResult.results[0]?.explanation || "{}";
    let plan = { lifestyle: [], screenings: [], risks: [] };
    try {
      plan = JSON.parse(explanationStr);
    } catch {
      // fallback
    }

    await recordUserHistory(user.id, "Preventive Health Planner", userQuery || "General health check", "Health plan generated");

    res.status(200).json({
      status: "ok",
      plan,
      profileSummary: {
        full_name: profile.full_name,
        age: profile.age,
        gender: profile.gender
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error?.message || "Internal server error" });
  }
});

app.get("/api/medicines", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("medicines")
      .select("*")
      .order("medicine_name", { ascending: true });

    if (error) throw error;

    const user = await getAuthUser(req);
    if (!user) {
      console.warn("⚠️ [AUTH WARNING]: API request received without Bearer token. History will NOT be saved.");
    } else {
      const medicineName = data && data[0] ? data[0].medicine_name : "";
      await recordUserHistory(user.id, "Generic Medicine Alternative", medicineName || "Full list", "Alternatives found");
    }

    res.status(200).json({ status: "ok", medicines: data || [] });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error?.message || "Internal server error" });
  }
});

app.get("/api/medicines/search", async (req, res) => {
  try {
    const queryStr = req.query.q;
    if (typeof queryStr !== "string" || !queryStr.trim()) {
      res.status(400).json({ status: "error", message: "Search query parameter 'q' is required." });
      return;
    }

    const { data, error } = await supabase
      .from("medicines")
      .select("*")
      .or(`medicine_name.ilike.%${queryStr.trim()}%,active_ingredient.ilike.%${queryStr.trim()}%`);

    if (error) throw error;

    const user = await getAuthUser(req);
    if (!user) {
      console.warn("⚠️ [AUTH WARNING]: API request received without Bearer token. History will NOT be saved.");
    } else {
      const medicineName = data && data[0] ? data[0].medicine_name : "";
      await recordUserHistory(user.id, "Generic Medicine Alternative", medicineName || queryStr, "Alternatives found");
    }

    res.status(200).json({ status: "ok", results: data || [] });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error?.message || "Internal server error" });
  }
});

app.get("/api/history", async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      console.warn("⚠️ [AUTH WARNING]: API request received without Bearer token. History will NOT be saved.");
      res.status(401).json({ status: "error", message: "Unauthorized user session." });
      return;
    }

    console.log(`🔍 [/api/history]: Fetching history for User ID: ${user.id}`);
    const { data: history, error } = await supabase
      .from("user_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("❌ [/api/history DB ERROR]:", error);
      throw error;
    }

    console.log("📊 [HISTORY FETCHED]: Found", history?.length || 0, "records for user:", user.id);
    res.status(200).json({ status: "ok", history: history || [] });
  } catch (error: any) {
    console.error("❌ [/api/history EXCEPTION]:", error);
    res.status(500).json({ status: "error", message: error?.message || "Internal server error" });
  }
});

const PORT = process.env.PORT ?? 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
