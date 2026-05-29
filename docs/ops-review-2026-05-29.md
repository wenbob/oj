# 2026-05-29 复制本题与低内存上线记录

## 本次变更

- 管理员题目练习详情页新增“复制本题”按钮。
- 按 Markdown 格式复制完整题面：标题、难度、分类、题目描述、输入格式、输出格式、全部样例和数据范围。
- 按钮只在管理员端 `/admin/practice/problems/[id]` 显示，学生端日常练习和考试答题页不显示。
- 不涉及数据库结构、Judge、提交记录或学生端权限变更。

## 上线过程

线上服务器规格为 2 核 CPU、2GB 内存、4GB swap。第一次直接执行默认 `npm run build` 时，Next.js 全量构建占用资源过高，导致 SSH banner 超时和 HTTP 健康检查超时。通过阿里云控制台重启 ECS 后恢复。

后续采用低内存上线方式：

```bash
cd /www/oj
pm2 stop oj
NEXT_TELEMETRY_DISABLED=1 NEXT_PRIVATE_BUILD_WORKER_COUNT=1 NODE_OPTIONS='--max-old-space-size=768' npm run build
pm2 restart oj --update-env
curl http://127.0.0.1:3000/api/health
```

构建日志中应看到：

```text
Collecting page data using 1 worker
Generating static pages using 1 worker
```

## 数据保护

上线前已备份生产数据库：

```text
/www/backups/prod-20260529-142456-before-copy-problem-button.db
```

随后清理了更早的 `/www/backups` 旧备份和临时代码备份，只保留：

```text
/www/backups/prod-20260529-142456-before-copy-problem-button.db
```

生产库仍在：

```text
/www/oj/prisma/prod.db
```

## 经验结论

- 2GB 服务器不能直接用默认 Next.js 构建流程更新线上目录。
- 小改动上线也会触发 Next.js 全量构建，不能假设“只改一个文件就只构建一个页面”。
- 线上目录构建前先 `pm2 stop oj`，并固定使用低内存构建参数。
- 任何上线前先备份 `/www/oj/prisma/prod.db`，不要运行 `npm run seed` 或 `npm run db:init`。
