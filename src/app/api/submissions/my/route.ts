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

  const { page, pageSize, skip } = readPaginationFromUrl(request.nextUrl.searchParams);
  const where = { userId: auth.user.id, submissionType: "practice" };
  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      include: {
        problem: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.submission.count({ where }),
  ]);

  return NextResponse.json({
    items: submissions,
    submissions,
    ...buildPaginationMeta({ page, pageSize, total }),
  });
}
