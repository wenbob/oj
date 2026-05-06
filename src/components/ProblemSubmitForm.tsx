"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { SendHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatRuntime } from "@/lib/format";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[460px] items-center justify-center border border-ink-950/15 bg-[#1e1e1e] text-sm font-semibold text-stone-300">
      编辑器加载中...
    </div>
  ),
});

const fallbackCppTemplate = `#include <bits/stdc++.h>
using namespace std;

int main() {
    return 0;
}
`;

type SubmissionResult = {
  id: number;
  status: string;
  passedCount: number;
  totalCount: number;
  runtimeMs: number;
  errorMessage?: string | null;
};

export function ProblemSubmitForm({
  defaultCodeTemplate,
  detailHrefBase = "/student/submissions",
  disabled = false,
  disabledMessage,
  examId,
  examEndsAt,
  fromSubmissionId,
  problemId,
}: {
  defaultCodeTemplate?: string;
  detailHrefBase?: string;
  disabled?: boolean;
  disabledMessage?: string;
  examId?: number;
  examEndsAt?: string | null;
  fromSubmissionId?: number;
  problemId: number;
}) {
  const storageKey = `oj-code-problem-${problemId}`;
  const initialCode =
    defaultCodeTemplate && defaultCodeTemplate.trim()
      ? defaultCodeTemplate
      : fallbackCppTemplate;
  const [code, setCode] = useState(initialCode);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [loadMessage, setLoadMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const frame = window.requestAnimationFrame(async () => {
      if (cancelled) return;

      if (fromSubmissionId) {
        try {
          const response = await fetch(`/api/submissions/${fromSubmissionId}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error ?? "历史代码加载失败");
          }

          if (data.submission?.problem?.id !== problemId) {
            throw new Error("历史提交不属于当前题目");
          }
          const historicalExamId =
            data.submission?.examId ?? data.submission?.exam?.id ?? null;
          const historicalType =
            data.submission?.submissionType ??
            (historicalExamId === null ? "practice" : "exam");
          if (
            examId &&
            (historicalType !== "exam" || historicalExamId !== examId)
          ) {
            throw new Error("历史提交不属于当前考试");
          }
          if (!examId && historicalType !== "practice") {
            throw new Error("考试提交不能加载到日常刷题页");
          }

          const historicalCode = data.submission.code;
          setCode(historicalCode);
          window.localStorage.setItem(storageKey, historicalCode);
          setLoadMessage("已加载历史提交代码，你可以继续修改后重新提交。");
          setDraftLoaded(true);
          return;
        } catch {
          setLoadError("历史代码加载失败，请重新进入提交详情页。");
        }
      }

      const savedCode = window.localStorage.getItem(storageKey);
      if (savedCode !== null) {
        setCode(savedCode);
      }
      setDraftLoaded(true);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [examId, fromSubmissionId, problemId, storageKey]);

  useEffect(() => {
    if (!examEndsAt) return;

    const endTime = new Date(examEndsAt).getTime();
    const updateExpired = () => setTimeExpired(Date.now() >= endTime);

    updateExpired();
    const timer = window.setInterval(updateExpired, 1000);
    return () => window.clearInterval(timer);
  }, [examEndsAt]);

  useEffect(() => {
    if (!draftLoaded) return;
    window.localStorage.setItem(storageKey, code);
  }, [code, draftLoaded, storageKey]);

  async function submit() {
    if (disabled || timeExpired) {
      setError(disabledMessage ?? "考试已结束，不能继续提交");
      return;
    }

    setPending(true);
    setError("");
    setResult(null);

    const response = await fetch(`/api/problems/${problemId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, examId }),
    });
    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(data.error ?? "提交失败");
      return;
    }
    setResult(data.submission);
  }

  return (
    <section className="surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black">C++17 代码</h2>
        <span className="border border-ink-950/10 bg-white/65 px-2.5 py-1 text-xs font-bold text-ink-700">
          语言：C++17
        </span>
      </div>
      <div className="mt-4">
        <CodeEditor
          height="460px"
          language="cpp"
          value={code}
          onChange={setCode}
        />
      </div>
      {loadMessage ? (
        <p className="mt-3 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          {loadMessage}
        </p>
      ) : null}
      {loadError ? (
        <p className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
          {loadError}
        </p>
      ) : null}
      <button
        className="btn btn-primary mt-4 w-full"
        disabled={pending || disabled || timeExpired}
        onClick={submit}
        type="button"
      >
        <SendHorizontal size={16} />
        {pending ? "评测中" : "提交代码"}
      </button>
      {error ? (
        <p className="mt-3 border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
          {error}
        </p>
      ) : null}
      {!error && (disabled || timeExpired) ? (
        <p className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
          {disabledMessage ?? "考试已结束，不能继续提交"}
        </p>
      ) : null}
      {result ? (
        <div className="mt-4 grid gap-2 border border-ink-950/10 bg-white/70 p-4 text-sm font-semibold text-ink-700">
          <StatusBadge status={result.status} />
          <span>
            {result.passedCount}/{result.totalCount} 测试点
          </span>
          <span>{formatRuntime(result.runtimeMs)}</span>
          {result.errorMessage ? (
            <pre className="mt-2 max-h-44 overflow-auto border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {result.errorMessage}
            </pre>
          ) : null}
          <Link
            className="btn btn-secondary mt-2 w-full"
            href={`${detailHrefBase}/${result.id}`}
          >
            查看详情
          </Link>
        </div>
      ) : null}
    </section>
  );
}
