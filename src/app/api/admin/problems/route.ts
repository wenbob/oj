import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import {
  buildPaginationMeta,
  readPaginationFromUrl,
} from "@/lib/pagination";
import { normalizeProblemPayload } from "@/lib/problemPayload";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request, "admin");
  if (auth.response) return auth.response;

  const category = request.nextUrl.searchParams.get("category")?.trim();
  const { page, pageSize, skip } = readPaginationFromUrl(request.nextUrl.searchParams);
  const where = category ? { category } : undefined;
  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where,
      include: {
        testCases: { orderBy: { id: "asc" } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.problem.count({ where }),
  ]);

  return NextResponse.json({
    items: problems,
    problems,
    ...buildPaginationMeta({ page, pageSize, total }),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request, "admin");
  if (auth.response) return auth.response;

  try {
    const payload = normalizeProblemPayload(await request.json());
    const problem = await prisma.problem.create({
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
        testCases: {
          create: payload.testCases,
        },
      },
      include: { testCases: true },
    });

    return NextResponse.json({ problem }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建题目失败" },
      { status: 400 },
    );
  }
}
