import { describe, expect, it } from "vitest";
import {
  getObjectiveSubmissionScore,
  getObjectiveTotalScore,
  getPublicObjectiveItems,
  judgeObjectiveSubmission,
  type ObjectiveItem,
  validateObjectiveItems,
} from "./objectiveProblem";

const items: ObjectiveItem[] = [
  {
    kind: "choice",
    stem: "下列哪个标识符不合法？",
    options: [
      { label: "A", text: "five-Star" },
      { label: "B", text: "five_star" },
      { label: "C", text: "fiveStar" },
      { label: "D", text: "_fiveStar" },
    ],
    answer: "A",
    score: 2,
  },
  {
    kind: "judge",
    stem: "break 可以终止当前循环。",
    options: [
      { label: "A", text: "正确" },
      { label: "B", text: "错误" },
    ],
    answer: "A",
    score: 3,
  },
];

describe("objective problems", () => {
  it("accepts lowercase answers and creates one case result per item", () => {
    const result = judgeObjectiveSubmission({
      answerText: "a\nb",
      items,
    });

    expect(result.status).toBe("Wrong Answer");
    expect(result.passedCount).toBe(1);
    expect(result.totalCount).toBe(2);
    expect(result.caseResults).toHaveLength(2);
    expect(result.caseResults[0].status).toBe("Accepted");
    expect(result.caseResults[1].actualOutput).toBe("b");
  });

  it("returns Accepted when every line is correct", () => {
    const result = judgeObjectiveSubmission({
      answerText: "A\nA\n",
      items,
    });

    expect(result.status).toBe("Accepted");
    expect(result.passedCount).toBe(2);
  });

  it("calculates partial score from accepted case indexes", () => {
    expect(
      getObjectiveSubmissionScore({
        items,
        caseResults: [
          { caseIndex: 1, status: "Accepted" },
          { caseIndex: 2, status: "Wrong Answer" },
        ],
      }),
    ).toBe(2);
    expect(getObjectiveTotalScore(items)).toBe(5);
  });

  it("removes answers from participant-facing items", () => {
    const publicItems = getPublicObjectiveItems(items);

    expect(publicItems[0]).not.toHaveProperty("answer");
    expect(publicItems[0].stem).toBe(items[0].stem);
  });

  it("rejects non-integer scores and answers outside the options", () => {
    expect(
      validateObjectiveItems([
        {
          ...items[0],
          answer: "E",
          score: 1.5,
        },
      ]),
    ).toEqual(
      expect.arrayContaining([
        "第 1 小题分值必须是正整数",
        "第 1 小题答案必须是已有选项字母",
      ]),
    );
  });

  it("rejects duplicate option labels and labels outside A-D", () => {
    expect(
      validateObjectiveItems([
        {
          ...items[0],
          options: [
            { label: "A", text: "选项一" },
            { label: "A", text: "选项二" },
            { label: "E", text: "选项三" },
          ],
          answer: "A",
        },
      ]),
    ).toEqual(
      expect.arrayContaining([
        "第 1 小题选项字母不能重复",
        "第 1 小题选项字母必须是 A-D",
      ]),
    );
  });
});
