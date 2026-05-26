"use client";

import Link from "next/link";
import { FileUp, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { FormEvent, useState } from "react";
import type { PaginationMeta } from "@/lib/pagination";

type TestCaseForm = {
  id?: number;
  input: string;
  output: string;
  isSample: boolean;
};

type ProblemItem = {
  id: number;
  title: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
  sampleInput: string;
  sampleOutput: string;
  dataRange: string;
  difficulty: string;
  category: string;
  testCases: TestCaseForm[];
  submissions?: number;
  _count?: { submissions: number };
};

type ProblemForm = Omit<ProblemItem, "id" | "submissions" | "_count">;

const blankForm: ProblemForm = {
  title: "",
  description: "",
  inputDescription: "",
  outputDescription: "",
  sampleInput: "",
  sampleOutput: "",
  dataRange: "",
  difficulty: "入门",
  category: "基础语法",
  testCases: [
    { input: "", output: "", isSample: true },
    { input: "", output: "", isSample: true },
  ],
};

export function ProblemManager({
  categories,
  initialCategory,
  initialPagination,
  initialProblems,
}: {
  categories: string[];
  initialCategory: string;
  initialPagination: PaginationMeta;
  initialProblems: ProblemItem[];
}) {
  const [categoryOptions, setCategoryOptions] = useState(categories);
  const [problems, setProblems] = useState(initialProblems);
  const [pagination, setPagination] = useState(initialPagination);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [form, setForm] = useState<ProblemForm>(blankForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const allCurrentPageSelected =
    problems.length > 0 && problems.every((problem) => selectedIds.includes(problem.id));

  async function reload(category = selectedCategory, page = pagination.page) {
    const query = new URLSearchParams();
    if (category) query.set("category", category);
    query.set("page", String(page));
    query.set("pageSize", String(pagination.pageSize));
    const response = await fetch(`/api/admin/problems?${query}`);
    const data = await response.json();
    if (response.ok) {
      const nextProblems: ProblemItem[] = data.items ?? data.problems ?? [];
      setProblems(nextProblems);
      setSelectedIds([]);
      setPagination({
        total: data.total ?? nextProblems.length,
        page: data.page ?? page,
        pageSize: data.pageSize ?? pagination.pageSize,
        totalPages: data.totalPages ?? 1,
      });
      setCategoryOptions((current) =>
        Array.from(
          new Set([
            ...current,
            ...nextProblems.map((problem) => problem.category).filter(Boolean),
          ]),
        ),
      );
    }
  }

  async function selectCategory(category: string) {
    setSelectedCategory(category);
    setMessage("");
    setError("");
    window.history.pushState(
      null,
      "",
      category
        ? `/admin/problems?category=${encodeURIComponent(category)}`
        : "/admin/problems",
    );
    await reload(category, 1);
  }

  async function goPage(page: number) {
    const query = new URLSearchParams();
    setMessage("");
    setError("");
    if (selectedCategory) query.set("category", selectedCategory);
    query.set("page", String(page));
    query.set("pageSize", String(pagination.pageSize));
    window.history.pushState(null, "", `/admin/problems?${query}`);
    await reload(selectedCategory, page);
  }

  function updateField<K extends keyof ProblemForm>(key: K, value: ProblemForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateTestCase(index: number, patch: Partial<TestCaseForm>) {
    setForm((current) => ({
      ...current,
      testCases: current.testCases.map((testCase, currentIndex) =>
        currentIndex === index ? { ...testCase, ...patch } : testCase,
      ),
    }));
  }

  function editProblem(problem: ProblemItem) {
    setEditingId(problem.id);
    setError("");
    setMessage("");
    setForm({
      title: problem.title,
      description: problem.description,
      inputDescription: problem.inputDescription,
      outputDescription: problem.outputDescription,
      sampleInput: problem.sampleInput,
      sampleOutput: problem.sampleOutput,
      dataRange: problem.dataRange ?? "",
      difficulty: problem.difficulty,
      category: problem.category,
      testCases: problem.testCases.length
        ? problem.testCases.map((item) => ({
            id: item.id,
            input: item.input,
            output: item.output,
            isSample: item.isSample,
          }))
        : [{ input: problem.sampleInput, output: problem.sampleOutput, isSample: true }],
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(blankForm);
    setError("");
    setMessage("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateProblemForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setPending(true);
    setError("");
    setMessage("");

    const endpoint = editingId
      ? `/api/admin/problems/${editingId}`
      : "/api/admin/problems";
    const response = await fetch(endpoint, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(data.error ?? "保存失败");
      return;
    }

    setCategoryOptions((current) =>
      form.category ? Array.from(new Set([...current, form.category])) : current,
    );
    const successMessage = editingId ? "题目已更新" : "题目已创建";
    resetForm();
    setMessage(successMessage);
    await reload(selectedCategory, editingId ? pagination.page : 1);
  }

  function toggleProblem(problemId: number) {
    setSelectedIds((current) =>
      current.includes(problemId)
        ? current.filter((id) => id !== problemId)
        : [...current, problemId],
    );
  }

  function toggleCurrentPage() {
    if (allCurrentPageSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(problems.map((problem) => problem.id));
  }

  async function deleteProblem(problem: ProblemItem) {
    if (
      !confirm(
        `确定要删除题目《${problem.title}》吗？该操作会删除相关测试点和提交记录，无法恢复。`,
      )
    ) {
      return;
    }
    setMessage("");
    setError("");
    const response = await fetch(`/api/admin/problems/${problem.id}`, { method: "DELETE" });
    if (response.ok) {
      setMessage("已删除 1 道题");
      await reload();
    }
  }

  async function bulkDeleteProblems() {
    if (selectedIds.length === 0) return;

    const selectedProblems = problems.filter((problem) => selectedIds.includes(problem.id));
    const confirmText =
      selectedIds.length === 1 && selectedProblems[0]
        ? `确定要删除题目《${selectedProblems[0].title}》吗？该操作无法恢复。`
        : `确定要删除选中的 ${selectedIds.length} 道题吗？该操作会删除这些题目的测试点、提交记录以及相关考试题目关联，无法恢复。`;

    if (!confirm(confirmText)) return;

    setPending(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/admin/problems/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemIds: selectedIds }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);

    if (!response.ok) {
      setError(data.error ?? "批量删除失败");
      return;
    }

    setMessage(`已删除 ${data.deletedCount ?? 0} 道题`);
    setSelectedIds([]);
    await reload(selectedCategory, pagination.page);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_520px]">
      <section className="surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-ink-950/10 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-clay">
              Problem Admin
            </p>
            <h1 className="mt-2 text-2xl font-black">题目管理</h1>
            <p className="mt-2 text-sm font-semibold text-ink-600">
              当前 {problems.length} 道题
            </p>
          </div>
          <Link className="btn btn-primary" href="/admin/problems/import">
            <FileUp size={16} />
            导入 Markdown 题目
          </Link>
        </div>
        <div className="border-b border-ink-950/10 p-5">
          <div className="flex flex-wrap gap-2">
            <CategoryButton
              active={!selectedCategory}
              onClick={() => selectCategory("")}
            >
              全部
            </CategoryButton>
            {categoryOptions.map((category) => (
              <CategoryButton
                active={selectedCategory === category}
                key={category}
                onClick={() => selectCategory(category)}
              >
                {category}
              </CategoryButton>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-950/10 bg-white/45 p-5">
          <label className="inline-flex items-center gap-2 text-sm font-black text-ink-800">
            <input
              checked={allCurrentPageSelected}
              disabled={problems.length === 0}
              onChange={toggleCurrentPage}
              type="checkbox"
            />
            全选当前页
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-ink-600">
              已选择 {selectedIds.length} 道题
            </span>
            <button
              className="btn btn-danger px-3 py-2"
              disabled={selectedIds.length === 0 || pending}
              onClick={bulkDeleteProblems}
              type="button"
            >
              <Trash2 size={15} />
              批量删除
            </button>
          </div>
        </div>
        {message ? (
          <p className="mx-5 mt-4 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            {message}
          </p>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr className="border-b border-ink-950/10 bg-white/55 text-left">
                <th className="table-head px-5 py-3">选择</th>
                <th className="table-head px-5 py-3">标题</th>
                <th className="table-head px-5 py-3">难度</th>
                <th className="table-head px-5 py-3">分类</th>
                <th className="table-head px-5 py-3">测试点</th>
                <th className="table-head px-5 py-3">提交</th>
                <th className="table-head px-5 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem) => (
                <tr className="border-b border-ink-950/10" key={problem.id}>
                  <td className="px-5 py-4">
                    <input
                      aria-label={`选择题目 ${problem.title}`}
                      checked={selectedIds.includes(problem.id)}
                      onChange={() => toggleProblem(problem.id)}
                      type="checkbox"
                    />
                  </td>
                  <td className="px-5 py-4 font-black">{problem.title}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-ink-700">
                    {problem.difficulty}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-ink-700">
                    {problem.category}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-ink-700">
                    {problem.testCases.length}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-ink-700">
                    <Link
                      className="font-black text-steel underline-offset-4 hover:text-clay hover:underline"
                      href={`/admin/submissions?problemId=${problem.id}`}
                      title={`查看《${problem.title}》的提交记录`}
                    >
                      {problem.submissions ?? problem._count?.submissions ?? 0}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        className="btn btn-secondary px-3 py-2"
                        onClick={() => editProblem(problem)}
                        type="button"
                      >
                        <Pencil size={15} />
                        编辑
                      </button>
                      <button
                        className="btn btn-danger px-3 py-2"
                        onClick={() => deleteProblem(problem)}
                        type="button"
                      >
                        <Trash2 size={15} />
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {problems.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-12 text-center text-sm font-semibold text-ink-600"
                    colSpan={7}
                  >
                    当前分类下还没有题目。
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-950/10 p-5 text-sm font-semibold text-ink-700">
          <span>
            共 {pagination.total} 条，每页 {pagination.pageSize} 条，第 {pagination.page} / {pagination.totalPages} 页
          </span>
          <div className="flex gap-2">
            <button
              className="btn btn-secondary px-3 py-2"
              disabled={pagination.page <= 1}
              onClick={() => goPage(pagination.page - 1)}
              type="button"
            >
              上一页
            </button>
            <button
              className="btn btn-secondary px-3 py-2"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => goPage(pagination.page + 1)}
              type="button"
            >
              下一页
            </button>
          </div>
        </div>
      </section>

      <form className="surface p-5" onSubmit={save}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">{editingId ? "编辑题目" : "新增题目"}</h2>
          {editingId ? (
            <button className="btn btn-secondary px-3 py-2" onClick={resetForm} type="button">
              <X size={15} />
              取消
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4">
          <Input label="标题" value={form.title} onChange={(value) => updateField("title", value)} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="难度" value={form.difficulty} onChange={(value) => updateField("difficulty", value)} />
            <Input label="分类" value={form.category} onChange={(value) => updateField("category", value)} />
          </div>
          <Textarea label="题目描述" value={form.description} onChange={(value) => updateField("description", value)} />
          <Textarea label="输入格式" value={form.inputDescription} onChange={(value) => updateField("inputDescription", value)} />
          <Textarea label="输出格式" value={form.outputDescription} onChange={(value) => updateField("outputDescription", value)} />
          <Textarea label="样例输入" value={form.sampleInput} onChange={(value) => updateField("sampleInput", value)} />
          <Textarea label="样例输出" value={form.sampleOutput} onChange={(value) => updateField("sampleOutput", value)} />
          <Textarea label="数据范围" value={form.dataRange} onChange={(value) => updateField("dataRange", value)} />
        </div>

        <div className="mt-6 border-t border-ink-950/10 pt-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black">测试点列表</h3>
            <button
              className="btn btn-secondary px-3 py-2"
              onClick={() =>
                updateField("testCases", [...form.testCases, { input: "", output: "", isSample: false }])
              }
              type="button"
            >
              <Plus size={15} />
              添加
            </button>
          </div>
          <div className="mt-4 grid gap-4">
            {form.testCases.map((testCase, index) => (
              <div className="border border-ink-950/10 bg-white/60 p-3" key={index}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-sm font-bold">
                    <input
                      checked={testCase.isSample}
                      type="checkbox"
                      onChange={(event) => updateTestCase(index, { isSample: event.target.checked })}
                    />
                    样例
                  </label>
                  <button
                    className="btn btn-danger px-3 py-2"
                    onClick={() =>
                      updateField(
                        "testCases",
                        form.testCases.filter((_, currentIndex) => currentIndex !== index),
                      )
                    }
                    type="button"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <Textarea label={`输入 ${index + 1}`} value={testCase.input} onChange={(value) => updateTestCase(index, { input: value })} />
                <div className="mt-3">
                  <Textarea label={`输出 ${index + 1}`} value={testCase.output} onChange={(value) => updateTestCase(index, { output: value })} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error ? (
          <p className="mt-4 border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
            {error}
          </p>
        ) : null}
        <button className="btn btn-primary mt-5 w-full" disabled={pending} type="submit">
          <Save size={16} />
          {pending ? "保存中" : "保存题目"}
        </button>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-ink-800">
      {label}
      <input className="field" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function validateProblemForm(form: ProblemForm) {
  if (!form.title.trim()) return "标题不能为空";
  if (!form.difficulty.trim()) return "难度不能为空";
  if (!form.category.trim()) return "分类不能为空";
  if (!form.description.trim()) return "题目描述不能为空";
  if (!form.inputDescription.trim()) return "输入格式不能为空";
  if (!form.outputDescription.trim()) return "输出格式不能为空";
  if (!form.sampleInput.trim()) return "样例输入不能为空";
  if (!form.sampleOutput.trim()) return "样例输出不能为空";
  const nonEmptyCases = form.testCases.filter(
    (testCase) => testCase.input.trim() || testCase.output.trim(),
  );
  if (nonEmptyCases.length === 0) return "至少需要添加测试点";
  if (nonEmptyCases.some((testCase) => !testCase.input.trim() || !testCase.output.trim())) {
    return "测试点输入和输出不能为空";
  }
  if (nonEmptyCases.filter((testCase) => testCase.isSample).length < 2) {
    return "题目至少需要两组样例";
  }
  return "";
}

function CategoryButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`border px-3 py-2 text-sm font-black ${
        active
          ? "border-ink-950 bg-ink-950 text-white"
          : "border-ink-950/10 bg-white/65 text-ink-800 hover:border-steel hover:text-steel"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-ink-800">
      {label}
      <textarea className="field min-h-24 resize-y" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
