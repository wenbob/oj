import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProblemSamples } from "./ProblemSamples";
import { getDisplaySamples } from "../lib/problemSamples";

describe("ProblemSamples", () => {
  it("标题显示在代码框外部", () => {
    const html = renderToStaticMarkup(
      <ProblemSamples samples={[{ input: "1 2", output: "3" }]} />,
    );

    expect(html).toContain("样例输入 1");
    expect(html).toContain("<pre");
    expect(html).not.toContain("<pre>样例输入 1");
  });

  it("可以展示多组样例", () => {
    const html = renderToStaticMarkup(
      <ProblemSamples
        samples={[
          { input: "1 2", output: "3" },
          { input: "10 20", output: "30" },
        ]}
      />,
    );

    expect(html).toContain("样例输入 1");
    expect(html).toContain("样例输出 1");
    expect(html).toContain("样例输入 2");
    expect(html).toContain("样例输出 2");
  });
});

describe("getDisplaySamples", () => {
  it("优先使用 TestCase 样例", () => {
    expect(
      getDisplaySamples({
        sampleInput: "old",
        sampleOutput: "old",
        testCases: [{ id: 1, input: "new", output: "new" }],
      }),
    ).toEqual([{ id: 1, input: "new", output: "new" }]);
  });

  it("老数据没有 TestCase 样例时 fallback 到 Problem 样例字段", () => {
    expect(
      getDisplaySamples({
        sampleInput: "old in",
        sampleOutput: "old out",
        testCases: [],
      }),
    ).toEqual([{ input: "old in", output: "old out" }]);
  });
});
