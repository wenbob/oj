"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { copyToClipboard } from "@/lib/copyToClipboard";

type ProblemSample = {
  input: string;
  output: string;
};

type CopyProblemButtonProps = {
  title: string;
  difficulty?: string | null;
  category?: string | null;
  description: string;
  inputDescription: string;
  outputDescription: string;
  samples: ProblemSample[];
  dataRange?: string | null;
};

export function CopyProblemButton({
  title,
  difficulty,
  category,
  description,
  inputDescription,
  outputDescription,
  samples,
  dataRange,
}: CopyProblemButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copyProblem() {
    try {
      await copyToClipboard(
        formatProblemMarkdown({
          title,
          difficulty,
          category,
          description,
          inputDescription,
          outputDescription,
          samples,
          dataRange,
        }),
      );
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1600);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 2400);
    }
  }

  const label =
    status === "copied" ? "已复制" : status === "error" ? "复制失败" : "复制本题";

  return (
    <button
      className="btn btn-secondary ml-auto px-3 py-2 text-sm whitespace-nowrap"
      onClick={copyProblem}
      type="button"
    >
      <Copy size={15} />
      {label}
    </button>
  );
}

function formatProblemMarkdown({
  title,
  difficulty,
  category,
  description,
  inputDescription,
  outputDescription,
  samples,
  dataRange,
}: CopyProblemButtonProps) {
  const sampleBlocks = samples
    .map(
      (sample, index) => `### 输入样例 ${index + 1}

\`\`\`text
${sample.input}
\`\`\`

### 输出样例 ${index + 1}

\`\`\`text
${sample.output}
\`\`\``,
    )
    .join("\n\n");

  return `# ${title}

## 难度

${difficulty?.trim() || "未设置"}

## 分类

${category?.trim() || "未分类"}

## 题目描述

${description}

## 输入格式

${inputDescription}

## 输出格式

${outputDescription}

## 样例

${sampleBlocks || "暂无样例"}

## 数据范围

${dataRange?.trim() || "暂无"}`;
}
