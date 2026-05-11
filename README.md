# 8Feet Frontend

8Feet 前端项目，基于 React + Vite + TypeScript 构建，用于商业对象智能深度调研分析平台的 Web 端页面展示与交互。

## 在线访问

- 生产地址：http://8feet.meteor041.com/

## 技术栈

- React 18
- TypeScript 5
- Vite 5
- React Router 6
- Tailwind CSS 3
- Radix UI / shadcn 组件体系

## 功能页面

当前已实现的主要路由页面（见 `src/routes/AppRoutes.tsx`）：

- `/`：任务发起
- `/process`：任务处理进度
- `/report`：报告预览
- `/history`：历史与收藏
- `/login`：登录
- `/register`：注册
- `/reset-password`：重置密码
- `/platform-init`：平台初始化
- `/profile`：个人信息
- `/favorites`：收藏夹
- `/alerts`：提醒与消息

## 本地开发

### 1. 环境要求

- Node.js 18+
- npm 9+

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发环境

```bash
npm run dev
```

默认启动后可访问：`http://localhost:48888`

## 环境变量

项目通过 Vite 环境变量控制接口行为：

- `VITE_USE_MOCK`：是否启用前端 mock 数据（默认 `false`）
- `VITE_API_BASE_URL`：后端服务基础地址（可留空，默认同域）

可在项目根目录创建 `.env.local`：

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://your-api-domain.com
```

接口最终请求前缀为：

`{VITE_API_BASE_URL}/api/v1/*`

`VITE_API_BASE_URL` 留空时会走同域部署，前端 Nginx 需要把 `/api/` 和
`/ws/` 反向代理到后端宿主机端口 `127.0.0.1:48881`，`/static/` 也代理到后端
以便 Django 静态文件可用。宿主机 Nginx 部署可参考
`scripts/deploy/nginx.8feet.meteor041.com.conf`；容器 fallback 默认使用 host
network，才能访问只绑定在宿主机回环地址的后端端口。

## 项目结构

```text
.
├─ src/
│  ├─ api/            # API 请求封装与 mock 数据
│  ├─ components/     # 通用组件与 UI 组件
│  ├─ pages/          # 页面级组件
│  ├─ routes/         # 路由配置
│  ├─ types/          # TypeScript 类型定义
│  ├─ App.tsx
│  └─ main.tsx
├─ docs/              # 需求说明、设计文档、接口文档
├─ deploy.bat         # Windows 一键部署脚本（依赖 dist 目录）
├─ Dockerfile
├─ nginx.conf
└─ package.json
```

## 构建与部署

### 构建产物

```bash
npm run build
```

构建后静态资源输出到 `dist/` 目录。

### 预览构建结果

```bash
npm run preview
```

### 服务器部署（脚本方式）

仓库提供 `deploy.bat`，核心流程为：

1. 打包本地 `dist/`
2. 上传到服务器
3. 解压到目标目录并刷新 Nginx

使用脚本前请确认：

- 已完成本地构建并存在 `dist/` 目录
- 本机具备 `scp` / `ssh` 能力
- 服务器登录信息与脚本内配置一致

## CI/CD

仓库使用 GitHub Actions 做前端质量门禁与自动/手动部署。

### Frontend CI

配置文件：`.github/workflows/ci.yml`

触发条件：

- PR 到 `main`
- push 到 `main`
- push 到 `fix/**`、`feat/**`、`ref/**`

流水线阶段：

- Node.js 20
- `npm ci`
- `npm run build`
- 上传 `dist/` 构建产物，保留 7 天
- Docker image build 校验，不推送镜像

### Frontend CD

配置文件：`.github/workflows/deploy.yml`

触发方式：

- `Frontend CI` 在 `main` 上成功后，自动部署 `main` 到 `production`
- GitHub Actions 手动触发 `workflow_dispatch`

自动部署会跳过 GHCR 镜像发布，只通过 SSH 更新服务器。需要部署其他
ref、部署到 `staging` 或发布 GHCR 镜像时，使用手动触发。

输入参数：

- `ref`：要部署的分支、tag 或 commit，默认 `main`
- `environment`：`staging` 或 `production`
- `publish_image`：是否发布镜像到 GHCR
- `deploy_ssh`：是否通过 SSH 部署到服务器
- `smoke_url`：部署后 smoke check URL，默认 `http://8feet.meteor041.com/`

部署需要在 GitHub Environment 或仓库 secrets 中配置：

| Secret | 是否必需 | 说明 |
| --- | --- | --- |
| `DEPLOY_SSH_HOST` | SSH 部署必需 | 服务器主机名或 IP |
| `DEPLOY_SSH_USER` | SSH 部署必需 | SSH 用户 |
| `DEPLOY_SSH_KEY` | SSH 部署必需 | 可登录服务器的私钥 |
| `DEPLOY_APP_DIR` | SSH 部署必需 | 服务器上的前端仓库目录 |
| `DEPLOY_SSH_PORT` | 可选 | SSH 端口，默认 `22` |
| `DEPLOY_STATIC_DIR` | 现有 Nginx 部署推荐 | Nginx 静态站点根目录，例如 `/usr/share/nginx/html` |

SSH 部署会在服务器上执行：

```bash
git fetch --tags origin
git checkout <ref>
git pull --ff-only origin <ref>  # 仅分支场景
npm ci && npm run build          # 如果配置了 DEPLOY_STATIC_DIR
rsync -a --delete dist/ <DEPLOY_STATIC_DIR>/
nginx -t && nginx -s reload
```

如果没有配置 `DEPLOY_STATIC_DIR`，但服务器目录存在 compose 文件，workflow 会执行：

```bash
docker compose up -d --build
```

如果既没有配置 `DEPLOY_STATIC_DIR`，也没有 compose 文件，workflow 会尝试 Docker
容器部署。这个 fallback 使用 host network，占用宿主机 `80`，用于保证容器内
Nginx 能访问后端只绑定在 `127.0.0.1:48881` 的端口：

```bash
docker build --build-arg VITE_USE_MOCK=false --build-arg VITE_API_BASE_URL= -t 8feet-frontend:latest .
docker rm -f 8feet-frontend || true
docker run -d --name 8feet-frontend --restart unless-stopped --network host 8feet-frontend:latest
```

如果服务器 80 端口已经被宿主机 Nginx 占用，请配置 `DEPLOY_STATIC_DIR`，不要让
workflow 再启动一个绑定 `80:80` 的前端容器。

生产环境建议在 GitHub 的 `production` Environment 上启用 required reviewers。

### 回滚

回滚时重新运行 `Frontend CD`，把 `ref` 设置为上一个确认可用的 commit 或 tag。
workflow 会重新 checkout 该版本、构建镜像并执行 smoke check。

## 相关文档

- 需求文档：`docs/8Feet需求规格说明书.md`
- 接口文档：`docs/api-docs/接口设计文档.md`
- UI 设计计划：`docs/UI设计计划.md`

## 许可证

当前仓库未声明开源许可证，默认保留所有权利。
