"use client";

import { FormEvent, useMemo, useState } from "react";

type Context = "term" | "prescription";
type ModuleKey =
  | "welcome"
  | "insurance"
  | "planner"
  | "alternatives"
  | "terms"
  | "recovery"
  | "profile"
  | "settings";

type ExplanationResult = {
  title: string;
  reference_id: string | null;
  explanation: string;
  why_not: string | null;
  alternatives: string | null;
  trade_offs: string | null;
  confidence_level: "high" | "medium" | "low" | null;
  confidence_note: string | null;
};

type ProfileState = {
  age: string;
  budgetBand: string;
  city: string;
  gender: string;
  familyHistory: string[];
  existingConditions: string[];
  planPreference: string;
};

const emptyProfile: ProfileState = {
  age: "",
  budgetBand: "",
  city: "",
  gender: "",
  familyHistory: [],
  existingConditions: [],
  planPreference: "",
};

const modules: Array<{ key: ModuleKey; label: string; caption: string; accent?: boolean }> = [
  { key: "insurance", label: "Insurance Advisor", caption: "Coverage choices and plan context", accent: true },
  { key: "planner", label: "Preventive Health Planner", caption: "Routine care and preventive priorities" },
  { key: "alternatives", label: "Generic Medicine Alternatives", caption: "Plain-language comparison notes" },
  { key: "terms", label: "Term / Prescription Explainer", caption: "Everyday explanations without diagnosis" },
];

const checklistOptions = [
  "High blood pressure",
  "High cholesterol",
  "Diabetes",
  "Asthma",
  "Arthritis",
  "Migraines",
  "Sleep apnea",
  "Anxiety",
  "Depression",
  "Kidney disease",
  "Thyroid disorder",
  "Autoimmune condition",
  "Hearing loss",
  "Vision concerns",
  "None of the above",
];

const familyHistoryItems = [
  "Heart disease",
  "Stroke",
  "Diabetes",
  "Cancer",
  "High blood pressure",
  "High cholesterol",
  "Autoimmune condition",
  "Kidney disease",
  "Mental health condition",
  "Sleep disorder",
  "None of the above",
];

function Badge({ tone, children }: { tone: "teal" | "amber" | "gray"; children: string }) {
  const classes = {
    teal: "bg-[#dceee6] text-[#1f5b5b]",
    amber: "bg-[#f3dcb0] text-[#6e4a0b]",
    gray: "bg-[#e5e9e7] text-[#3a4b47]",
  }[tone];

  return <span className={`rounded-full px-3 py-1 text-sm font-medium ${classes}`}>{children}</span>;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-6 shadow-[0_12px_40px_rgba(36,50,47,0.06)]">
      <h3 className="mb-3 text-xl text-[var(--color-text)]">{title}</h3>
      {children}
    </section>
  );
}

function ChecklistField({
  title,
  description,
  options,
  selected,
  onChange,
}: {
  title: string;
  description: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
}) {
  const noneLabel = "None of the above";
  const isNoneSelected = selected.includes(noneLabel);

  function toggleOption(option: string) {
    if (option === noneLabel) {
      onChange(isNoneSelected ? [] : [noneLabel]);
      return;
    }

    if (isNoneSelected) {
      onChange([option]);
      return;
    }

    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];

    onChange(next.filter((item) => item !== noneLabel));
  }

  return (
    <div className="rounded-[20px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
      <div className="mb-4">
        <p className="font-semibold text-[var(--color-text)]">{title}</p>
        <p className="text-sm text-[var(--color-tertiary)]">{description}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => {
          const checked = selected.includes(option);
          const disabled =
            (option !== noneLabel && isNoneSelected) ||
            (option === noneLabel && selected.some((item) => item !== noneLabel));

          const baseClass = disabled
            ? "border-[#c7c0b3] bg-[#efebe2] text-[#8d877d]"
            : checked
              ? "border-[#1f5b5b] bg-[#dceee6] text-[#1f5b5b]"
              : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]";

          return (
            <label
              key={option}
              className={`flex cursor-pointer items-start gap-3 rounded-[16px] border px-3 py-3 ${baseClass}`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggleOption(option)}
                className="mt-1 h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
              />
              <span className="text-sm leading-6">{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("welcome");
  const [context, setContext] = useState<Context>("term");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileState>(emptyProfile);

  const hasProfile = useMemo(
    () => Object.values(profile).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== "";
    }),
    [profile],
  );

  const completeness = useMemo(() => {
    const filledFields = [
      profile.age,
      profile.budgetBand,
      profile.city,
      profile.gender,
      profile.planPreference,
      profile.familyHistory.length > 0,
      profile.existingConditions.length > 0,
    ].filter(Boolean).length;
    const total = 7;
    return {
      percent: Math.round((filledFields / total) * 100),
      remaining: total - filledFields,
    };
  }, [profile]);

  const recoveryItems = [
    { label: "Next dose", value: "8:30 AM — inhaler" },
    { label: "Upcoming review", value: "July 24 — blood pressure check" },
    { label: "Care note", value: "Keep hydration steady and log symptoms" },
  ];

  function updateProfile(field: keyof ProfileState, value: string | string[]) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setError(null);

    const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

    setIsLoading(true);

    try {
      const response = await fetch(`${backendBaseUrl}/api/term-explainer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, input }),
      });
      const data: unknown = await response.json();

      if (
        response.ok &&
        typeof data === "object" &&
        data !== null &&
        "status" in data &&
        (data.status === "ok" || data.status === "no_match") &&
        "results" in data &&
        Array.isArray(data.results) &&
        data.results.length === 1
      ) {
        setResult(data.results[0] as ExplanationResult);
        return;
      }

      if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
        setError(data.message);
      } else {
        setError("We could not explain that right now. Please try again.");
      }
    } catch {
      setError("We could not reach the backend. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)] text-[var(--color-text)]">
      <aside className="fixed left-0 top-0 flex h-screen w-80 flex-col border-r border-[var(--color-border)] bg-[var(--color-cream)]/95 p-6 backdrop-blur">
        <div className="mb-6">
          <p className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
            NxtHealth
          </p>
          <div className="mt-3 rounded-[18px] bg-[var(--color-primary)] px-4 py-3 text-sm text-white">
            <p className="font-semibold">Insurance Advisor</p>
            <p className="mt-1 text-[13px] text-[#dceee6]">Start here</p>
          </div>
        </div>

        <div className="mb-4 border-t border-[var(--color-border)] pt-4" />

        <nav className="flex-1 space-y-2">
          {modules.map((module) => (
            <button
              key={module.key}
              type="button"
              onClick={() => setActiveModule(module.key)}
              className={`w-full rounded-[18px] border px-4 py-3 text-left transition ${
                activeModule === module.key
                  ? "border-[var(--color-primary)] bg-[#dceee6] text-[var(--color-primary)]"
                  : "border-transparent bg-transparent text-[var(--color-text)] hover:border-[var(--color-border)] hover:bg-[#f8efe1]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{module.label}</span>
                {module.accent ? <Badge tone="teal">Priority</Badge> : null}
              </div>
              <p className="mt-1 text-sm text-[var(--color-tertiary)]">{module.caption}</p>
            </button>
          ))}
        </nav>

        <div className="mt-6 space-y-3 border-t border-[var(--color-border)] pt-4">
          <button
            type="button"
            onClick={() => setActiveModule("recovery")}
            className="w-full rounded-[18px] border border-[var(--color-border)] px-4 py-3 text-left text-[var(--color-text)]"
          >
            Recovery Guidance
          </button>
          <button
            type="button"
            onClick={() => setActiveModule("settings")}
            className="w-full rounded-[18px] border border-[var(--color-border)] px-4 py-3 text-left text-[var(--color-text)]"
          >
            Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveModule("profile")}
            className="w-full rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left text-[var(--color-text)]"
          >
            Profile
          </button>
        </div>
      </aside>

      <div className="ml-80 flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-cream)]/95 px-8 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-tertiary)]">Warm Harbor</p>
              <h1 className="text-2xl text-[var(--color-text)]">
                {activeModule === "welcome" && !hasProfile
                  ? "Welcome"
                  : activeModule === "insurance"
                    ? "Insurance Advisor"
                    : activeModule === "planner"
                      ? "Preventive Health Planner"
                      : activeModule === "alternatives"
                        ? "Generic Medicine Alternatives"
                        : activeModule === "terms"
                          ? "Term / Prescription Explainer"
                          : activeModule === "recovery"
                            ? "Recovery Guidance"
                            : activeModule === "settings"
                              ? "Settings"
                              : "Profile"}
              </h1>
            </div>
            <div className="rounded-full border border-[var(--color-border)] bg-[#f8efe1] px-4 py-2 text-sm text-[var(--color-tertiary)]">
              Non-diagnostic guidance only
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-10">
          {activeModule === "welcome" && !hasProfile ? (
            <div className="mx-auto max-w-6xl space-y-6">
              <section className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-8 shadow-[0_16px_48px_rgba(36,50,47,0.08)]">
                <div className="max-w-3xl">
                  <Badge tone="teal">Your trusted guide for your next healthcare decision.</Badge>
                  <h2 className="mt-4 text-4xl leading-tight text-[var(--color-text)]">
                    A calm, explainable place to compare healthcare questions without crossing into diagnosis.
                  </h2>
                  <p className="mt-4 text-lg leading-8 text-[var(--color-tertiary)]">
                    NxtHealth helps you review insurance, preventive planning, medication alternatives, and recovery guidance in plain language. It does not diagnose, predict, or prescribe care.
                  </p>
                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveModule("profile")}
                      className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(31,91,91,0.2)]"
                    >
                      Build your profile
                    </button>
                  </div>
                </div>
              </section>

              <div className="grid gap-4 lg:grid-cols-3">
                {[
                  { title: "Insurance Advisor", body: "Review plan language and coverage trade-offs with clear context." },
                  { title: "Preventive Health Planner", body: "Keep preventive priorities organized around your profile." },
                  { title: "Term / Prescription Explainer", body: "Translate unfamiliar terms and medication notes into everyday language." },
                ].map((item) => (
                  <div key={item.title} className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-5">
                    <h3 className="text-lg text-[var(--color-text)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--color-tertiary)]">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : hasProfile ? (
            <div className="mx-auto max-w-6xl space-y-6">
              <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
                <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-6 shadow-[0_16px_48px_rgba(36,50,47,0.08)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-tertiary)]">Profile snapshot</p>
                      <h2 className="mt-2 text-3xl text-[var(--color-text)]">{completeness.percent}% filled, {completeness.remaining} fields left</h2>
                    </div>
                    <Badge tone="teal">Updated</Badge>
                  </div>
                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[18px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                      <p className="text-sm text-[var(--color-tertiary)]">Primary city</p>
                      <p className="mt-2 font-semibold">{profile.city || "Add your city"}</p>
                    </div>
                    <div className="rounded-[18px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                      <p className="text-sm text-[var(--color-tertiary)]">Budget band</p>
                      <p className="mt-2 font-semibold">{profile.budgetBand || "Add a budget range"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-6 shadow-[0_16px_48px_rgba(36,50,47,0.08)]">
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-tertiary)]">Recovery snapshot</p>
                  <div className="mt-4 space-y-3">
                    {recoveryItems.map((item) => (
                      <div key={item.label} className="rounded-[18px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                        <p className="text-sm text-[var(--color-tertiary)]">{item.label}</p>
                        <p className="mt-1 font-semibold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <SectionCard title="Recently available guidance">
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      { title: "Coverage context", body: "Your profile can steer plan trade-off language without acting as a doctor." },
                      { title: "Preventive focus", body: "Keep real-world priorities visible in one place." },
                    ].map((item) => (
                      <div key={item.title} className="rounded-[20px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                        <h4 className="font-semibold text-[var(--color-text)]">{item.title}</h4>
                        <p className="mt-2 text-sm leading-7 text-[var(--color-tertiary)]">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Guidance posture">
                  <div className="space-y-3">
                    <div className="rounded-[18px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                      <p className="text-sm text-[var(--color-tertiary)]">This platform is designed for</p>
                      <p className="mt-2 font-semibold">Explaining options and trade-offs</p>
                    </div>
                    <div className="rounded-[18px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                      <p className="text-sm text-[var(--color-tertiary)]">This platform is not</p>
                      <p className="mt-2 font-semibold">A diagnostic engine or treatment recommender</p>
                    </div>
                  </div>
                </SectionCard>
              </div>
            </div>
          ) : null}

          {activeModule === "insurance" ? (
            <div className="mx-auto max-w-5xl space-y-6">
              <SectionCard title="Coverage overview">
                <div className="grid gap-4 xl:grid-cols-[1fr_0.75fr]">
                  <div className="rounded-[20px] border border-[var(--color-border)] bg-[#fdf9f1] p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-tertiary)]">What this module does</p>
                    <p className="mt-3 text-lg leading-8 text-[var(--color-text)]">
                      It helps you compare insurance terminology, plan features, and common trade-offs in plain language.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-[20px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                      <Badge tone="teal">High confidence</Badge>
                      <p className="mt-3 text-sm leading-7 text-[var(--color-tertiary)]">Information is framed as explanation and contextual guidance.</p>
                    </div>
                    <div className="rounded-[20px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                      <Badge tone="amber">Needs review</Badge>
                      <p className="mt-3 text-sm leading-7 text-[var(--color-tertiary)]">Always double-check plan wording with your carrier or benefits team.</p>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>
          ) : null}

          {activeModule === "planner" ? (
            <div className="mx-auto max-w-5xl space-y-6">
              <SectionCard title="Preventive planning snapshot">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { title: "Routine check-in", body: "Review preventive dates and upcoming care reminders so your plan stays organized." },
                    { title: "Budget view", body: "Consider cost sensitivity and access needs alongside general planning details." },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[20px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                      <h4 className="font-semibold text-[var(--color-text)]">{item.title}</h4>
                      <p className="mt-2 text-sm leading-7 text-[var(--color-tertiary)]">{item.body}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          ) : null}

          {activeModule === "alternatives" ? (
            <div className="mx-auto max-w-5xl space-y-6">
              <SectionCard title="Medication alternatives">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { title: "Generic option A", body: "Often lower cost and familiar to many plans." },
                    { title: "Generic option B", body: "May differ in dosing format or coverage terms." },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[20px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                      <div className="flex items-center gap-2">
                        <Badge tone="gray">Neutral</Badge>
                        <Badge tone="amber">Needs review</Badge>
                      </div>
                      <h4 className="mt-3 font-semibold text-[var(--color-text)]">{item.title}</h4>
                      <p className="mt-2 text-sm leading-7 text-[var(--color-tertiary)]">{item.body}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          ) : null}

          {activeModule === "terms" ? (
            <div className="mx-auto max-w-5xl space-y-6">
              <SectionCard title="Explain a term or prescription note">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="block text-sm font-medium text-[var(--color-text)]">
                    Context
                    <select
                      value={context}
                      onChange={(event) => setContext(event.target.value as Context)}
                      className="mt-2 w-full rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)]"
                    >
                      <option value="term">Term</option>
                      <option value="prescription">Prescription</option>
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-[var(--color-text)]">
                    {context === "term" ? "Healthcare term" : "Prescription text"}
                    <textarea
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      required
                      rows={5}
                      className="mt-2 w-full rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)]"
                      placeholder={context === "term" ? "Enter a healthcare term to explain" : "Paste a prescription or medication note"}
                    />
                  </label>

                  <button type="submit" disabled={isLoading} className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white">
                    {isLoading ? "Preparing explanation…" : "Explain"}
                  </button>
                </form>
              </SectionCard>

              {isLoading ? <p className="text-sm text-[var(--color-tertiary)]">Loading…</p> : null}
              {error ? <p role="alert" className="rounded-[18px] border border-[var(--color-border)] bg-[#fdf9f1] p-4 text-sm text-[var(--color-tertiary)]">{error}</p> : null}
              {result ? (
                <SectionCard title={result.title}>
                  <div className="space-y-4">
                    <div className="rounded-[18px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                      <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-tertiary)]">Explanation</p>
                      <p className="mt-3 leading-8 text-[var(--color-text)]">{result.explanation}</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {result.why_not ? (
                        <div className="rounded-[18px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                          <p className="font-semibold text-[var(--color-text)]">Why not this one?</p>
                          <p className="mt-2 text-sm leading-7 text-[var(--color-tertiary)]">{result.why_not}</p>
                        </div>
                      ) : null}
                      {result.alternatives ? (
                        <div className="rounded-[18px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                          <p className="font-semibold text-[var(--color-text)]">Alternatives</p>
                          <p className="mt-2 text-sm leading-7 text-[var(--color-tertiary)]">{result.alternatives}</p>
                        </div>
                      ) : null}
                      {result.trade_offs ? (
                        <div className="rounded-[18px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                          <p className="font-semibold text-[var(--color-text)]">Trade-offs</p>
                          <p className="mt-2 text-sm leading-7 text-[var(--color-tertiary)]">{result.trade_offs}</p>
                        </div>
                      ) : null}
                    </div>
                    {result.confidence_note ? (
                      <div className="rounded-[18px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                        <p className="text-sm text-[var(--color-tertiary)]">Confidence note</p>
                        <p className="mt-2 text-sm leading-7 text-[var(--color-text)]">{result.confidence_note}</p>
                      </div>
                    ) : null}
                  </div>
                </SectionCard>
              ) : null}
            </div>
          ) : null}

          {activeModule === "recovery" ? (
            <div className="mx-auto max-w-5xl space-y-6">
              <SectionCard title="Recovery guidance">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[20px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                    <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-tertiary)]">What to monitor</p>
                    <p className="mt-3 text-sm leading-8 text-[var(--color-text)]">Track symptoms, appointments, and follow-up reminders in one view.</p>
                  </div>
                  <div className="rounded-[20px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                    <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-tertiary)]">Grounding note</p>
                    <p className="mt-3 text-sm leading-8 text-[var(--color-text)]">Recovery guidance is supportive context, not a diagnosis or treatment plan.</p>
                  </div>
                </div>
              </SectionCard>
            </div>
          ) : null}

          {activeModule === "profile" ? (
            <div className="mx-auto max-w-5xl space-y-6">
              <SectionCard title="Build your profile">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-medium text-[var(--color-text)]">
                    Age range
                    <select
                      value={profile.age}
                      onChange={(event) => updateProfile("age", event.target.value)}
                      className="mt-2 w-full rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)]"
                    >
                      <option value="">Select</option>
                      <option value="18-29">18-29</option>
                      <option value="30-44">30-44</option>
                      <option value="45-64">45-64</option>
                      <option value="65+">65+</option>
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-[var(--color-text)]">
                    Budget band
                    <select
                      value={profile.budgetBand}
                      onChange={(event) => updateProfile("budgetBand", event.target.value)}
                      className="mt-2 w-full rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)]"
                    >
                      <option value="">Select</option>
                      <option value="Under $100">Under $100</option>
                      <option value="$100-$250">$100-$250</option>
                      <option value="$250-$500">$250-$500</option>
                      <option value="Over $500">Over $500</option>
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-[var(--color-text)]">
                    City
                    <select
                      value={profile.city}
                      onChange={(event) => updateProfile("city", event.target.value)}
                      className="mt-2 w-full rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)]"
                    >
                      <option value="">Select</option>
                      <option value="Boston">Boston</option>
                      <option value="Chicago">Chicago</option>
                      <option value="Denver">Denver</option>
                      <option value="Seattle">Seattle</option>
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-[var(--color-text)]">
                    Gender
                    <select
                      value={profile.gender}
                      onChange={(event) => updateProfile("gender", event.target.value)}
                      className="mt-2 w-full rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)]"
                    >
                      <option value="">Select</option>
                      <option value="Woman">Woman</option>
                      <option value="Man">Man</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </label>
                </div>

                <label className="mt-2 block text-sm font-medium text-[var(--color-text)]">
                  Preferred guidance style
                  <select
                    value={profile.planPreference}
                    onChange={(event) => updateProfile("planPreference", event.target.value)}
                    className="mt-2 w-full rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)]"
                  >
                    <option value="">Select</option>
                    <option value="Balanced details">Balanced details</option>
                    <option value="Simplified overview">Simplified overview</option>
                    <option value="Cost-focused">Cost-focused</option>
                  </select>
                </label>

                <div className="mt-6 space-y-4">
                  <ChecklistField
                    title="Family history"
                    description="Choose the health contexts you want to keep in view."
                    options={familyHistoryItems}
                    selected={profile.familyHistory}
                    onChange={(value) => updateProfile("familyHistory", value)}
                  />
                  <ChecklistField
                    title="Existing conditions"
                    description="Choose the conditions that matter for your current planning context."
                    options={checklistOptions}
                    selected={profile.existingConditions}
                    onChange={(value) => updateProfile("existingConditions", value)}
                  />
                </div>

                <div className="mt-6 flex justify-end">
                  <button type="button" className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white">
                    Save profile
                  </button>
                </div>
              </SectionCard>
            </div>
          ) : null}

          {activeModule === "settings" ? (
            <div className="mx-auto max-w-5xl space-y-6">
              <SectionCard title="Settings">
                <div className="space-y-3">
                  <div className="rounded-[20px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                    <p className="font-semibold text-[var(--color-text)]">Display preferences</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--color-tertiary)]">A calm, cream-toned layout is the current default for every module.</p>
                  </div>
                  <div className="rounded-[20px] border border-[var(--color-border)] bg-[#fdf9f1] p-4">
                    <p className="font-semibold text-[var(--color-text)]">Open gap</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--color-tertiary)]">The error and danger state has not been designed yet, so it stays intentionally unstyled for now.</p>
                  </div>
                </div>
              </SectionCard>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
