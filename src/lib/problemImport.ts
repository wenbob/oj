import type { Prisma } from "@prisma/client";
import type { ParsedProblemMarkdown } from "@/lib/markdownParser";

type ProblemDefaults = {
  defaultCategory?: string;
  defaultDifficulty?: string;
};

function cleanText(value?: string) {
  const nextValue = value?.trim();
  return nextValue ? nextValue : undefined;
}

export function applyProblemDefaults(
  problems: ParsedProblemMarkdown[],
  defaults: ProblemDefaults = {},
) {
  return problems.map((problem) => ({
    ...problem,
    difficulty:
      cleanText(problem.difficulty) ?? cleanText(defaults.defaultDifficulty) ?? "",
    category:
      cleanText(problem.category) ?? cleanText(defaults.defaultCategory) ?? "",
  }));
}

export function validateParsedProblems(
  problems: ParsedProblemMarkdown[],
  defaults: ProblemDefaults = {},
) {
  const errors: string[] = [];
  const normalizedProblems = applyProblemDefaults(problems, defaults);

  if (normalizedProblems.length === 0) {
    return ["没有可导入的题目"];
  }

  normalizedProblems.forEach((problem, index) => {
    const title = problem.title?.trim();
    const prefix = `第 ${index + 1} 题${title ? `《${title}》` : ""}`;

    if (!title) errors.push(`${prefix}缺少试题名称`);
    if (!problem.difficulty?.trim()) errors.push(`${prefix}缺少难度`);
    if (!problem.category?.trim()) errors.push(`${prefix}缺少分类`);
    if (!problem.description?.trim()) errors.push(`${prefix}缺少题目描述`);
    if (!problem.inputDescription?.trim()) errors.push(`${prefix}缺少输入格式`);
    if (!problem.outputDescription?.trim()) errors.push(`${prefix}缺少输出格式`);
    if (!problem.dataRange?.trim()) errors.push(`${prefix}缺少数据范围`);

    if (!Array.isArray(problem.samples) || problem.samples.length === 0) {
      errors.push(`${prefix}缺少样例`);
      return;
    }

    if (problem.samples.length < 2) {
      errors.push(
        `${prefix}至少需要两组样例，当前只有 ${problem.samples.length} 组`,
      );
    }

    problem.samples.forEach((sample, sampleIndex) => {
      if (!sample.input?.trim() || !sample.output?.trim()) {
        errors.push(`${prefix}第 ${sampleIndex + 1} 组样例代码块内容为空`);
      }
    });
  });

  return errors;
}

export async function createImportedProblems(
  tx: Prisma.TransactionClient,
  problems: ParsedProblemMarkdown[],
  defaults: ProblemDefaults = {},
) {
  const ids: number[] = [];
  const normalizedProblems = applyProblemDefaults(problems, defaults);

  for (const problem of normalizedProblems) {
    const firstSample = problem.samples[0];
    const created = await tx.problem.create({
      data: {
        title: problem.title,
        description: problem.description,
        inputDescription: problem.inputDescription,
        outputDescription: problem.outputDescription,
        sampleInput: firstSample.input,
        sampleOutput: firstSample.output,
        dataRange: problem.dataRange,
        difficulty: problem.difficulty,
        category: problem.category,
        testCases: {
          create: problem.samples.map((sample) => ({
            input: sample.input,
            output: sample.output,
            isSample: true,
          })),
        },
      },
      select: { id: true },
    });
    ids.push(created.id);
  }

  return ids;
}
