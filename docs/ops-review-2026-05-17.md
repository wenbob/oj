# 2026-05-17 模拟考试切题状态修复记录

本文记录 2026-05-17 对线上 OJ 平台模拟考试答题页的切题状态修复。文档不记录任何真实管理员密码、服务器密码、Token 或 `.env` 内容。

## 问题现象

学生在模拟考试答题页点击左侧不同题目时，右侧编辑器和提交结果区域可能继续显示上一道题的代码或评测结果。

典型表现：

- 第 1 题写过的代码在切换到第 2 题后仍显示。
- 某题提交后，左侧题目状态没有立即刷新。
- 浏览器手动刷新后状态才恢复正常。

## 原因

原提交组件的本地草稿 key 只按题目区分：

```text
oj-code-problem-${problemId}
```

这个 key 对日常刷题可用，但在模拟考试答题页中不够明确。考试页还需要在切题时强制刷新 Monaco Editor 的内部模型，并在提交成功后刷新服务端渲染的左侧题目状态。

## 修复内容

修改文件：

```text
src/components/ProblemSubmitForm.tsx
src/app/student/exams/[id]/take/page.tsx
```

关键调整：

- 考试草稿改为按 `examId + problemId` 保存。
- 日常刷题草稿仍使用原来的 `oj-code-problem-${problemId}`。
- Monaco Editor 增加基于草稿 key 的 `key`，切换题目时强制重建编辑器实例。
- 考试答题页给提交组件增加按 `examId + problemId + fromSubmission` 区分的 `key`。
- 考试提交成功后调用 `router.refresh()`，让左侧题目状态使用最新提交结果重新渲染。

当前草稿 key：

```text
日常刷题：oj-code-problem-${problemId}
模拟考试：oj-code-exam-${examId}-problem-${problemId}
```

## 部署方式

本次线上更新只覆盖两个代码文件，不替换项目目录，不执行 `seed`，不重建数据库。

部署前已备份：

- SQLite 数据库 `/www/oj/prisma/prod.db`
- 旧版 `ProblemSubmitForm.tsx`
- 旧版考试答题页 `page.tsx`

部署后执行：

```bash
npm run build
pm2 restart oj --update-env
curl http://127.0.0.1:3000/api/health
```

健康检查返回：

```json
{"ok":true,"database":"ok","judgeMode":"docker"}
```

## 验收点

- 在同一场考试中，不同题目的代码草稿互不覆盖。
- 切换左侧题目后，右侧 Monaco Editor 显示当前题目的代码。
- 题目提交成功后，左侧对应题目的状态刷新为最新评测状态。
- 日常刷题页面的草稿保存逻辑不受影响。

## 注意事项

修复前浏览器中已经保存过的旧日常草稿不会自动迁移到新的考试草稿 key。考试页会从新的按考试隔离的 key 开始保存，避免旧草稿继续污染不同考试题目。

## 同日补充：考试编辑页分类多选添加题目

2026-05-17 继续优化管理员考试编辑页：

- 在“添加已有题目”区域增加分类按钮。
- 点击分类后展示该分类下可加入考试的题目。
- 搜索题名可以和分类筛选同时使用。
- 搜索结果支持单独勾选题目。
- 支持“全选当前结果”。
- 支持“添加选中题目”，一次性把多道题加入考试。
- 已在考试中的题目会标记为“已在考试中”，不能重复加入。

涉及文件：

```text
src/app/admin/exams/[id]/edit/page.tsx
src/app/admin/exams/exam-edit-client.tsx
src/app/api/admin/problems/search/route.ts
src/app/api/admin/exams/[id]/problems/route.ts
```

运维注意：在 2 核 2GB 服务器上，如果直接在 `/www/oj` 线上目录执行 `npm run build`，建议先 `pm2 stop oj`，构建完成后再 `pm2 restart oj --update-env`。否则构建过程可能短时间打满资源，导致 SSH 或 HTTP 健康检查超时。
