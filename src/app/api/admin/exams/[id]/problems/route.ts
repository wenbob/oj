import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
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
  const problemId = Number(body?.problemId);
  const score = body?.score === undefined || body?.score === "" ? 100 : Number(body.score);
  const order =
    body?.order === undefined || body?.order === "" ? null : Number(body.order);

  if (!Number.isInteger(examId) || !Number.isInteger(problemId)) {
    return NextResponse.json({ error: "考试或题目 ID 不合法" }, { status: 400 });
  }
  if (!Number.isInteger(score) || score <= 0) {
    return NextResponse.json({ error: "分值必须是正整数" }, { status: 400 });
  }
  if (order !== null && (!Number.isInteger(order) || order < 0)) {
    return NextResponse.json({ error: "排序值不合法" }, { status: 400 });
  }

  const [exam, problem] = await Promise.all([
    prisma.exam.findUnique({ where: { id: examId }, select: { id: true } }),
    prisma.problem.findUnique({ where: { id: problemId }, select: { id: true } }),
  ]);

  if (!exam) return NextResponse.json({ error: "考试不存在" }, { status: 404 });
  if (!problem) return NextResponse.json({ error: "题目不存在" }, { status: 404 });

  const nextOrder =
    order ??
    ((await prisma.examProblem.aggregate({
      where: { examId },
      _max: { order: true },
    }))._max.order ?? 0) + 1;

  try {
    const examProblem = await prisma.examProblem.create({
      data: {
        examId,
        problemId,
        score,
        order: nextOrder,
      },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json({ examProblem }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "该题已经在考试中" }, { status: 409 });
  }
}
