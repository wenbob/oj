# 2026-06-28 选择判断题型与 standalone 发布记录

## 本次变更

- 新增选择判断题型，`Problem.problemType` 和 `Exam.examType` 支持 `programming`、`objective`。
- 考试只能加入与自身题型一致的题目，题目搜索、Markdown 导入、添加题目和发布接口都会校验。
- 客观题答案保存在 `Problem.objectiveItems`，学生题目接口和考试答题接口不返回 `answer` 字段。
- 管理员题目练习页和管理员考试练习页用于校题，可展示客观题标准答案。
- 选择判断考试通过“提交答案”二次确认后交卷；单大题选择判断考试隐藏左侧题目导航，多题时保留导航。
- 选择判断 Markdown 模板统一为单行选项格式：`A. 选项内容`。题干可用代码块，选项中的代码或输出使用行内代码。

## 发布方式

本次没有在 2 核 2GB 线上服务器执行普通构建。发布采用本地 Linux Docker 环境生成 Next.js standalone 产物，再上传服务器切换目录。

关键原因：

- Windows 本机构建出来的 `.next/standalone/node_modules` 可能包含 Windows 原生包，不能直接作为 Ubuntu 服务器产物使用。
- 线上服务器内存较小，Next.js 全量构建容易和线上 Node 进程争抢内存。
- Next.js standalone 服务本身不会自动读取项目 `.env`，需要通过项目启动脚本预加载。
- Next.js standalone 运行目录不会自动包含外层 `.next/static` 和 `public`；发布包必须把它们复制到 `.next/standalone/.next/static` 和 `.next/standalone/public`。

当前启动脚本为：

```json
"start": "npm run check:env && node --import ./scripts/load-env.mjs .next/standalone/server.js"
```

`scripts/load-env.mjs` 会读取当前工作目录下的 `.env`，只补充尚未存在的环境变量，然后再启动 standalone 服务。

## 服务器切换要点

- 发布前备份 `/www/oj/prisma/prod.db` 到 `/www/backups`，并确认备份文件存在。
- 发布包不得包含 `.env`、`*.db`、SQLite 派生文件、`.next/cache`、仓库压缩包或本地 `node_modules` 根目录。
- 发布包必须包含 `.next/standalone/.next/static` 和 `.next/standalone/public`，否则浏览器会拿不到 CSS/JS。
- 在 `/www/oj-new` 中解包后，复制线上 `/www/oj/.env` 和最新生产数据库副本。
- 复用服务器现有 `/www/oj/node_modules`；如果依赖清单发生变化，则在 `/www/oj-new` 重新执行 `npm ci`。
- 先对 `/www/oj-new` 执行 `npm run check:env` 和 `npm run db:deploy`。
- 正式切换前可临时用非 3000 端口启动 `/www/oj-new` 做 `/api/health` 预检。
- 健康检查要设置足够重试窗口；2 秒以内未连上可能只是服务尚未完全启动，不能直接判断版本不可用。
- 切换后执行 `pm2 restart oj --update-env`，并检查本地回环和公网 `/api/health`。
- 切换后还要抽查登录页引用的 `_next/static` CSS/JS 是否返回 200；只检查 `/api/health` 不足以发现前端静态资源缺失。

## 静态资源修复

`2026-06-28` 当次发布后，登录页一度出现无样式、登录无反应。排查结果：

- `/api/health` 正常，PM2 online。
- `/login` 返回 200，但页面引用的 `_next/static` CSS/JS 返回 404。
- 服务器存在 `/www/oj/.next/static`，但缺少 `/www/oj/.next/standalone/.next/static` 和 `/www/oj/.next/standalone/public`。

已在线修复：

```bash
cd /www/oj
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static .next/standalone/public
cp -a .next/static .next/standalone/.next/static
cp -a public .next/standalone/public
pm2 restart oj --update-env
```

修复后本机回环和公网访问的登录页 CSS/JS 均返回 200。

## GitHub 同步

功能提交：

```text
a56d5b3 Add objective exam mode
```

两个远程仓库的 `main` 分支均已同步：

```text
origin   https://github.com/wenbob/OJ.git
oj2026   https://github.com/wenbob/2026-OJC.git
```

## 维护注意

- 学生端不得展示客观题标准答案；只允许管理员校题页面展示。
- 客观题提交不进入 Docker Judge，逐小题结果写入 `SubmissionCaseResult`。
- `ExamProblem.score` 使用客观题小题分值总和，小题分值必须是正整数。
- 不要重新支持 `A.` 后接代码块的选项格式；这会破坏当前导入约定。
- 不要绕过 `npm run start` 直接裸跑 standalone server，否则生产 `.env` 可能不会加载。
