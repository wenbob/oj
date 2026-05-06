# OJ 平台线上部署与维护手册

本文档用于小规模正式部署和后续维护。当前线上环境为阿里云 ECS，项目目录约定为 `/www/oj`。

## 1. 服务器信息

当前线上服务器配置：

- 系统：Ubuntu 22.04.5 LTS
- 配置：2 核 CPU、2GB 内存、40GB 系统盘、3M 固定带宽
- 项目目录：`/www/oj`
- 对外访问：`http://39.105.91.81`

已安装组件：

- Node.js v20.20.2
- npm 10.8.2
- Docker 29.1.3
- PM2 7.0.1
- Nginx 1.18.0

生产环境建议只开放：

- `22`：SSH
- `80`：HTTP
- `443`：HTTPS，后续配置证书后使用

完成 Nginx 反向代理后，建议关闭安全组中的 `3000` 对外访问。

## 2. 首次部署流程

如果服务器可以稳定访问 GitHub：

```bash
cd /www
git clone https://github.com/wenbob/OJ.git oj
cd /www/oj
```

如果服务器访问 GitHub 不稳定，可以使用本地压缩包上传，见本文档“后续更新流程”。

安装依赖：

```bash
npm install
```

复制环境变量文件：

```bash
cp .env.example .env
nano .env
```

生产环境 `.env` 至少包含：

```env
NODE_ENV=production
DATABASE_URL="file:./prod.db"
SESSION_SECRET="请替换成至少 32 位的强随机字符串"
JUDGE_MODE=docker
JUDGE_DOCKER_IMAGE=oj-cpp-judge
JUDGE_CONCURRENCY=1
JUDGE_TIME_LIMIT_MS=2000
JUDGE_MEMORY_LIMIT_MB=128
JUDGE_COMPILE_TIMEOUT_MS=30000
```

不要把 `.env` 提交到 Git，也不要把真实密码或真实 secret 写进文档。

检查环境变量：

```bash
npm run check:env
```

应用数据库迁移：

```bash
npm run db:deploy
```

首次初始化数据库时可以运行一次 seed：

```bash
npm run seed
```

线上初始化后不要重复执行 `npm run seed`。重复 seed 可能重置线上数据，影响用户、题目、考试和提交记录。

构建 Docker Judge 镜像：

```bash
docker build -t oj-cpp-judge ./docker/judge-cpp
```

构建 Next.js：

```bash
npm run build
```

启动服务：

```bash
pm2 start npm --name oj -- run start
pm2 save
```

如果需要配置 PM2 开机自启：

```bash
pm2 startup
```

按命令输出执行生成的 systemd 命令，然后再次执行：

```bash
pm2 save
```

## 3. Docker Judge 镜像说明

当前 Judge 镜像使用 Ubuntu 22.04，并切换到阿里云 Ubuntu 软件源，避免部分服务器拉取 Docker Hub `gcc:13` 超时：

```dockerfile
FROM ubuntu:22.04

RUN sed -i 's@http://archive.ubuntu.com/ubuntu/@http://mirrors.aliyun.com/ubuntu/@g' /etc/apt/sources.list \
    && sed -i 's@http://security.ubuntu.com/ubuntu/@http://mirrors.aliyun.com/ubuntu/@g' /etc/apt/sources.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends g++ make \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
```

构建命令：

```bash
docker build -t oj-cpp-judge ./docker/judge-cpp
```

检查镜像：

```bash
docker images oj-cpp-judge
```

检查 Docker daemon：

```bash
docker info
```

生产环境必须使用：

```env
JUDGE_MODE=docker
```

不要在生产环境使用 local Judge。

如果学生提交显示 `Docker 编译超时`，通常是小规格服务器在 Docker 冷启动和 g++ 编译时超过了编译超时阈值。可以在 `.env` 中适当调大：

```env
JUDGE_COMPILE_TIMEOUT_MS=30000
```

修改后重启服务：

```bash
pm2 restart oj
```

## 4. Nginx 反向代理

示例配置：

```nginx
server {
    listen 80;
    server_name 39.105.91.81;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

检查配置：

```bash
nginx -t
systemctl reload nginx
```

配置完成后访问：

```text
http://39.105.91.81
```

## 5. 健康检查

服务启动后检查：

```bash
curl http://127.0.0.1:3000/api/health
curl http://39.105.91.81/api/health
```

期望返回类似：

```json
{"ok":true,"database":"ok","judgeMode":"docker","timestamp":"..."}
```

如果 `judgeMode` 不是 `docker`，不要上线给学生使用。

## 6. SQLite 数据备份

当前线上数据库通常位于：

```text
/www/oj/prisma/prod.db
```

手动备份：

```bash
mkdir -p /www/backups
cp /www/oj/prisma/prod.db /www/backups/prod-$(date +%Y%m%d-%H%M%S).db
```

查看备份：

```bash
ls -lh /www/backups
```

建议至少每天备份一次。可以后续通过 `cron` 增加自动备份：

```bash
crontab -e
```

示例：

```cron
0 2 * * * mkdir -p /www/backups && cp /www/oj/prisma/prod.db /www/backups/prod-$(date +\%Y\%m\%d-\%H\%M\%S).db
```

恢复数据库前应先停止服务：

```bash
pm2 stop oj
cp /www/backups/某个备份.db /www/oj/prisma/prod.db
pm2 start oj
```

## 7. 常用维护命令

查看服务状态：

```bash
pm2 status
pm2 logs oj
```

重启服务：

```bash
pm2 restart oj
```

查看端口：

```bash
ss -lntp | grep 3000
```

查看 Docker：

```bash
docker info
docker images
docker ps -a
```

检查数据库迁移：

```bash
npm run db:status
```

部署新版本后执行：

```bash
npm install
npm run check:env
npm run db:deploy
docker build -t oj-cpp-judge ./docker/judge-cpp
npm run build
pm2 restart oj
```

## 8. 安全收尾清单

上线后请逐项确认：

- [ ] 默认管理员密码已修改。
- [ ] 文档、代码、`.env.example` 中没有真实管理员密码。
- [ ] `.env` 没有提交到 Git。
- [ ] `prod.db` 没有提交到 Git。
- [ ] `node_modules` 没有提交到 Git。
- [ ] `.next` 没有提交到 Git。
- [ ] 阿里云安全组关闭公网 `3000` 端口。
- [ ] 安全组只保留必要端口：`22`、`80`、后续 `443`。
- [ ] 后续可以把 `22` 端口限制为固定 IP。
- [ ] 不开放任何数据库端口。
- [ ] Docker Judge 使用 `JUDGE_MODE=docker`。
- [ ] `/api/health` 返回正常。
- [ ] 已完成一次 SQLite 备份。
- [ ] 后续可以绑定域名。
- [ ] 后续可以配置 HTTPS。

## 9. 上课前检查清单

- [ ] Docker Engine 正常：`docker info`
- [ ] PM2 进程正常：`pm2 status`
- [ ] 健康检查正常：`curl http://127.0.0.1:3000/api/health`
- [ ] 数据库已备份。
- [ ] 管理员可以登录。
- [ ] 学生账号可以登录。
- [ ] 简单题提交 Accepted。
- [ ] 今日考试已发布。
- [ ] 考试题目、时长、分值确认无误。

## 10. 故障排查

学生提交一直失败：

```bash
docker info
pm2 logs oj
curl http://127.0.0.1:3000/api/health
```

Docker Judge 镜像不存在或异常：

```bash
docker images oj-cpp-judge
docker build -t oj-cpp-judge ./docker/judge-cpp
pm2 restart oj
```

Nginx 无法访问：

```bash
nginx -t
systemctl status nginx
systemctl reload nginx
curl http://127.0.0.1:3000
```

数据库误操作：

1. 立即停止服务：`pm2 stop oj`
2. 从 `/www/backups` 找到最近备份。
3. 复制回 `/www/oj/prisma/prod.db`
4. 重启服务：`pm2 start oj`

## 11. 后续更新流程

### 方案 A：继续使用压缩包上传

本地确认代码已提交后：

```bash
git archive -o oj.zip HEAD
```

上传到服务器 `/www` 后：

```bash
cd /www
mkdir -p oj-new
unzip oj.zip -d oj-new
cd oj-new
cp /www/oj/.env .env
npm install
npm run check:env
npm run db:deploy
docker build -t oj-cpp-judge ./docker/judge-cpp
npm run build
```

确认无误后再切换目录或覆盖旧版本。覆盖前必须备份数据库：

```bash
mkdir -p /www/backups
cp /www/oj/prisma/prod.db /www/backups/prod-$(date +%Y%m%d-%H%M%S).db
```

### 方案 B：同步到 Gitee

如果服务器访问 GitHub 不稳定，可以后续把 GitHub 仓库同步到 Gitee。服务器从 Gitee 拉取：

```bash
cd /www
git clone https://gitee.com/你的账号/OJ.git oj
cd /www/oj
```

后续更新：

```bash
cd /www/oj
git pull
npm install
npm run check:env
npm run db:deploy
docker build -t oj-cpp-judge ./docker/judge-cpp
npm run build
pm2 restart oj
```

无论使用哪种方案，都不要把 `.env`、`prod.db`、备份文件、真实密码提交到远程仓库。
