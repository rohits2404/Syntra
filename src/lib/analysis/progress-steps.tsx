export const ANALYSIS_STEPS = [
    { id: "reading", label: "Reading Files", percent: 15 },
    { id: "framework", label: "Detecting Framework", percent: 25 },
    { id: "knowledge", label: "Creating Code Knowledge", percent: 55 },
    { id: "analysis", label: "Running Analysis", percent: 80 },
    { id: "report", label: "Generating Report", percent: 95 },
    { id: "done", label: "Complete", percent: 100 },
] as const;

export type AnalysisStepId = (typeof ANALYSIS_STEPS)[number]["id"];
