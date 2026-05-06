import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getAllSystemSettings,
  normalizeSystemSettingsPayload,
  systemSettingsEntries,
  validateSystemSettings,
} from "@/lib/settings";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request, "admin");
  if (auth.response) return auth.response;

  const settings = await getAllSystemSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const auth = await requireApiUser(request, "admin");
  if (auth.response) return auth.response;

  const settings = normalizeSystemSettingsPayload(await request.json().catch(() => null));
  const error = validateSystemSettings(settings);
  if (error) return NextResponse.json({ error }, { status: 400 });

  await prisma.$transaction(
    systemSettingsEntries(settings).map((item) =>
      prisma.systemSetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: item,
      }),
    ),
  );

  return NextResponse.json({ settings });
}
