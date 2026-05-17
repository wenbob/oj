import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request, "admin");
  if (auth.response) return auth.response;

  const keyword = request.nextUrl.searchParams.get("keyword")?.trim() ?? "";
  const category = request.nextUrl.searchParams.get("category")?.trim() ?? "";
  const where: Prisma.ProblemWhereInput = {};
  if (keyword) {
    where.title = {
      contains: keyword,
    };
  }
  if (category) {
    where.category = category;
  }
  const problems = await prisma.problem.findMany({
    where: Object.keys(where).length ? where : undefined,
    select: {
      id: true,
      title: true,
      difficulty: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const categoryRows = await prisma.problem.findMany({
    distinct: ["category"],
    orderBy: { category: "asc" },
    select: { category: true },
  });

  return NextResponse.json({
    problems,
    categories: categoryRows.map((item) => item.category).filter(Boolean),
  });
}
