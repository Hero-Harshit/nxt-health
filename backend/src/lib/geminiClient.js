const HEALTH_GUARDRAIL =
  "You are a health information assistant for NxtHealth. You are not a doctor, and you must never diagnose, predict outcomes, or suggest a specific treatment path. You only explain, compare, and clarify information that has been given to you. Always end with a note encouraging the user to confirm anything important with a qualified doctor or pharmacist. Respond ONLY with valid JSON matching the schema below — no markdown, no extra prose outside the JSON structure.";

const RESPONSE_SCHEMA_INSTRUCTION = `Return exactly this object shape:
{
  "status": "ok" | "no_match" | "error",
  "results": [
    {
      "title": string,
      "reference_id": string | null,
      "explanation": string,
      "why_not": string | null,
      "alternatives": string | null,
      "trade_offs": string | null,
      "confidence_level": "high" | "medium" | "low" | null,
      "confidence_note": string | null
    }
  ]
}
The results key must always be an array. Every result object must include every listed key, using null for unused values.`;

const DEFAULT_MODEL = "gemini-3.1-flash-lite";
const REQUEST_TIMEOUT_MS = 30_000;

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function isNullableString(value) {
  return value === null || typeof value === "string";
}

function isValidResult(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return false;
  }

  const requiredKeys = [
    "title",
    "reference_id",
    "explanation",
    "why_not",
    "alternatives",
    "trade_offs",
    "confidence_level",
    "confidence_note",
  ];

  if (!requiredKeys.every((key) => hasOwn(result, key))) {
    return false;
  }

  return (
    typeof result.title === "string" &&
    isNullableString(result.reference_id) &&
    typeof result.explanation === "string" &&
    isNullableString(result.why_not) &&
    isNullableString(result.alternatives) &&
    isNullableString(result.trade_offs) &&
    (result.confidence_level === null ||
      ["high", "medium", "low"].includes(result.confidence_level)) &&
    isNullableString(result.confidence_note)
  );
}

function isValidGeminiResponse(response) {
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    return false;
  }

  return (
    hasOwn(response, "status") &&
    hasOwn(response, "results") &&
    ["ok", "no_match", "error"].includes(response.status) &&
    Array.isArray(response.results) &&
    response.results.every(isValidResult)
  );
}

function stripCodeFences(text) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function extractResponseText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return null;
  }

  const text = parts
    .map((part) => part?.text)
    .filter((part) => typeof part === "string")
    .join("");

  return text || null;
}

async function callGeminiJSON(userPrompt) {
  if (typeof userPrompt !== "string" || !userPrompt.trim()) {
    return { status: "error", message: "A non-empty prompt is required." };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { status: "error", message: "Gemini API key is not configured." };
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `${HEALTH_GUARDRAIL}\n\n${RESPONSE_SCHEMA_INSTRUCTION}`,
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      return {
        status: "error",
        message: `Gemini API request failed with status ${response.status}.`,
      };
    }

    const payload = await response.json();
    const responseText = extractResponseText(payload);

    if (!responseText) {
      return { status: "error", message: "Gemini returned no response text." };
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(stripCodeFences(responseText));
    } catch {
      return { status: "error", message: "Gemini returned invalid JSON." };
    }

    if (!isValidGeminiResponse(parsedResponse)) {
      return {
        status: "error",
        message: "Gemini response does not match the required schema.",
      };
    }

    return parsedResponse;
  } catch (error) {
    if (error?.name === "AbortError") {
      return { status: "error", message: "Gemini API request timed out." };
    }

    return { status: "error", message: "Gemini API request failed." };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { callGeminiJSON };
