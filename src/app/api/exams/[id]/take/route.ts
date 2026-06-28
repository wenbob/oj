import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { expireExamRecordIfNeeded } from "@/lib/examScoring";
import {
  getPublicObjectiveItems,
  parseObjectiveItems,
} from "@/lib/objectiveProblem";
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
    select: {
      id: true,
      title: true,
      description: true,
      durationMin: true,
      status: true,
      examType: true,
      problems: {
        select: {
          id: true,
          problemId: true,
          order: true,
          score: true,
          problem: {
            select: {
              id: true,
              title: true,
              description: true,
              inputDescription: true,
              outputDescription: true,
              sampleInput: true,
              sampleOutput: true,
              dataRange: true,
              difficulty: true,
              category: true,
              problemType: true,
              objectiveItems: true,
              testCases: {
                where: { isSample: true },
                orderBy: { id: "asc" },
                select: {
                  id: true,
                  input: true,
                  output: true,
                  isSample: true,
                },
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

  const publicExam = {
    ...exam,
    problems: exam.problems.map((examProblem) => ({
      ...examProblem,
      problem: {
        ...examProblem.problem,
        objectiveItems:
          examProblem.problem.problemType === "objective"
            ? getPublicObjectiveItems(
                parseObjectiveItems(examProblem.problem.objectiveItems),
              )
            : [],
      },
    })),
  };

  return NextResponse.json({ exam: publicExam, submissions });
}
