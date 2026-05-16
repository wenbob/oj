# 2026-05-16 复制代码修复记录

本文记录 2026-05-16 对线上 OJ 平台“复制代码”功能的修复。文档不记录任何真实管理员密码、服务器密码、Token 或 `.env` 内容。

## 1. 问题现象

管理端和学生端所有“复制代码”按钮点击后都显示“复制失败”。

受影响位置包括：

- 学生日常提交记录
- 学生考试提交记录
- 学生提交详情
- 管理员日常提交记录
- 管理员考试提交记录
- 管理员提交详情

## 2. 根因

原实现只调用：

```ts
navigator.clipboard.writeText(code)
```

该 API 在公网 HTTP 页面通常不可用，因为浏览器只允许它在 HTTPS 或 localhost 等安全上下文中稳定工作。线上访问地址是：

```text
http://39.105.91.81
```

因此浏览器会拒绝剪贴板写入，表现为复制失败。

## 3. 修复方式

修改文件：

```text
src/lib/copyToClipboard.ts
```

当前策略：

```text
安全上下文：
使用 navigator.clipboard.writeText

非安全上下文：
fallback 到 textarea + document.execCommand("copy")
```

这样可以让公网 HTTP 下的复制按钮继续可用。长期更稳的方案仍然是绑定域名并配置 HTTPS。

## 4. 线上操作流程

上线前先备份数据库和旧文件：

```bash
mkdir -p /www/backups
cp /www/oj/prisma/prod.db /www/backups/prod-$(date +%Y%m%d-%H%M%S).db
cp /www/oj/src/lib/copyToClipboard.ts /www/backups/copyToClipboard-$(date +%Y%m%d-%H%M%S).ts
```

上传单文件到：

```text
/www/oj/src/lib/copyToClipboard.ts
```

确认线上文件包含兼容复制逻辑：

```bash
grep -n 'execCommand\|isSecureContext' /www/oj/src/lib/copyToClipboard.ts
```

重新构建并重启：

```bash
cd /www/oj
npm run build
pm2 restart oj --update-env
curl http://127.0.0.1:3000/api/health
```

## 5. 数据安全结论

本次只修改前端复制工具函数，不修改数据库结构、账号、题目、提交记录或 Judge。

本次明确没有执行：

```bash
npm run seed
npm run db:init
```

线上修复后已同步到 GitHub：

```text
66f6d42 fix copy code fallback on http
```
