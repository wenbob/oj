# 管理员使用和运维说明

这份文档给管理员和维护人员使用。内容包括题目、用户、考试、系统设置、备份、Docker Judge 检查和日常维护。

## 1. 如何登录后台

访问登录页：

```text
/login
```

使用管理员账号登录。登录成功后会进入：

```text
/admin
```

管理员首页包含：

- 题目管理
- 用户管理
- 题目练习
- 模拟考试管理
- 日常提交记录
- 考试提交记录
- 系统设置功能卡片

上线后必须修改默认管理员密码，不能继续使用 `admin123`。

管理员进入“题目练习”后，可以像学生一样打开题目详情并提交代码。题目详情页左上方提供“复制本题”按钮，会复制 Markdown 格式的完整题面，包含标题、难度、分类、题目描述、输入格式、输出格式、全部样例和数据范围，适合发给 GPT、备课或临时转发题目。学生端日常刷题详情和模拟考试答题页也提供相同按钮。

## 2. 如何新增题目

进入：

```text
/admin/problems
```

在右侧或页面表单中填写：

- 标题
- 难度
- 分类
- 题目描述
- 输入格式
- 输出格式
- 样例输入
- 样例输出
- 数据范围
- 测试点列表

要求：

- 标题不能为空。
- 难度不能为空。
- 分类不能为空。
- 题目描述、输入格式、输出格式不能为空。
- 至少需要测试点。
- 至少需要两组样例测试点。
- 测试点输入和输出不能为空。

填写后点击“保存题目”。

## 3. 如何编辑题目

进入：

```text
/admin/problems
```

题目列表中的“提交”数量是该题的日常刷题总提交次数。点击这个数字会进入：

```text
/admin/submissions?problemId=题目ID
```

进入后可以查看这道题的所有日常刷题提交记录。

在题目列表中找到题目，点击：

```text
编辑
```

修改表单内容后保存。

如果修改了分类，题目会移动到新的分类下，学生端和管理员端分类筛选也会自动更新。

## 4. 如何批量删除题目

进入：

```text
/admin/problems
```

使用方式：

1. 在题目列表左侧勾选要删除的题目。
2. 可以点击“全选当前页”。
3. 确认“已选择 N 道题”数量正确。
4. 点击“批量删除”。
5. 浏览器会弹出二次确认。
6. 确认后删除。

注意：

- 只会全选当前页，不会跨页全选。
- 切换分页或分类后，选中状态会清空。
- 删除题目会删除关联测试点、提交记录和考试题目关联。
- 删除操作不可恢复，删除前建议先备份数据库。

## 5. 如何通过 Markdown 导入题目

进入：

```text
/admin/problems/import
```

使用方式：

1. 上传 `.md` 文件，或直接粘贴 Markdown 文本。
2. 填写默认难度和默认分类，作为兜底。
3. 点击“解析预览”。
4. 检查题目标题、难度、分类、样例数量和数据范围。
5. 确认无误后点击确认导入。

导入成功后，题目会出现在日常题库中。

## 6. Markdown 标准格式

支持一个文件导入一道或多道题。每道题用一级标题 `#` 开始。

推荐格式：

````markdown
# A+B 问题

## 难度

入门

## 分类

基础语法

## 题目描述

输入两个整数 a 和 b，输出它们的和。

## 输入格式

一行两个整数 a 和 b。

## 输出格式

输出一个整数，表示 a+b 的结果。

## 样例

### 输入样例 1

```text
1 2
```

### 输出样例 1

```text
3
```

### 输入样例 2

```text
10 20
```

### 输出样例 2

```text
30
```

## 数据范围

1 <= a, b <= 1000
````

规则：

- 每道题至少两组样例。
- 输入样例和输出样例必须成对。
- 样例内容必须放在代码块中。
- 代码块里的内容才会保存为样例。
- `## 难度` 和 `## 分类` 可以在 Markdown 中写；如果缺少，则使用导入页面的默认值。
- 当前暂不支持在 Markdown 中设置隐藏测试点、考试分值或题目标签。

## 7. 如何创建模拟考试

进入：

```text
/admin/exams
```

点击新建考试，填写：

- 考试名称
- 考试说明
- 考试时长，单位分钟
- 考试状态

建议新建时使用 `draft` 草稿状态，题目确认后再发布。

## 8. 如何添加已有题目到考试

进入考试编辑页：

```text
/admin/exams/[id]/edit
```

使用“添加已有题目”区域：

1. 可以直接点击分类按钮，只展示该分类下的题目。
2. 可以输入题目名称继续搜索。
3. 搜索结果中可以单独勾选题目。
4. 可以点击“全选当前结果”，一次性选中当前搜索结果中还没有加入考试的题目。
5. 设置题目分值。
6. 设置起始排序数字。
7. 点击“添加选中题目”，批量加入考试；也可以在某一道题右侧点击“添加到考试”单独加入。
8. 已经在考试中的题目会标记为“已在考试中”，不能重复加入。

已添加的题目会显示在当前考试题目列表中。

## 9. 如何通过 Markdown 导入题目到考试

进入：

```text
/admin/exams/[id]/import
```

使用方式和日常题库 Markdown 导入类似。

导入后：

- 题目会保存到日常题库。
- 测试点会保存到数据库。
- 题目会自动加入当前考试。
- 多题 Markdown 会一次加入多道题。

## 10. 如何发布考试

在考试管理页或考试编辑页点击发布。

发布前系统会校验：

- 考试标题不能为空。
- 考试时长必须大于 0。
- 考试至少包含 1 道题。
- 每道题必须有分值。
- 每道题分值必须大于 0。

考试状态说明：

```text
draft      草稿，学生不可见
published  已发布，学生可参加
ended      已结束，学生不可继续答题
```

## 11. 如何查看日常提交记录

进入：

```text
/admin/submissions
```

这里显示所有用户的日常刷题提交。

支持筛选：

- 用户名
- 用户角色
- 题目
- 状态
- 开始日期
- 结束日期

可以进入详情页查看代码和每个测试点结果。

## 12. 如何查看考试提交记录

进入：

```text
/admin/exam-submissions
```

这里显示所有用户的模拟考试提交。

支持筛选：

- 考试
- 用户名
- 用户角色
- 题目
- 状态
- 开始日期
- 结束日期

## 13. 如何查看考试记录

进入：

```text
/admin/exams/[id]/records
```

可以查看某场考试的学生考试记录，包括：

- 用户名
- 开始时间
- 交卷时间
- 状态
- 总分

支持按用户名搜索。

## 14. 如何修改系统设置

进入：

```text
/admin/settings
```

可以修改：

- 平台名称
- 平台副标题
- 学生端公告
- 管理员端公告
- 默认 C++ 代码模板
- 默认评测时间限制
- 默认评测内存限制
- 是否允许学生自助注册

注意：

- 默认时间限制必须大于 0。
- 默认内存限制必须大于 0。
- 默认 C++ 模板不能为空。
- 当前暂未开放学生自助注册页，注册开关是预留设置。

## 15. 如何备份 SQLite 数据库

正式使用期间建议每天至少备份一次。

Windows：

```bash
npm run backup:sqlite
```

Linux：

```bash
bash scripts/backup-sqlite.sh
```

备份文件会生成到：

```text
backups/
```

文件名类似：

```text
dev-YYYYMMDD-HHMMSS.db
```

备份完成后，建议确认备份文件存在并且大小不是 0。

## 16. 如何检查 Docker 是否正常

执行：

```bash
docker --version
docker info
```

如果 `docker --version` 正常，但 `docker info` 失败，说明 Docker CLI 已安装，但 Docker Desktop 或 Docker Engine 没有启动。

还可以检查 Judge 镜像：

```bash
docker images oj-cpp-judge
```

如果镜像不存在，重新构建：

```bash
docker build -t oj-cpp-judge ./docker/judge-cpp
```

## 17. 如何检查 `/api/health`

服务启动后访问：

```text
/api/health
```

正常返回示例：

```json
{
  "ok": true,
  "database": "ok",
  "judgeMode": "docker",
  "timestamp": "2026-05-06T00:00:00.000Z"
}
```

检查重点：

- `ok` 应该是 `true`。
- `database` 应该是 `ok`。
- 正式使用时 `judgeMode` 应该是 `docker`。
- 返回中不应该包含密码、SESSION_SECRET 等敏感信息。

## 18. 如何处理 Docker Judge 异常

### 学生提交一直失败

先检查 Docker：

```bash
docker info
```

再检查健康接口：

```text
/api/health
```

确认 `.env` 中：

```env
NODE_ENV=production
JUDGE_MODE=docker
JUDGE_DOCKER_IMAGE=oj-cpp-judge
```

### Docker Judge 不工作

检查容器和镜像：

```bash
docker ps
docker ps -a
docker images
```

重新构建镜像：

```bash
docker build -t oj-cpp-judge ./docker/judge-cpp
```

然后重启服务。

### Docker daemon 没启动

表现：

```text
docker info
```

报无法连接 Docker API。

处理：

- Windows：启动 Docker Desktop。
- Linux：启动 Docker Engine。

### Time Limit Exceeded 很多

可能是：

- 学生代码死循环。
- 题目时间限制太小。
- 服务器资源不足。

可在 `/admin/settings` 中检查默认评测时间限制。

## 19. 数据库误操作怎么办

如果误删题目、用户或考试：

1. 先停止服务。
2. 按时间戳找到本次误操作前生成的备份文件：

```text
backups/
```

3. 用备份数据库替换当前 SQLite 数据库。
4. 重新启动服务。
5. 检查 `/api/health`。

恢复前建议把当前数据库也复制一份，避免二次损坏。

## 20. 复制代码失败怎么办

如果管理端或学生端点击“复制代码”后显示失败，优先检查访问地址是否仍是公网 HTTP。现代浏览器在非安全上下文中会禁用 `navigator.clipboard.writeText`。

当前平台已经增加兼容复制方案：HTTPS 或安全上下文优先使用 Clipboard API，公网 HTTP 下 fallback 到 `textarea + document.execCommand("copy")`。如果线上仍然失败，按下面顺序检查：

```bash
grep -n 'execCommand\|isSecureContext' /www/oj/src/lib/copyToClipboard.ts
pm2 stop oj
NEXT_TELEMETRY_DISABLED=1 NEXT_PRIVATE_BUILD_WORKER_COUNT=1 NODE_OPTIONS='--max-old-space-size=768' npm run build
pm2 restart oj --update-env
curl http://127.0.0.1:3000/api/health
```

长期建议仍然是绑定域名并配置 HTTPS。

## 21. 学生忘记密码怎么办

进入：

```text
/admin/users
```

找到学生账号，使用重置密码功能。

提醒学生下次登录使用新密码。

## 22. 上课前检查清单

```text
[ ] Docker Desktop / Docker Engine 已启动
[ ] /api/health 返回 ok
[ ] 数据库已备份
[ ] 管理员可以登录
[ ] 学生账号可登录
[ ] A+B 测试题提交 Accepted
[ ] 今日考试已发布
[ ] 考试题目和时长确认无误
```

## 23. 每日维护清单

```text
[ ] 检查 /api/health
[ ] 检查 Docker Desktop / Docker Engine 是否运行
[ ] 执行数据库备份
[ ] 确认 backups/ 中有当天备份文件
[ ] 检查磁盘空间
[ ] 查看是否有大量 Compile Error / Time Limit Exceeded
[ ] 检查当天考试是否发布
[ ] 下课后确认考试记录和提交记录正常
```

## 24. 常用命令

安装依赖：

```bash
npm install
```

本地构建：

```bash
npm run build
```

线上 2 核 2GB 服务器构建：

```bash
pm2 stop oj
NEXT_TELEMETRY_DISABLED=1 NEXT_PRIVATE_BUILD_WORKER_COUNT=1 NODE_OPTIONS='--max-old-space-size=768' npm run build
pm2 restart oj --update-env
curl http://127.0.0.1:3000/api/health
```

启动生产服务：

```bash
npm run start
```

检查生产环境变量：

```bash
npm run check:env
```

应用数据库迁移：

```bash
npm run db:deploy
```

查看迁移状态：

```bash
npm run db:status
```

修改管理员密码：

```bash
npm run admin:password -- admin 新密码
```

备份数据库：

```bash
npm run backup:sqlite
```

运行质量检查：

```bash
npm run test
npx tsc --noEmit
npm run lint
npm run build
```
