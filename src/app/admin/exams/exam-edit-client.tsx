"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExamFormClient } from "./exam-form-client";

type ExamProblemItem = {
  id: number;
  problemId: number;
  order: number;
  score: number;
  problem: {
    id: number;
    title: string;
    difficulty: string;
    category: string;
  };
};

type ExamValue = {
  id: number;
  title: string;
  description: string | null;
  durationMin: number | null;
  status: string;
  problems: ExamProblemItem[];
};

type SearchProblem = {
  id: number;
  title: string;
  difficulty: string;
  category: string;
};

export function ExamEditClient({ exam }: { exam: ExamValue }) {
  const router = useRouter();
  const [problems, setProblems] = useState(exam.problems);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchProblem[]>([]);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [orderValue, setOrderValue] = useState(
    String((problems.at(-1)?.order ?? 0) + 1),
  );
  const [scoreValue, setScoreValue] = useState("100");

  async function search() {
    setPending(true);
    setMessage("");
    const response = await fetch(
      `/api/admin/problems/search?keyword=${encodeURIComponent(keyword)}`,
    );
    const data = await response.json().catch(() => ({}));
    setPending(false);

    if (!response.ok) {
      setMessage(data.error ?? "搜索失败");
      return;
    }
    setResults(data.problems ?? []);
  }

  async function addProblem(problemId: number) {
    const score = Number(scoreValue);
    const order = Number(orderValue);
    if (!Number.isInteger(score) || score <= 0) {
      setMessage("题目分值必须为正整数");
      return;
    }
    if (orderValue && (!Number.isInteger(order) || order < 0)) {
      setMessage("排序值不能为负数");
      return;
    }

    setPending(true);
    setMessage("");
    const response = await fetch(`/api/admin/exams/${exam.id}/problems`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId,
        order: orderValue,
        score: scoreValue,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);

    if (!response.ok) {
      setMessage(data.error ?? "添加失败");
      return;
    }

    setProblems((current) =>
      [...current, data.examProblem].sort(
        (a, b) => a.order - b.order || a.id - b.id,
      ),
    );
    setOrderValue(String(Number(orderValue || "0") + 1));
    setMessage("题目已添加到考试");
    router.refresh();
  }

  async function removeProblem(item: ExamProblemItem) {
    if (
      !window.confirm(
        `确定要从考试中移除题目《${item.problem.title}》吗？该操作不会删除题库中的题目。`,
      )
    ) {
      return;
    }

    setPending(true);
    setMessage("");
    const response = await fetch(
      `/api/admin/exams/${exam.id}/problems/${item.id}`,
      { method: "DELETE" },
    );
    const data = await response.json().catch(() => ({}));
    setPending(false);

    if (!response.ok) {
      setMessage(data.error ?? "移除失败");
      return;
    }

    setProblems((current) => current.filter((problem) => problem.id !== item.id));
    setMessage("题目已移除");
    router.refresh();
  }

  async function updateProblem(item: ExamProblemItem) {
    if (!Number.isInteger(item.order) || item.order < 0) {
      setMessage("排序值不能为负数");
      return;
    }
    if (!Number.isInteger(item.score) || item.score <= 0) {
      setMessage("题目分值必须为正整数");
      return;
    }

    setPending(true);
    setMessage("");
    const response = await fetch(
      `/api/admin/exams/${exam.id}/problems/${item.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: item.order, score: item.score }),
      },
    );
    const data = await response.json().catch(() => ({}));
    setPending(false);

    if (!response.ok) {
      setMessage(data.error ?? "保存题目设置失败");
      return;
    }

    setProblems((current) =>
      current
        .map((problem) => (problem.id === item.id ? data.examProblem : problem))
        .sort((a, b) => a.order - b.order || a.id - b.id),
    );
    setMessage("题目设置已保存");
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <ExamFormClient
        initialValue={{
          id: exam.id,
          title: exam.title,
          description: exam.description ?? "",
          durationMin: exam.durationMin?.toString() ?? "",
          status: exam.status,
        }}
        mode="edit"
      />

      <section className="surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">考试题目</h2>
            <p className="mt-1 text-sm font-semibold text-ink-600">
              可以从日常题库添加题目，也可以通过 Markdown 导入新题并加入考试。
            </p>
          </div>
          <Link
            className="btn btn-primary"
            href={`/admin/exams/${exam.id}/import`}
          >
            通过 Markdown 导入题目到考试
          </Link>
        </div>

        {message ? (
          <p className="mt-4 border border-ink-950/10 bg-white/70 px-3 py-2 text-sm font-semibold text-ink-700">
            {message}
          </p>
        ) : null}

        <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_120px_120px_110px]">
          <label className="grid gap-2 text-sm font-bold text-ink-800">
            搜索题目名称
            <input
              className="field"
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="例如：A+B"
              value={keyword}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink-800">
            排序
            <input
              className="field"
              onChange={(event) => setOrderValue(event.target.value)}
              type="number"
              value={orderValue}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink-800">
            分值
            <input
              className="field"
              onChange={(event) => setScoreValue(event.target.value)}
              type="number"
              value={scoreValue}
            />
          </label>
          <button
            className="btn btn-secondary self-end justify-center"
            disabled={pending}
            onClick={search}
            type="button"
          >
            搜索
          </button>
        </div>

        {results.length > 0 ? (
          <div className="mt-4 grid gap-2">
            {results.map((problem) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 border border-ink-950/10 bg-white/65 p-3"
                key={problem.id}
              >
                <div>
                  <p className="font-black">{problem.title}</p>
                  <p className="text-sm font-semibold text-ink-600">
                    {problem.category || "未分类"} / {problem.difficulty}
                  </p>
                </div>
                <button
                  className="btn btn-primary px-3 py-2 text-sm"
                  disabled={pending}
                  onClick={() => addProblem(problem.id)}
                  type="button"
                >
                  添加到考试
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-ink-950/10 bg-white/55 text-left">
                <th className="table-head px-4 py-3">排序</th>
                <th className="table-head px-4 py-3">题目</th>
                <th className="table-head px-4 py-3">分类</th>
                <th className="table-head px-4 py-3">分值</th>
                <th className="table-head px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((item) => (
                <tr className="border-b border-ink-950/10" key={item.id}>
                  <td className="px-4 py-3">
                    <input
                      className="field w-24"
                      onChange={(event) =>
                        setProblems((current) =>
                          current.map((problem) =>
                            problem.id === item.id
                              ? { ...problem, order: Number(event.target.value) }
                              : problem,
                          ),
                        )
                      }
                      type="number"
                      value={item.order}
                    />
                  </td>
                  <td className="px-4 py-3 font-black">{item.problem.title}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-ink-700">
                    {item.problem.category || "未分类"}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="field w-24"
                      onChange={(event) =>
                        setProblems((current) =>
                          current.map((problem) =>
                            problem.id === item.id
                              ? { ...problem, score: Number(event.target.value) }
                              : problem,
                          ),
                        )
                      }
                      type="number"
                      value={item.score}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="btn btn-secondary px-3 py-2 text-sm"
                        disabled={pending}
                        onClick={() => updateProblem(item)}
                        type="button"
                      >
                        保存
                      </button>
                      <button
                        className="btn btn-danger px-3 py-2 text-sm"
                        disabled={pending}
                        onClick={() => removeProblem(item)}
                        type="button"
                      >
                        移除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {problems.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-sm font-semibold text-ink-600"
                    colSpan={5}
                  >
                    当前考试还没有题目。
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
