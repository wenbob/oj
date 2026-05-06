import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExamCountdown } from "@/components/ExamCountdown";
import { ExamSubmitButton } from "@/components/ExamSubmitButton";
import { ProblemSamples } from "@/components/ProblemSamples";
import { ProblemSubmitForm } from "@/components/ProblemSubmitForm";
import { StatusBadge } from "@/components/StatusBadge";
import { AppShell } from "@/components/AppShell";
import { requirePageUser } from "@/lib/auth";
import { expireExamRecordIfNeeded, getExamEndAt } from "@/lib/examScoring";
import { formatDate } from "@/lib/format";
import { getDisplaySamples } from "@/lib/problemSamples";
import { prisma } from "@/lib/prisma";
import { getDefaultCppTemplate } from "@/lib/settings";

const studentNav = [
  { href: "/student", label: "首页" },
  { href: "/student/problems", label: "日常刷题" },
  { href: "/student/exams", label: "模拟考试" },
  { href: "/student/submissions", label: "日常提交" },
  { href: "/student/exam-submissions", label: "考试提交" },
];

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    fromSubmission?: string | string[];
    problemId?: string | string[];
  }>;
};

export default async function StudentExamTakePage({
  params,
  searchParams,
}: PageProps) {
  const user = await requirePageUser("student");
  const { id } = await params;
  const query = await searchParams;
  const examId = Number(id);
  const requestedProblemId = Number(
    Array.isArray(query.problemId) ? query.problemId[0] : query.problemId,
  );
  const fromSubmissionValue = Array.isArray(query.fromSubmission)
    ? query.fromSubmission[0]
    : query.fromSubmission;
  const fromSubmissionId = fromSubmissionValue
    ? Number(fromSubmissionValue)
    : undefined;
  if (!Number.isInteger(examId)) notFound();

  const [exam, checkedRecord] = await Promise.all([
    prisma.exam.findUnique({
      where: { id: examId },
      include: {
        problems: {
          include: {
            problem: {
              include: {
                testCases: {
                  where: { isSample: true },
                  orderBy: { id: "asc" },
                },
              },
            },
          },
          orderBy: [{ order: "asc" }, { id: "asc" }],
        },
      },
    }),
    expireExamRecordIfNeeded({ examId, userId: user.id }),
  ]);

  if (!exam) notFound();
  if (!checkedRecord) redirect(`/student/exams/${examId}`);
  if (checkedRecord.status !== "in_progress" || exam.status !== "published") {
    redirect(`/student/exams/${examId}/result`);
  }

  const endAt =
    getExamEndAt(checkedRecord.startedAt, exam.durationMin)?.toISOString() ??
    null;

  const problemIds = exam.problems.map((item) => item.problemId);
  const [latestSubmissions, defaultCodeTemplate] = await Promise.all([
    prisma.submission.findMany({
      where: {
        examId,
        userId: user.id,
        submissionType: "exam",
        problemId: { in: problemIds },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        problemId: true,
        status: true,
        passedCount: true,
        totalCount: true,
        runtimeMs: true,
        createdAt: true,
      },
    }),
    getDefaultCppTemplate(),
  ]);

  const latestByProblem = new Map<number, (typeof latestSubmissions)[number]>();
  latestSubmissions.forEach((submission) => {
    if (!latestByProblem.has(submission.problemId)) {
      latestByProblem.set(submission.problemId, submission);
    }
  });

  const selectedItem =
    exam.problems.find((item) => item.problemId === requestedProblemId) ??
    exam.problems[0];
  const selectedProblem = selectedItem?.problem;
  const selectedLatest = selectedProblem
    ? latestByProblem.get(selectedProblem.id)
    : null;
  const samples = selectedProblem
    ? getDisplaySamples({
        sampleInput: selectedProblem.sampleInput,
        sampleOutput: selectedProblem.sampleOutput,
        testCases: selectedProblem.testCases.map((testCase) => ({
          id: testCase.id,
          input: testCase.input,
          output: testCase.output,
        })),
      })
    : [];

  return (
    <AppShell nav={studentNav} title="学生端" user={user}>
      <section className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-clay">
            Taking Exam
          </p>
          <h1 className="mt-2 text-2xl font-black">{exam.title}</h1>
          <p className="mt-2 text-sm font-semibold text-ink-600">
            {exam.durationMin ? `考试时长：${exam.durationMin} 分钟` : "不限时"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExamCountdown endAt={endAt} examId={exam.id} />
          <ExamSubmitButton examId={exam.id} />
          <Link className="btn btn-secondary" href={`/student/exams/${exam.id}`}>
            返回考试详情
          </Link>
        </div>
      </section>

      {selectedProblem ? (
        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="surface overflow-hidden">
            <div className="border-b border-ink-950/10 p-4">
              <h2 className="font-black">考试题目</h2>
            </div>
            <div className="divide-y divide-ink-950/10">
              {exam.problems.map((item, index) => {
                const latest = latestByProblem.get(item.problemId);
                const active = item.problemId === selectedProblem.id;
                return (
                  <Link
                    className={`block p-4 hover:bg-white/70 ${
                      active ? "bg-white/75" : ""
                    }`}
                    href={`/student/exams/${exam.id}/take?problemId=${item.problemId}`}
                    key={item.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-ink-500">
                          第 {index + 1} 题
                        </p>
                        <h3 className="mt-1 font-black">{item.problem.title}</h3>
                        <p className="mt-1 text-xs font-bold text-ink-600">
                          {item.problem.category || "未分类"} / {item.score} 分
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      {latest ? (
                        <StatusBadge status={latest.status} />
                      ) : (
                        <span className="inline-flex border border-ink-950/10 bg-white/70 px-2.5 py-1 text-xs font-bold text-ink-600">
                          未提交
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </aside>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
            <article className="surface p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-black">{selectedProblem.title}</h2>
                <span className="border border-ink-950/10 bg-white/65 px-2.5 py-1 text-xs font-bold text-ink-700">
                  {selectedProblem.difficulty}
                </span>
                <span className="border border-ink-950/10 bg-white/65 px-2.5 py-1 text-xs font-bold text-ink-700">
                  {selectedProblem.category || "未分类"}
                </span>
              </div>
              <ProblemSection title="题目描述" value={selectedProblem.description} />
              <ProblemSection title="输入格式" value={selectedProblem.inputDescription} />
              <ProblemSection title="输出格式" value={selectedProblem.outputDescription} />
              <ProblemSamples samples={samples} />
              <ProblemSection title="数据范围" value={selectedProblem.dataRange || "暂无"} />
            </article>

            <aside className="grid content-start gap-4">
              {selectedLatest ? (
                <section className="surface p-5">
                  <h2 className="text-lg font-black">本题最近一次考试提交</h2>
                  <div className="mt-3 grid gap-2 text-sm font-semibold text-ink-700">
                    <StatusBadge status={selectedLatest.status} />
                    <span>
                      {selectedLatest.passedCount}/{selectedLatest.totalCount} 测试点
                    </span>
                    <span>{selectedLatest.runtimeMs}ms</span>
                    <span>{formatDate(selectedLatest.createdAt)}</span>
                    <Link
                      className="btn btn-secondary mt-2 w-full"
                      href={`/student/submissions/${selectedLatest.id}`}
                    >
                      查看提交详情
                    </Link>
                  </div>
                </section>
              ) : null}
              <ProblemSubmitForm
                defaultCodeTemplate={defaultCodeTemplate}
                detailHrefBase="/student/submissions"
                examId={exam.id}
                examEndsAt={endAt}
                fromSubmissionId={
                  Number.isInteger(fromSubmissionId) ? fromSubmissionId : undefined
                }
                problemId={selectedProblem.id}
              />
            </aside>
          </div>
        </div>
      ) : (
        <section className="surface p-10 text-center text-sm font-semibold text-ink-600">
          该考试暂未添加题目。
        </section>
      )}
    </AppShell>
  );
}

function ProblemSection({ title, value }: { title: string; value: string }) {
  return (
    <section className="mt-8">
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 whitespace-pre-wrap leading-7 text-ink-800">{value}</p>
    </section>
  );
}
