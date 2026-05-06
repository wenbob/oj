import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { expireExamRecordIfNeeded } from "@/lib/examScoring";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser(request);
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const examId = Number(id);
  if (!Number.isInteger(examId)) {
    return NextResponse.json({ error: "考试 ID 不合法" }, { status: 400 });
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      problems: {
        include: {
          problem: {
            include: {
              testCases: {
                where: { isSample: true },
                orderBy: { id: "asc" },
              },
            },
          },
        },
        orderBy: [{ order: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!exam) {
    return NextResponse.json({ error: "考试不存在或尚未发布" }, { status: 404 });
  }

  const record = await expireExamRecordIfNeeded({ examId, userId: auth.user.id });
  if (!record) {
    return NextResponse.json({ error: "请先开始考试" }, { status: 403 });
  }
  if (record.status !== "in_progress") {
    return NextResponse.json(
      {
        error: "考试已经结束",
        resultHref: `/student/exams/${examId}/result`,
      },
      { status: 409 },
    );
  }
  if (exam.status !== "published") {
    return NextResponse.json(
      {
        error: "考试已经结束",
        resultHref: `/student/exams/${examId}/result`,
      },
      { status: 409 },
    );
  }

  const problemIds = exam.problems.map((item) => item.problemId);
  const submissions = await prisma.submission.findMany({
    where: {
      examId,
      userId: auth.user.id,
      submissionType: "exam",
      problemId: { in: problemIds },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      problemId: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ exam, submissions });
}
