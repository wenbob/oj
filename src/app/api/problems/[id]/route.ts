import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser(request);
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const problemId = Number(id);
  if (!Number.isInteger(problemId)) {
    return NextResponse.json({ error: "题目 ID 不合法" }, { status: 400 });
  }

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      testCases: {
        where: { isSample: true },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!problem) {
    return NextResponse.json({ error: "题目不存在" }, { status: 404 });
  }

  return NextResponse.json({ problem });
}
