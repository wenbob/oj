import { NextResponse } from "next/server";
import { getJudgeMode, validateProductionEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const envStatus = validateProductionEnv();
  if (!envStatus.ok) {
    return NextResponse.json(
      {
        ok: false,
        database: "unknown",
        judgeMode: getJudgeMode(),
        timestamp: new Date().toISOString(),
        errors: envStatus.errors,
      },
      { status: 500 },
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      database: "ok",
      judgeMode: getJudgeMode(),
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        judgeMode: getJudgeMode(),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
