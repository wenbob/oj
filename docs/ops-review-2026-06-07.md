# 2026-06-07 Monaco 代码提示关闭上线记录

## 本次变更

- 全站共用 Monaco 编辑器关闭自动代码提示。
- 关闭项包括：

```text
quickSuggestions
suggestOnTriggerCharacters
acceptSuggestionOnCommitCharacter
acceptSuggestionOnEnter
tabCompletion
wordBasedSuggestions
inlineSuggest
parameterHints
```

- 保留行号、Tab 缩进、自动缩进、代码折叠、括号匹配、括号/引号自动补全和本地草稿保存。

## 影响范围

统一组件为：

```text
src/components/CodeEditor.tsx
```

因此以下页面都会关闭代码提示：

```text
/student/problems/[id]
/student/exams/[id]/take
/admin/practice/problems/[id]
/admin/exams/[id]/practice
```

本次未修改 Judge、提交接口、数据库结构、考试流程或权限逻辑。

## 本地验证

上线前本地检查结果：

```text
npx tsc --noEmit    通过
npm run test        通过，31 个测试
npm run build       通过
```

## 线上发布

上线前备份生产数据库和原组件文件：

```text
/www/backups/prod-20260607-114136-before-disable-monaco-suggestions.db
/www/backups/source-20260607-114136-disable-monaco-suggestions/CodeEditor.tsx
```

发布过程只上传单个组件文件，然后仍按低内存流程全量构建：

```bash
cd /www/oj
pm2 stop oj
NEXT_TELEMETRY_DISABLED=1 NEXT_PRIVATE_BUILD_WORKER_COUNT=1 NODE_OPTIONS='--max-old-space-size=768' npm run build
pm2 restart oj --update-env
curl http://127.0.0.1:3000/api/health
```

构建日志确认使用单 worker：

```text
Collecting page data using 1 worker
Generating static pages using 1 worker
```

上线后 `/api/health` 返回 `ok: true`，`judgeMode` 为 `docker`，PM2 进程状态为 `online`。

## GitHub 同步

功能提交：

```text
9eb7824 disable monaco editor suggestions
```

两个远程仓库的 `main` 分支均已同步：

```text
origin   https://github.com/wenbob/OJ.git
oj2026   https://github.com/wenbob/2026-OJC.git
```

## 经验结论

- Monaco 编辑器配置集中在 `CodeEditor.tsx`，关闭提示类能力时只需要改这一处。
- 即使只上传单文件，Next.js 生产环境仍需重新构建；2GB 服务器继续使用低内存构建流程。
- 教学场景下保留基础编辑能力即可，自动建议和 Tab 补全容易干扰学生独立答题。
