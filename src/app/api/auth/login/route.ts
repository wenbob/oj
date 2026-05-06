import { NextRequest, NextResponse } from "next/server";
import { attachSessionResponse, roleHome } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ error: "请输入用户名和密码" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  if (user.role !== "student" && user.role !== "admin") {
    return NextResponse.json({ error: "账号角色异常" }, { status: 403 });
  }

  const safeUser = {
    id: user.id,
    username: user.username,
    role: user.role as "student" | "admin",
  };
  const response = NextResponse.json({
    user: safeUser,
    redirectTo: roleHome(user.role),
  });

  return attachSessionResponse(response, safeUser);
}
