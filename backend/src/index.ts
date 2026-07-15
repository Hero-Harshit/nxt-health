import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { callGeminiJSON } from "./lib/geminiClient.js";

dotenv.config();

const app = express();

const allowedOrigins = ["http://localhost:3000", process.env.CORS_ORIGIN].filter(
  (origin): origin is string => Boolean(origin),
);

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

app.post("/api/term-explainer", async (req, res) => {
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

  res.status(200).json(result);
});

const PORT = process.env.PORT ?? 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
