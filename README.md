# 苍穹外卖 - 用户端

## 演示网站

**访问地址：** <https://firmament-user.kaiwen.dev>

### 测试账号

* **账号：** 13333333333
* **密码：** 123456

## 技术栈

### 核心框架

* **React** ^19.2.0 - 用于构建用户界面的 JavaScript 库（最新稳定版）
* **React DOM** ^19.2.0 - React 的 DOM 渲染库
* **TypeScript** \~5.9.3 - JavaScript 的超集，提供类型安全
* **Vite** ^7.2.4 - 下一代前端构建工具，提供快速的开发体验

### React 19 兼容性说明

项目使用 React 19.2.0，并通过以下方式确保与 antd-mobile 的兼容性：

* **antd-mobile 兼容配置**：在 `src/main.tsx` 中使用 `unstableSetRender` API 来适配 React 19 的渲染方式
* **兼容方式**：由于 React 19 调整了 react-dom 的导出方式，antd-mobile v5 需要使用兼容配置才能正常工作
* **版本要求**：antd-mobile 版本 >= 5.40.0（当前使用 5.42.3）
* **未来计划**：该兼容方式将在 antd-mobile 的下一个 major 版本中被移除，届时将原生支持 React 19

### 路由管理

* **React Router DOM** ^6.28.0 - 用于单页应用的路由管理

### UI 组件库

* **Ant Design Mobile** ^5.42.3 - 移动端 UI 组件库（使用 `unstableSetRender` 兼容 React 19）
* **Ant Design Mobile Icons** ^0.3.0 - 移动端图标库
* **shadcn/ui** \- 基于 Radix UI 和 Tailwind CSS 的可复用组件系统
  * 使用的组件：Button, Card, Input, Label, Sonner
  * 基于 **Radix UI** 无样式、可访问的 UI 组件库
    * @radix-ui/react-label ^2.1.8 - 标签组件
    * @radix-ui/react-slot ^1.2.4 - 插槽组件
    * @radix-ui/react-toast ^1.2.15 - Toast 通知组件

### 样式方案

* **Tailwind CSS** ^3.4.0 - 实用优先的 CSS 框架
* **tailwindcss-animate** ^1.0.7 - Tailwind CSS 动画插件
* **PostCSS** ^8.5.6 - CSS 后处理器
* **Autoprefixer** ^10.4.23 - 自动添加 CSS 浏览器前缀

### HTTP 请求

* **Axios** ^1.7.9 - 基于 Promise 的 HTTP 客户端

### 工具库

* **class-variance-authority** ^0.7.1 - 用于管理组件变体的工具
* **clsx** ^2.1.1 - 用于条件性地构造 className 字符串
* **tailwind-merge** ^3.4.0 - 智能合并 Tailwind CSS 类名
* **lucide-react** ^0.562.0 - 图标库
* **next-themes** ^0.4.6 - 主题切换工具
* **sonner** ^2.0.7 - Toast 通知组件

### 开发工具

* **ESLint** ^9.39.1 - JavaScript/TypeScript 代码检查工具
* **TypeScript ESLint** ^8.46.4 - TypeScript 的 ESLint 插件
* **@vitejs/plugin-react** ^5.1.2 - Vite 的 React 插件（支持 React 19）

## 项目结构

```
user-front-react/
├── src/
│   ├── api/          # API 接口定义
│   ├── components/   # 公共组件
│   ├── pages/        # 页面组件
│   ├── router/       # 路由配置
│   ├── lib/          # 工具函数
│   └── assets/       # 静态资源
├── public/           # 公共静态文件
└── package.json      # 项目依赖配置

```

## 前置要求

在开始之前，请确保你的本地环境已安装以下依赖：

* **Node.js** \>= 18.0.0（推荐使用 Node.js 24.x LTS 版本）
* **npm** \>= 9.0.0（通常随 Node.js 一起安装）

你可以通过以下命令检查版本：

```bash
node --version
npm --version
```

## 本地调试

按照以下步骤在本地运行项目：

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

启动成功后，在浏览器中访问 `http://localhost:5173` 即可查看应用。

### 其他开发命令

```bash
# 启动开发服务器（允许外部访问）
npm run dev-host

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## Github Actions

项目使用 Docker 容器化部署，通过 GitHub Actions 实现自动化 CI/CD。

### 自动化部署

当代码推送到 main 分支时，GitHub Actions 会自动：

* 构建 Docker 镜像并推送到 Docker Hub
* 通过 SSH 部署到服务器并启动容器

### 部署文件

* **Dockerfile**：多阶段构建，使用 nginx 提供静态文件服务
* **deploy/nginx/user.conf.tpl**：nginx 配置模板，支持环境变量配置后端地址
* **deploy/nginx/docker-entrypoint.d/99-envsubst.sh**：容器启动时替换环境变量
* **.github/workflows/deploy-user-nginx.yml**：GitHub Actions 工作流配置

### 手动部署

```bash
# 构建镜像
docker build -t firmament-user:latest .

# 运行容器
docker run -d \
  --name firmament-user \
  --restart unless-stopped \
  -p 80:80 \
  -e FIRMAMENT_SERVER_HOST=your-backend-host \
  -e FIRMAMENT_SERVER_PORT=your-backend-port \
  firmament-user:latest
```
