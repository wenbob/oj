import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { requirePageUser } from "@/lib/auth";
import { ExamFormClient } from "../exam-form-client";

const adminNav = [
  { href: "/admin", label: "后台首页" },
  { href: "/admin/practice", label: "题目练习" },
  { href: "/admin/problems", label: "题目管理" },
  { href: "/admin/exams", label: "模拟考试" },
  { href: "/admin/users", label: "用户管理" },
  { href: "/admin/submissions", label: "日常提交" },
  { href: "/admin/exam-submissions", label: "考试提交" },
];

export default async function AdminNewExamPage() {
  const user = await requirePageUser("admin");

  return (
    <AppShell nav={adminNav} title="管理员端" user={user}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-clay">
            New Exam
          </p>
          <h1 className="mt-2 text-2xl font-black">新建模拟考试</h1>
        </div>
        <Link className="btn btn-secondary" href="/admin/exams">
          返回考试管理
        </Link>
      </div>
      <ExamFormClient mode="create" />
    </AppShell>
  );
}
