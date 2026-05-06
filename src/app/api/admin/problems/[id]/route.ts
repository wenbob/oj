import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { normalizeProblemPayload } from "@/lib/problemPayload";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseId(id: string) {
  const problemId = Number(id);
  return Number.isInteger(problemId) ? problemId : null;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser(request, "admin");
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const problemId = parseId(id);
  if (!problemId) {
    return NextResponse.json({ error: "题目 ID 不合法" }, { status: 400 });
  }

  try {
    const payload = normalizeProblemPayload(await request.json());
    const problem = await prisma.$transaction(async (tx) => {
      await tx.testCase.deleteMany({ where: { problemId } });
      return tx.problem.update({
        where: { id: problemId },
        data: {
          title: payload.title,
          description: payload.description,
          inputDescription: payload.inputDescription,
          outputDescription: payload.outputDescription,
          sampleInput: payload.sampleInput,
          sampleOutput: payload.sampleOutput,
          dataRange: payload.dataRange,
          difficulty: payload.difficulty,
          category: payload.category,
          testCases: { create: payload.testCases },
        },
        include: { testCases: true },
      });
    });

    return NextResponse.json({ problem });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新题目失败" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser(request, "admin");
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const problemId = parseId(id);
  if (!problemId) {
    return NextResponse.json({ error: "题目 ID 不合法" }, { status: 400 });
  }

  await prisma.problem.delete({ where: { id: problemId } });
  return NextResponse.json({ ok: true });
}
