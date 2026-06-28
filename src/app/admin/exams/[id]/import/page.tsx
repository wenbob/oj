import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requirePageUser } from "@/lib/auth";
import { normalizeProblemType } from "@/lib/objectiveProblem";
import { prisma } from "@/lib/prisma";
import { ExamImportClient } from "./exam-import-client";

const adminNav = [
  { href: "/admin", label: "后台首页" },
  { href: "/admin/practice", label: "题目练习" },
  { href: "/admin/problems", label: "题目管理" },
  { href: "/admin/exams", label: "模拟考试" },
  { href: "/admin/users", label: "用户管理" },
  { href: "/admin/submissions", label: "日常提交" },
  { href: "/admin/exam-submissions", label: "考试提交" },
];

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminExamImportPage({ params }: PageProps) {
  const user = await requirePageUser("admin");
  const { id } = await params;
  const examId = Number(id);
  if (!Number.isInteger(examId)) notFound();

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, title: true, examType: true },
  });
  if (!exam) notFound();

  return (
    <AppShell nav={adminNav} title="管理员端" user={user}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-clay">
            Import To Exam
          </p>
          <h1 className="mt-2 text-2xl font-black">
            导入题目到「{exam.title}」
          </h1>
        </div>
        <Link className="btn btn-secondary" href={`/admin/exams/${exam.id}/edit`}>
          返回考试编辑
        </Link>
      </div>
      <ExamImportClient
        examId={exam.id}
        examType={normalizeProblemType(exam.examType)}
      />
    </AppShell>
  );
}
