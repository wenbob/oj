import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { finishExamRecord, isExamExpired } from "@/lib/examScoring";
import { judgeCppCode } from "@/lib/judge";
import { enqueueJudgeTask } from "@/lib/judgeQueue";
import { prisma } from "@/lib/prisma";
import { getJudgeDefaultSettings } from "@/lib/settings";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser(request);
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const problemId = Number(id);
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";
  const examId =
    body?.examId === undefined || body?.examId === null || body?.examId === ""
      ? null
      : Number(body.examId);

  if (!Number.isInteger(problemId)) {
    return NextResponse.json({ error: "题目 ID 不合法" }, { status: 400 });
  }
  if (!code.trim()) {
    return NextResponse.json({ error: "代码不能为空" }, { status: 400 });
  }
  if (examId !== null && !Number.isInteger(examId)) {
    return NextResponse.json({ error: "考试 ID 不合法" }, { status: 400 });
  }

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: { testCases: { orderBy: { id: "asc" } } },
  });

  if (!problem) {
    return NextResponse.json({ error: "题目不存在" }, { status: 404 });
  }
  if (problem.testCases.length === 0) {
    return NextResponse.json({ error: "该题还没有测试点" }, { status: 400 });
  }

  const submissionType = examId === null ? "practice" : "exam";

  if (examId !== null) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        problems: {
          where: { problemId },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!exam || exam.problems.length === 0) {
      return NextResponse.json(
        { error: "考试不存在，或当前题目不属于该考试" },
        { status: 404 },
      );
    }
    const examRecord = await prisma.examRecord.findUnique({
      where: {
        examId_userId: {
          examId,
          userId: auth.user.id,
        },
      },
    });

    if (!examRecord) {
      return NextResponse.json({ error: "请先开始考试" }, { status: 403 });
    }
    if (examRecord.status !== "in_progress") {
      return NextResponse.json(
        { error: "考试已经结束，不能继续提交" },
        { status: 403 },
      );
    }
    if (exam.status !== "published") {
      await finishExamRecord({
        examId,
        status: "expired",
        userId: auth.user.id,
      });
      return NextResponse.json(
        { error: "该考试未发布或已结束，不能提交" },
        { status: 403 },
      );
    }
    if (
      isExamExpired({
        durationMin: exam.durationMin,
        startedAt: examRecord.startedAt,
      })
    ) {
      await finishExamRecord({
        examId,
        status: "expired",
        userId: auth.user.id,
      });
      return NextResponse.json(
        { error: "考试已超时，不能继续提交" },
        { status: 403 },
      );
    }
  }

  let result;
  try {
    const judgeDefaults = await getJudgeDefaultSettings();
    result = await enqueueJudgeTask(() =>
      judgeCppCode({
        code,
        testCases: problem.testCases.map((item) => ({
          input: item.input,
          output: item.output,
        })),
        timeLimitMs: judgeDefaults.timeLimitMs,
        memoryLimitMb: judgeDefaults.memoryLimitMb,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "评测任务执行失败" },
      { status: 500 },
    );
  }

  const submission = await prisma.submission.create({
    data: {
      userId: auth.user.id,
      problemId,
      examId,
      submissionType,
      code,
      language: "C++17",
      status: result.status,
      passedCount: result.passedCount,
      totalCount: result.totalCount,
      runtimeMs: result.runtimeMs,
      errorMessage: result.errorMessage,
      caseResults: {
        create: result.caseResults.map((caseResult) => ({
          caseIndex: caseResult.caseIndex,
          status: caseResult.status,
          input: caseResult.input,
          expectedOutput: caseResult.expectedOutput,
          actualOutput: caseResult.actualOutput,
          runtimeMs: caseResult.runtimeMs,
          errorMessage: caseResult.errorMessage,
        })),
      },
    },
    include: {
      caseResults: { orderBy: { caseIndex: "asc" } },
    },
  });

  return NextResponse.json({ submission, submissionId: submission.id });
}
