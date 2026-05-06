import { AppShell } from "@/components/AppShell";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserManager } from "./user-manager";

const adminNav = [
  { href: "/admin", label: "后台首页" },
  { href: "/admin/practice", label: "题目练习" },
  { href: "/admin/problems", label: "题目管理" },
  { href: "/admin/exams", label: "模拟考试" },
  { href: "/admin/users", label: "用户管理" },
  { href: "/admin/submissions", label: "日常提交" },
  { href: "/admin/exam-submissions", label: "考试提交" },
];

export default async function AdminUsersPage() {
  const user = await requirePageUser("admin");
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

  return (
    <AppShell nav={adminNav} title="管理员端" user={user}>
      <UserManager
        initialUsers={users.map((item) => ({
          id: item.id,
          username: item.username,
          role: item.role,
          createdAt: item.createdAt.toISOString(),
          submissions: item._count.submissions,
        }))}
      />
    </AppShell>
  );
}
