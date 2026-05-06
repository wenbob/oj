import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { finishExamRecord, isExamExpired } from "@/lib/examScoring";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser(request, "student");
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const examId = Number(id);
  if (!Number.isInteger(examId)) {
    return NextResponse.json({ error: "考试 ID 不合法" }, { status: 400 });
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: {
      durationMin: true,
      id: true,
      status: true,
    },
  });

  if (!exam) {
    return NextResponse.json({ error: "考试不存在" }, { status: 404 });
  }

  const existingRecord = await prisma.examRecord.findUnique({
    where: {
      examId_userId: {
        examId,
        userId: auth.user.id,
      },
    },
  });

  if (exam.status !== "published") {
    if (existingRecord?.status === "in_progress") {
      await finishExamRecord({
        examId,
        status: "expired",
        userId: auth.user.id,
      });
    }
    if (existingRecord) {
      return NextResponse.json(
        {
          error: "考试已经结束，请查看结果",
          resultHref: `/student/exams/${examId}/result`,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "考试未发布或已结束，不能开始考试" },
      { status: 403 },
    );
  }

  if (existingRecord) {
    if (existingRecord.status !== "in_progress") {
      return NextResponse.json(
        {
          error: "考试已经结束，请查看结果",
          resultHref: `/student/exams/${examId}/result`,
        },
        { status: 409 },
      );
    }

    if (
      isExamExpired({
        durationMin: exam.durationMin,
        startedAt: existingRecord.startedAt,
      })
    ) {
      await finishExamRecord({
        examId,
        status: "expired",
        userId: auth.user.id,
      });
      return NextResponse.json(
        {
          error: "考试已超时，请查看结果",
          resultHref: `/student/exams/${examId}/result`,
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      examRecord: existingRecord,
      redirectTo: `/student/exams/${examId}/take`,
    });
  }

  const examRecord = await prisma.examRecord.create({
    data: {
      examId,
      userId: auth.user.id,
    },
  });

  return NextResponse.json(
    {
      examRecord,
      redirectTo: `/student/exams/${examId}/take`,
    },
    { status: 201 },
  );
}
