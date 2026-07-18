export type AtsCheck = { id: string; label: string; status: "pass" | "warn" | "fail"; detail: string };
export type AtsReport = { score: number; checks: AtsCheck[]; atsText: string; passed: boolean };
export function buildAtsText(data: unknown, sectionOrder: string[], skillsMode?: string): string;
export function validateAtsResume(data: unknown, sectionOrder: string[], skillsMode?: string, pageCount?: number): AtsReport;
