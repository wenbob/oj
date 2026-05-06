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
  if (!Number.isInteger(examId)) {
    return NextResponse.json({ error: "考试 ID 不合法" }, { status: 400 });
  }

  const existingExam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      problems: {
        include: {
          problem: { select: { title: true } },
        },
        orderBy: [{ order: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!existingExam) {
    return NextResponse.json({ error: "考试不存在" }, { status: 404 });
  }
  if (!existingExam.title.trim()) {
    return NextResponse.json({ error: "考试标题不能为空" }, { status: 400 });
  }
  if (!existingExam.durationMin || existingExam.durationMin <= 0) {
    return NextResponse.json({ error: "考试时长必须大于 0 分钟" }, { status: 400 });
  }
  if (existingExam.problems.length === 0) {
    return NextResponse.json(
      { error: "考试至少需要添加 1 道题后才能发布" },
      { status: 400 },
    );
  }
  const invalidProblem = existingExam.problems.find((item) => item.score <= 0);
  if (invalidProblem) {
    return NextResponse.json(
      { error: `题目《${invalidProblem.problem.title}》的分值必须大于 0` },
      { status: 400 },
    );
  }

  const exam = await prisma.exam.update({
    where: { id: examId },
    data: { status: "published" },
  });

  return NextResponse.json({ exam });
}
