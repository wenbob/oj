import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request, "admin");
  if (auth.response) return auth.response;

  const keyword = request.nextUrl.searchParams.get("keyword")?.trim() ?? "";
  const problems = await prisma.problem.findMany({
    where: keyword
      ? {
          title: {
            contains: keyword,
          },
        }
      : undefined,
    select: {
      id: true,
      title: true,
      difficulty: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ problems });
}
