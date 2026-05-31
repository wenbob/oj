# OJ 项目协作规则

## 项目概览

这是一个 Next.js App Router + Prisma + SQLite 的 C++ 在线 OJ。线上服务位于 `/www/oj`，PM2 进程名为 `oj`，健康检查为 `/api/health`，Judge 使用 Docker。

## 数据安全红线

- 生产数据库为 `/www/oj/prisma/prod.db`。
- 常规代码发布前必须先备份生产数据库到 `/www/backups`，并确认备份文件存在。
- 常规发布禁止执行 `npm run seed` 或 `npm run db:init`。
- 不要提交 `.env`、数据库文件、备份文件、`.next`、`node_modules` 或压缩包。
- 删除旧备份前，先确认要保留的最新备份路径真实存在。

## 低内存服务器发布

线上服务器为 2 核 CPU、2GB 内存、4GB swap。即使只修改一个页面，Next.js 仍会全量构建。不要在 PM2 运行时直接执行普通 `npm run build`。

```bash
cd /www/oj
mkdir -p /www/backups
cp /www/oj/prisma/prod.db /www/backups/prod-$(date +%Y%m%d-%H%M%S).db
pm2 stop oj
NEXT_TELEMETRY_DISABLED=1 NEXT_PRIVATE_BUILD_WORKER_COUNT=1 NODE_OPTIONS='--max-old-space-size=768' npm run build
pm2 restart oj --update-env
curl http://127.0.0.1:3000/api/health
```

构建日志应包含：

```text
Collecting page data using 1 worker
Generating static pages using 1 worker
```

## 本地质量检查

```bash
npm run test
npx tsc --noEmit
npm run lint
npm run build
```

当前仓库存在一个历史 lint 问题：`src/components/ProblemSubmitForm.tsx` 中 React Hooks 规则会拒绝 effect 内同步 `setState`。不要把它误判为无关页面改动引入的新回归。

## 深入文档

| 文档 | 用途 |
| --- | --- |
| `README.md` | 功能概览、本地开发和上线检查清单 |
| `docs/deploy.md` | 线上部署、更新、备份和容量建议 |
| `docs/admin-guide.md` | 管理员使用和运维手册 |
| `docs/student-guide.md` | 学生使用说明 |
| `docs/ops-review-2026-05-29.md` | 低内存构建事故和后续发布记录 |
| `docs/ops-review-2026-05-31.md` | 学生复制题面和管理员考试练习模式发布记录 |
