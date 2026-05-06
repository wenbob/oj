import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import {
  buildPaginationMeta,
  readPaginationFromUrl,
} from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (auth.response) return auth.response;

  const category = request.nextUrl.searchParams.get("category")?.trim();
  const { page, pageSize, skip } = readPaginationFromUrl(request.nextUrl.searchParams);
  const where = category ? { category } : undefined;
  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        difficulty: true,
        category: true,
        createdAt: true,
      },
    }),
    prisma.problem.count({ where }),
  ]);

  return NextResponse.json({
    items: problems,
    problems,
    ...buildPaginationMeta({ page, pageSize, total }),
  });
}
