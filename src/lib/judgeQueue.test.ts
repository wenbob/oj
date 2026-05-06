import { describe, expect, it } from "vitest";
import { enqueueJudgeTask } from "./judgeQueue";

describe("enqueueJudgeTask", () => {
  it("limits concurrent judge tasks", async () => {
    const previousConcurrency = process.env.JUDGE_CONCURRENCY;
    process.env.JUDGE_CONCURRENCY = "1";

    let running = 0;
    let maxRunning = 0;

    try {
      await Promise.all(
        Array.from({ length: 3 }, (_, index) =>
          enqueueJudgeTask(
            () =>
              new Promise<number>((resolve) => {
                running += 1;
                maxRunning = Math.max(maxRunning, running);
                setTimeout(() => {
                  running -= 1;
                  resolve(index);
                }, 10);
              }),
          ),
        ),
      );

      expect(maxRunning).toBe(1);
    } finally {
      if (previousConcurrency === undefined) {
        delete process.env.JUDGE_CONCURRENCY;
      } else {
        process.env.JUDGE_CONCURRENCY = previousConcurrency;
      }
    }
  });

  it("keeps draining after a task fails", async () => {
    const previousConcurrency = process.env.JUDGE_CONCURRENCY;
    process.env.JUDGE_CONCURRENCY = "1";
    const finished: string[] = [];

    try {
      const failed = enqueueJudgeTask(async () => {
        finished.push("failed-start");
        throw new Error("boom");
      }).catch((error) => {
        finished.push(error instanceof Error ? error.message : "failed");
      });

      const next = enqueueJudgeTask(async () => {
        finished.push("next");
      });

      await Promise.all([failed, next]);
      expect(finished).toEqual(["failed-start", "boom", "next"]);
    } finally {
      if (previousConcurrency === undefined) {
        delete process.env.JUDGE_CONCURRENCY;
      } else {
        process.env.JUDGE_CONCURRENCY = previousConcurrency;
      }
    }
  });
});
