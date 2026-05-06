import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SubmissionDetailView } from "@/components/SubmissionDetailView";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export default async function AdminSubmissionDetailPage({ params }: PageProps) {
  const user = await requirePageUser("admin");
  const { id } = await params;
  const submissionId = Number(id);
  if (!Number.isInteger(submissionId)) notFound();

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      exam: { select: { id: true, title: true } },
      user: { select: { id: true, username: true } },
      problem: { select: { id: true, title: true } },
      caseResults: { orderBy: { caseIndex: "asc" } },
    },
  });

  if (!submission) notFound();

  const problemHref = `/admin/practice/problems/${submission.problem.id}`;

  return (
    <AppShell nav={adminNav} title="管理员端" user={user}>
      <SubmissionDetailView
        problemHref={problemHref}
        submission={submission}
      />
    </AppShell>
  );
}
