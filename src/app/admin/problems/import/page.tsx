import { AppShell } from "@/components/AppShell";
import { requirePageUser } from "@/lib/auth";
import { ImportClient } from "./import-client";

const adminNav = [
  { href: "/admin", label: "后台首页" },
  { href: "/admin/practice", label: "题目练习" },
  { href: "/admin/problems", label: "题目管理" },
  { href: "/admin/exams", label: "模拟考试" },
  { href: "/admin/users", label: "用户管理" },
  { href: "/admin/submissions", label: "日常提交" },
  { href: "/admin/exam-submissions", label: "考试提交" },
];

export default async function AdminProblemImportPage() {
  const user = await requirePageUser("admin");

  return (
    <AppShell nav={adminNav} title="管理员端" user={user}>
      <ImportClient />
    </AppShell>
  );
}
