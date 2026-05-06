import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

function readRole(value: unknown) {
  if (value === "admin" || value === "student") return value;
  return null;
}

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request, "admin");
  if (auth.response) return auth.response;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request, "admin");
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = readRole(body?.role);

  if (!username || !password) {
    return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
  }
  if (!role) {
    return NextResponse.json({ error: "用户角色不合法" }, { status: 400 });
  }

  try {
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: await hashPassword(password),
        role,
      },
      select: { id: true, username: true, role: true, createdAt: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "用户名已存在或创建失败" }, { status: 400 });
  }
}
