export type ResearchScene = {
  id: string;
  shortLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  labels: string[];
  mode: "unknown" | "pathways" | "evidence" | "recovery" | "budget" | "collaboration" | "workspace";
};

export const RESEARCH_SCENES: ResearchScene[] = [
  {
    id: "overview",
    shortLabel: "THE UNKNOWN",
    eyebrow: "RESEARCH SYSTEM / 001",
    title: "RESEARCH\nDOESN’T END\nAT THE FIRST RUN.",
    description: "Every experiment leaves behind a question. Every failure leaves behind evidence.",
    labels: ["EVORESEARCH", "AN EVOLVING AI RESEARCH ENVIRONMENT"],
    mode: "unknown",
  },
  {
    id: "methodology",
    shortLabel: "QUESTIONS → EXPERIMENTS",
    eyebrow: "FROM QUESTION TO EXECUTION",
    title: "TURN IDEAS\nINTO EXPERIMENTS.",
    description: "Translate research questions and scientific papers into structured, executable ML experiments.",
    labels: ["PAPER INGESTION", "EXPERIMENT PLANNING", "MODEL SELECTION"],
    mode: "pathways",
  },
  {
    id: "evidence",
    shortLabel: "EVERY RUN LEAVES EVIDENCE",
    eyebrow: "TRACEABLE BY DESIGN",
    title: "NOT JUST RESULTS.\nREPRODUCIBLE\nEVIDENCE.",
    description: "Track configurations, datasets, metrics, code versions, execution logs, and the history behind every result.",
    labels: ["EXPERIMENT HISTORY", "METRIC TRACKING", "DATASET PROVENANCE", "REPRODUCIBLE RUNS"],
    mode: "evidence",
  },
  {
    id: "recovery",
    shortLabel: "FAILURES BECOME KNOWLEDGE",
    eyebrow: "VERIFIED REPAIR PATH",
    title: "FAILURE IS DATA.\nRECOVERY IS\nKNOWLEDGE.",
    description: "Retrieve verified fixes, diagnose recurring errors, and use previous experiment outcomes to guide the next attempt.",
    labels: ["ERROR DETECTED", "DIAGNOSIS", "VERIFIED REPAIR", "VALIDATED RESULT", "MEMORY STORED"],
    mode: "recovery",
  },
  {
    id: "experiments",
    shortLabel: "INTELLIGENCE UNDER CONSTRAINTS",
    eyebrow: "RESOURCE-AWARE SELECTION",
    title: "BETTER DECISIONS.\nWITHIN THE\nBUDGET.",
    description: "Choose experiments deliberately. Balance performance, execution time, and available CPU resources.",
    labels: ["CPU-TIME BUDGET", "CANDIDATE SELECTION", "TRIAL COMPARISON", "RESOURCE-AWARE EXECUTION"],
    mode: "budget",
  },
  {
    id: "collaboration",
    shortLabel: "RESEARCH EVOLVES TOGETHER",
    eyebrow: "SHARED RESEARCH MEMORY",
    title: "KNOWLEDGE\nMOVES FORWARD.",
    description: "Researchers collaborate through shared experiments, transparent decisions, and evidence that others can inspect.",
    labels: ["SHARED WORKSPACES", "COLLABORATIVE EXPERIMENTS", "AUDITABLE DECISIONS", "TRACEABLE KNOWLEDGE"],
    mode: "collaboration",
  },
  {
    id: "workspace",
    shortLabel: "ENTER THE WORKSPACE",
    eyebrow: "THE NEXT RUN STARTS HERE",
    title: "BUILD ON\nWHAT YOU LEARN.",
    description: "Start an experiment. Inspect its evidence. Make the next decision with better information.",
    labels: ["OPEN RESEARCH WORKSPACE", "EXPLORE THE METHODOLOGY"],
    mode: "workspace",
  },
];
