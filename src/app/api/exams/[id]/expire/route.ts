import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { finishExamRecord } from "@/lib/examScoring";
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

  const record = await prisma.examRecord.findUnique({
    where: {
      examId_userId: {
        examId,
        userId: auth.user.id,
      },
    },
  });

  if (!record) {
    return NextResponse.json({ error: "考试记录不存在" }, { status: 404 });
  }

  const examRecord =
    record.status === "in_progress"
      ? await finishExamRecord({
          examId,
          status: "expired",
          userId: auth.user.id,
        })
      : record;

  return NextResponse.json({
    examRecord,
    resultHref: `/student/exams/${examId}/result`,
  });
}
