type QueueItem<T> = {
  reject: (reason?: unknown) => void;
  resolve: (value: T) => void;
  task: () => Promise<T>;
};

const queue: QueueItem<unknown>[] = [];
let runningCount = 0;

function readConcurrency() {
  const parsed = Number(process.env.JUDGE_CONCURRENCY);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function drainQueue() {
  const concurrency = readConcurrency();

  while (runningCount < concurrency && queue.length > 0) {
    const item = queue.shift();
    if (!item) return;

    runningCount += 1;
    Promise.resolve()
      .then(item.task)
      .then(item.resolve, item.reject)
      .finally(() => {
        runningCount -= 1;
        drainQueue();
      });
  }
}

export function enqueueJudgeTask<T>(task: () => Promise<T>) {
  return new Promise<T>((resolve, reject) => {
    queue.push({
      reject,
      resolve: resolve as (value: unknown) => void,
      task,
    });
    drainQueue();
  });
}

export function getJudgeQueueStats() {
  return {
    concurrency: readConcurrency(),
    pending: queue.length,
    running: runningCount,
  };
}
