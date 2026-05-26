import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExamListClient } from "./exam-list-client";

const adminNav = [
  { href: "/admin", label: "后台首页" },
  { href: "/admin/practice", label: "题目练习" },
  { href: "/admin/problems", label: "题目管理" },
  { href: "/admin/exams", label: "模拟考试" },
  { href: "/admin/users", label: "用户管理" },
  { href: "/admin/submissions", label: "日常提交" },
  { href: "/admin/exam-submissions", label: "考试提交" },
];

export default async function AdminExamsPage() {
  const user = await requirePageUser("admin");
  const exams = await prisma.exam.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { problems: true } },
    },
  });
  const clientExams = exams.map((exam) => ({
    ...exam,
    createdAt: exam.createdAt.toISOString(),
    updatedAt: exam.updatedAt.toISOString(),
  }));

  return (
    <AppShell nav={adminNav} title="管理员端" user={user}>
      <section className="surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-950/10 p-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-clay">
              Exam Admin
            </p>
            <h1 className="mt-2 text-2xl font-black">模拟考试管理</h1>
          </div>
          <Link className="btn btn-primary" href="/admin/exams/new">
            <Plus size={16} />
            新建考试
          </Link>
        </div>
        <ExamListClient exams={clientExams} />
      </section>
    </AppShell>
  );
}
