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

默认启动后可访问：`http://localhost:5173`

## 环境变量

项目通过 Vite 环境变量控制接口行为：

- `VITE_USE_MOCK`：是否启用前端 mock 数据（默认 `true`）
- `VITE_API_BASE_URL`：后端服务基础地址（可留空，默认同域）

可在项目根目录创建 `.env.local`：

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://your-api-domain.com
```

接口最终请求前缀为：

`{VITE_API_BASE_URL}/api/v1/*`

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

## 相关文档

- 需求文档：`docs/8Feet需求规格说明书.md`
- 接口文档：`docs/api-docs/接口设计文档.md`
- UI 设计计划：`docs/UI设计计划.md`

## 许可证

当前仓库未声明开源许可证，默认保留所有权利。
