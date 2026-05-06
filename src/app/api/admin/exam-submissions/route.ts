import { NextRequest, NextResponse } from "next/server";
import {
  buildAdminSubmissionWhere,
  readAdminSubmissionFiltersFromUrl,
} from "@/lib/adminSubmissionFilters";
import { requireApiUser } from "@/lib/auth";
import {
  buildPaginationMeta,
  readPaginationFromUrl,
} from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request, "admin");
  if (auth.response) return auth.response;

  const filters = readAdminSubmissionFiltersFromUrl(request.nextUrl.searchParams);
  const { page, pageSize, skip } = readPaginationFromUrl(request.nextUrl.searchParams);
  const where = {
    ...buildAdminSubmissionWhere(filters),
    submissionType: "exam",
  };
  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      include: {
        exam: { select: { id: true, title: true } },
        user: { select: { id: true, username: true, role: true } },
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
