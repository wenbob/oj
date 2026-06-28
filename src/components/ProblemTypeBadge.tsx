import type { ProblemType } from "@/lib/objectiveProblem";

export function ProblemTypeBadge({ type }: { type: ProblemType | string }) {
  const objective = type === "objective";

  return (
    <span
      className={`inline-flex border px-2.5 py-1 text-xs font-black ${
        objective
          ? "border-clay/25 bg-clay/10 text-clay"
          : "border-steel/25 bg-steel/10 text-steel"
      }`}
    >
      {objective ? "选择判断" : "编程题"}
    </span>
  );
}
