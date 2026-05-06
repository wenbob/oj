export const submissionStatuses = [
  "Accepted",
  "Wrong Answer",
  "Compile Error",
  "Runtime Error",
  "Time Limit Exceeded",
] as const;

export type SubmissionStatus = (typeof submissionStatuses)[number];

export function statusClassName(status: string) {
  switch (status) {
    case "Accepted":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Wrong Answer":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Compile Error":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "Runtime Error":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "Time Limit Exceeded":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "published":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "draft":
      return "border-stone-200 bg-stone-50 text-stone-700";
    case "ended":
      return "border-zinc-300 bg-zinc-100 text-zinc-700";
    case "in_progress":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "submitted":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "expired":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "未提交":
      return "border-stone-200 bg-stone-50 text-stone-700";
    default:
      return "border-stone-200 bg-stone-50 text-stone-700";
  }
}
