export type ProblemPayload = {
  title: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
  sampleInput: string;
  sampleOutput: string;
  dataRange?: string;
  difficulty: string;
  category: string;
  testCases: {
    input: string;
    output: string;
    isSample: boolean;
  }[];
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function rawText(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function normalizeProblemPayload(body: unknown): ProblemPayload {
  const data = typeof body === "object" && body ? body as Record<string, unknown> : {};
  const title = text(data.title);
  const description = text(data.description);
  const inputDescription = text(data.inputDescription);
  const outputDescription = text(data.outputDescription);
  const dataRange = text(data.dataRange);
  const difficulty = text(data.difficulty) || "入门";
  const category = text(data.category) || "未分类";

  const incomingCases = Array.isArray(data.testCases) ? data.testCases : [];
  const testCases = incomingCases
    .map((item) => {
      const record = typeof item === "object" && item ? item as Record<string, unknown> : {};
      return {
        input: rawText(record.input),
        output: rawText(record.output),
        isSample: Boolean(record.isSample),
      };
    })
    .filter((item) => item.input.trim() || item.output.trim());

  const sampleCase = testCases.find((item) => item.isSample) ?? testCases[0];
  const sampleInput = rawText(data.sampleInput) || sampleCase?.input || "";
  const sampleOutput = rawText(data.sampleOutput) || sampleCase?.output || "";

  if (!title) throw new Error("标题不能为空");
  if (!description) throw new Error("题目描述不能为空");
  if (!inputDescription) throw new Error("输入格式不能为空");
  if (!outputDescription) throw new Error("输出格式不能为空");
  if (!sampleInput.trim()) throw new Error("样例输入不能为空");
  if (!sampleOutput.trim()) throw new Error("样例输出不能为空");

  if (testCases.length === 0) {
    testCases.push({
      input: sampleInput,
      output: sampleOutput,
      isSample: true,
    });
  }

  for (const testCase of testCases) {
    if (!testCase.input.trim() || !testCase.output.trim()) {
      throw new Error("测试点输入和输出不能为空");
    }
  }

  const sampleCount = testCases.filter((testCase) => testCase.isSample).length;
  if (sampleCount < 2) {
    throw new Error("题目至少需要两组样例");
  }

  return {
    title,
    description,
    inputDescription,
    outputDescription,
    sampleInput,
    sampleOutput,
    dataRange,
    difficulty,
    category,
    testCases,
  };
}
