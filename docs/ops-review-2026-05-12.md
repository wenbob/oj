# 2026-05-12 单文件热更新记录

本文记录 2026-05-12 对线上 OJ 平台进行的一次小范围热更新。文档不记录任何真实管理员密码、服务器密码、Token 或 `.env` 内容。

## 1. 更新内容

本次只更新提交结果展示区域：

- 修改文件：`src/components/ProblemSubmitForm.tsx`
- 功能：提交后在结果卡片中直接展示“程序输出”
- 展示规则：优先显示第一个未通过测试点的用户输出；如果全部通过，则显示第一个测试点输出；如果程序没有输出，则显示“（无输出）”

本次没有修改 Judge、提交接口、数据库结构、用户数据、题目数据或提交记录。

## 2. 线上操作流程

线上采用单文件补丁方式部署，避免覆盖重要数据。

执行前先备份：

```bash
mkdir -p /www/backups
cp /www/oj/prisma/prod.db /www/backups/prod-$(date +%Y%m%d-%H%M%S).db
cp /www/oj/src/components/ProblemSubmitForm.tsx /www/backups/ProblemSubmitForm-$(date +%Y%m%d-%H%M%S).tsx
```

然后上传单文件到：

```text
/www/oj/src/components/ProblemSubmitForm.tsx
```

确认文件包含新文案：

```bash
grep -n '程序输出' /www/oj/src/components/ProblemSubmitForm.tsx
```

重新构建并重启：

```bash
cd /www/oj
npm run build
pm2 restart oj --update-env
curl http://127.0.0.1:3000/api/health
```

健康检查返回 `ok: true` 且 `judgeMode` 为 `docker` 后，更新完成。

## 3. 数据安全结论

本次更新不会触碰线上 SQLite 数据库内容。重要数据仍保存在：

```text
/www/oj/prisma/prod.db
```

本次明确没有执行：

```bash
npm run seed
npm run db:init
```

后续小范围 UI 修复也应优先采用“备份数据库 -> 备份旧文件 -> 上传单文件 -> build -> restart -> health check”的流程。
