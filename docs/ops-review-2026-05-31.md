# 2026-05-31 学生复制题面与管理员考试练习模式上线记录

## 本次变更

- 学生端日常练习详情页和模拟考试答题页复用“复制本题”按钮，方便转发完整 Markdown 题面。
- 管理员模拟考试列表新增“进入做题”入口。
- 新增管理员考试练习页：

```text
/admin/exams/[id]/practice
```

- 管理员可以按考试题单逐题查看题面、复制题面、编写代码和提交评测。
- 管理员练习模式不限时、不需要交卷，不创建 `ExamRecord`，提交计入日常提交记录。
- 管理员考试练习页的草稿按考试和题目隔离保存，切换题目时不会串用草稿。

## 变更边界

- 未修改数据库结构。
- 未修改 Docker Judge 和提交队列。
- 未修改学生模拟考试的倒计时、交卷和成绩统计规则。
- 未执行 `npm run seed` 或 `npm run db:init`。

## 本地验证

本地检查结果：

```text
npm run test        通过，31 个测试
npx tsc --noEmit    通过
npm run build       通过
```

`npm run lint` 仍有一个已知历史问题：

```text
src/components/ProblemSubmitForm.tsx
react-hooks/set-state-in-effect
```

该问题不是本次新增页面引入。

## 线上发布

服务器仍使用 2 核 CPU、2GB 内存、4GB swap。上线前已备份生产数据库：

```text
/www/backups/prod-20260531-091635-before-student-copy-problem.db
/www/backups/prod-20260531-135602-before-admin-exam-practice.db
```

管理员考试练习模式上线前还保留了源码备份：

```text
/www/backups/source-20260531-135602-admin-exam-practice/
```

发布过程继续使用低内存构建流程：

```bash
cd /www/oj
pm2 stop oj
NEXT_TELEMETRY_DISABLED=1 NEXT_PRIVATE_BUILD_WORKER_COUNT=1 NODE_OPTIONS='--max-old-space-size=768' npm run build
pm2 restart oj --update-env
curl http://127.0.0.1:3000/api/health
```

上线后 `/api/health` 返回 `ok: true`，`judgeMode` 为 `docker`，PM2 进程状态为 `online`。

## GitHub 同步

功能提交：

```text
06bb295 add admin exam practice mode
```

两个远程仓库的 `main` 分支均已同步：

```text
origin   https://github.com/wenbob/OJ.git
oj2026   https://github.com/wenbob/2026-OJC.git
```

## 经验结论

- 管理员题单测试应复用现有题面和 Judge 组件，但不要复用学生考试计时与交卷状态。
- 管理员考试练习提交应保持日常提交语义，避免污染考试成绩。
- 2GB 服务器上的任何 Next.js 页面改动都按全量构建风险处理，必须先停止 PM2，再使用单 worker 构建。
- 常规页面发布前只备份生产数据库，不执行破坏性初始化命令。
