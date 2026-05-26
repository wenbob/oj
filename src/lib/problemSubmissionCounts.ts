import { prisma } from "@/lib/prisma";

export async function getPracticeSubmissionCountsByProblem({
  problemIds,
  userId,
}: {
  problemIds: number[];
  userId?: number;
}) {
  if (problemIds.length === 0) {
    return new Map<number, number>();
  }

  const rows = await prisma.submission.groupBy({
    by: ["problemId"],
    where: {
      problemId: { in: problemIds },
      submissionType: "practice",
      ...(userId ? { userId } : {}),
    },
    _count: { _all: true },
  });

  return new Map(rows.map((row) => [row.problemId, row._count._all]));
}
