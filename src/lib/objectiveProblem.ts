import type { JudgeCaseResult, JudgeResult } from "./judge";

export const problemTypes = ["programming", "objective"] as const;
export type ProblemType = (typeof problemTypes)[number];

export type ObjectiveOption = {
  label: string;
  text: string;
};

export type ObjectiveItem = {
  kind: "choice" | "judge";
  stem: string;
  options: ObjectiveOption[];
  answer: string;
  score: number;
};

const allowedOptionLabels = new Set(["A", "B", "C", "D"]);

export type PublicObjectiveItem = Omit<ObjectiveItem, "answer">;

export function isProblemType(value: unknown): value is ProblemType {
  return typeof value === "string" && problemTypes.includes(value as ProblemType);
}

export function normalizeProblemType(value: unknown): ProblemType {
  return isProblemType(value) ? value : "programming";
}

export function parseObjectiveItems(value?: string | null): ObjectiveItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? normalizeObjectiveItems(parsed) : [];
  } catch {
    return [];
  }
}

export function stringifyObjectiveItems(items: ObjectiveItem[]) {
  return JSON.stringify(normalizeObjectiveItems(items));
}

export function normalizeObjectiveItems(items: unknown[]): ObjectiveItem[] {
  return items.map((item) => {
    const record =
      typeof item === "object" && item ? (item as Record<string, unknown>) : {};
    const kind = record.kind === "judge" ? "judge" : "choice";
    const options = Array.isArray(record.options)
      ? record.options.map((option, index) => {
          const optionRecord =
            typeof option === "object" && option
              ? (option as Record<string, unknown>)
              : {};
          return {
            label:
              typeof optionRecord.label === "string" && optionRecord.label.trim()
                ? optionRecord.label.trim().toUpperCase()
                : String.fromCharCode(65 + index),
            text: typeof optionRecord.text === "string" ? optionRecord.text : "",
          };
        })
      : [];

    return {
      kind,
      stem: typeof record.stem === "string" ? record.stem : "",
      options,
      answer: typeof record.answer === "string" ? record.answer.trim().toUpperCase() : "",
      score: Number.isFinite(Number(record.score)) ? Number(record.score) : 0,
    };
  });
}

export function validateObjectiveItems(items: ObjectiveItem[]) {
  const errors: string[] = [];
  if (items.length === 0) {
    return ["至少需要添加 1 道选择判断小题"];
  }

  items.forEach((item, index) => {
    const prefix = `第 ${index + 1} 小题`;
    if (!item.stem.trim()) errors.push(`${prefix}题干不能为空`);
    if (!Number.isInteger(item.score) || item.score <= 0) {
      errors.push(`${prefix}分值必须是正整数`);
    }

    const options = item.options.filter((option) => option.text.trim());
    if (item.kind === "judge" && options.length !== 2) {
      errors.push(`${prefix}判断题必须有 A/B 两个选项`);
    }
    if (item.kind === "choice" && options.length < 2) {
      errors.push(`${prefix}至少需要 2 个选项`);
    }

    if (options.length > 4) {
      errors.push(`${prefix}最多只能有 4 个选项`);
    }

    const labels = new Set<string>();
    for (const option of options) {
      const label = option.label.toUpperCase();
      if (!allowedOptionLabels.has(label)) {
        errors.push(`${prefix}选项字母必须是 A-D`);
      }
      if (labels.has(label)) {
        errors.push(`${prefix}选项字母不能重复`);
      }
      labels.add(label);
    }

    if (
      item.kind === "judge" &&
      (labels.size !== 2 || !labels.has("A") || !labels.has("B"))
    ) {
      errors.push(`${prefix}判断题必须使用 A/B 两个选项`);
    }

    const answer = normalizeObjectiveAnswer(item.answer);
    if (!answer) {
      errors.push(`${prefix}答案不能为空`);
    } else if (!labels.has(answer)) {
      errors.push(`${prefix}答案必须是已有选项字母`);
    }
  });

  return errors;
}

export function normalizeObjectiveAnswer(value: string) {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, "");
  const matched = normalized.match(/^(?:\d+[:：.、])?([A-Z])$/);
  return matched?.[1] ?? normalized;
}

export function getObjectiveTotalScore(items: ObjectiveItem[]) {
  return items.reduce((sum, item) => sum + item.score, 0);
}

export function getPublicObjectiveItems(
  items: ObjectiveItem[],
): PublicObjectiveItem[] {
  return items.map((item) => ({
    kind: item.kind,
    stem: item.stem,
    options: item.options,
    score: item.score,
  }));
}

export function getObjectiveSubmissionScore({
  caseResults,
  items,
}: {
  caseResults: { caseIndex: number; status: string }[];
  items: ObjectiveItem[];
}) {
  const acceptedCaseIndexes = new Set(
    caseResults
      .filter((caseResult) => caseResult.status === "Accepted")
      .map((caseResult) => caseResult.caseIndex),
  );

  return items.reduce(
    (score, item, index) =>
      score + (acceptedCaseIndexes.has(index + 1) ? item.score : 0),
    0,
  );
}

export function judgeObjectiveSubmission({
  answerText,
  items,
}: {
  answerText: string;
  items: ObjectiveItem[];
}): JudgeResult {
  const lines = answerText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  while (lines.length > 0 && !lines[lines.length - 1].trim()) {
    lines.pop();
  }

  const caseResults: JudgeCaseResult[] = items.map((item, index) => {
    const actualRaw = lines[index] ?? "";
    const actualOutput = normalizeObjectiveAnswer(actualRaw);
    const expectedOutput = normalizeObjectiveAnswer(item.answer);
    const accepted = actualOutput === expectedOutput;

    return {
      caseIndex: index + 1,
      status: accepted ? "Accepted" : "Wrong Answer",
      input: formatObjectiveCaseInput(item, index),
      expectedOutput,
      actualOutput: actualRaw.trim(),
      runtimeMs: 0,
      errorMessage: accepted ? undefined : "答案不一致",
    };
  });

  const passedCount = caseResults.filter((item) => item.status === "Accepted").length;
  const totalCount = items.length;

  return {
    status: passedCount === totalCount ? "Accepted" : "Wrong Answer",
    passedCount,
    totalCount,
    runtimeMs: 0,
    errorMessage:
      passedCount === totalCount ? undefined : "选择判断题答案与标准答案不一致",
    caseResults,
  };
}

function formatObjectiveCaseInput(item: ObjectiveItem, index: number) {
  const optionText = item.options
    .map((option) => `${option.label}. ${option.text}`)
    .join("\n");
  return `第 ${index + 1} 小题\n${item.stem}\n${optionText}`;
}
