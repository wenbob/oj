import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import {
  getObjectiveTotalScore,
  parseObjectiveItems,
  validateObjectiveItems,
} from "@/lib/objectiveProblem";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser(request, "admin");
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const examId = Number(id);
  const body = await request.json().catch(() => null);
  const rawProblemIds: unknown[] = Array.isArray(body?.problemIds)
    ? body.problemIds
    : [body?.problemId];
  const problemIds: number[] = Array.from(
    new Set<number>(rawProblemIds.map((value) => Number(value))),
  );
  const score = body?.score === undefined || body?.score === "" ? 100 : Number(body.score);
  const order =
    body?.order === undefined || body?.order === "" ? null : Number(body.order);

  if (
    !Number.isInteger(examId) ||
    problemIds.length === 0 ||
    problemIds.some((problemId) => !Number.isInteger(problemId))
  ) {
    return NextResponse.json({ error: "考试或题目 ID 不合法" }, { status: 400 });
  }
  if (!Number.isInteger(score) || score <= 0) {
    return NextResponse.json({ error: "分值必须是正整数" }, { status: 400 });
  }
  if (order !== null && (!Number.isInteger(order) || order < 0)) {
    return NextResponse.json({ error: "排序值不合法" }, { status: 400 });
  }

  const [exam, foundProblems, existingProblems] = await Promise.all([
    prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, examType: true },
    }),
    prisma.problem.findMany({
      where: { id: { in: problemIds } },
      select: {
        id: true,
        title: true,
        problemType: true,
        objectiveItems: true,
      },
    }),
    prisma.examProblem.findMany({
      where: { examId, problemId: { in: problemIds } },
      select: { problemId: true },
    }),
  ]);

  if (!exam) return NextResponse.json({ error: "考试不存在" }, { status: 404 });
  if (foundProblems.length !== problemIds.length) {
    return NextResponse.json({ error: "存在不存在的题目" }, { status: 404 });
  }
  const mismatchedProblem = foundProblems.find(
    (problem) => problem.problemType !== exam.examType,
  );
  if (mismatchedProblem) {
    return NextResponse.json(
      {
        error: `题目《${mismatchedProblem.title}》与当前考试类型不一致`,
      },
      { status: 400 },
    );
  }
  if (existingProblems.length > 0) {
    return NextResponse.json({ error: "选中的题目中有题目已经在考试中" }, { status: 409 });
  }

  const nextOrder =
    order ??
    ((await prisma.examProblem.aggregate({
      where: { examId },
      _max: { order: true },
    }))._max.order ?? 0) + 1;

  try {
    const foundProblemMap = new Map(
      foundProblems.map((problem) => [problem.id, problem]),
    );
    const examProblems = await prisma.$transaction((tx) =>
      Promise.all(
        problemIds.map((problemId, index) => {
          const problem = foundProblemMap.get(problemId);
          if (!problem) throw new Error("题目不存在");
          const objectiveItems =
            problem.problemType === "objective"
              ? parseObjectiveItems(problem.objectiveItems)
              : [];
          const objectiveErrors =
            problem.problemType === "objective"
              ? validateObjectiveItems(objectiveItems)
              : [];
          if (objectiveErrors.length > 0) {
            throw new Error(
              `题目《${problem.title}》配置无效：${objectiveErrors[0]}`,
            );
          }

          return tx.examProblem.create({
            data: {
              examId,
              problemId,
              score:
                problem.problemType === "objective"
                  ? getObjectiveTotalScore(objectiveItems)
                  : score,
              order: nextOrder + index,
            },
            include: {
              problem: {
                select: {
                  id: true,
                  title: true,
                  difficulty: true,
                  category: true,
                  problemType: true,
                },
              },
            },
          });
        }),
      ),
    );

    if (Array.isArray(body?.problemIds)) {
      return NextResponse.json({ examProblems }, { status: 201 });
    }

    return NextResponse.json({ examProblem: examProblems[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "添加题目失败" },
      { status: 409 },
    );
  }
}
