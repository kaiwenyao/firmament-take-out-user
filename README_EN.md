# 🍜 苍穹外卖 - 用户端

**苍穹外卖** 是一款基于 React 19、TypeScript 和 Vite 构建的移动端外卖 Web 应用。浏览餐厅、管理购物车、下单支付、追踪订单 — 一切尽在手机端。✨

[English](./README.md) | [在线演示](https://firmament-user.kaiwen.dev)

---

## 📋 目录

- [✨ 功能特性](#功能特性)
- [🎭 在线演示](#在线演示)
- [🛠️ 技术栈](#技术栈)
- [🚀 快速开始](#快速开始)
  - [📋 前置要求](#前置要求)
  - [🔧 安装](#安装)
  - [⚙️ 配置](#配置)
  - [📜 可用命令](#可用命令)
- [📂 项目结构](#项目结构)
- [🐳 部署](#部署)
- [🧪 测试](#测试)
- [🤝 贡献指南](#贡献指南)
- [📝 许可证](#许可证)
- [📧 联系方式](#联系方式)

---

## ✨ 功能特性

- 🍔 **浏览发现** — 首页按分类和餐厅浏览美食
- 🛒 **购物车** — 结账前添加、移除和管理商品
- 🔐 **用户认证** — 手机号和密码安全登录
- 📍 **地址管理** — 新增、编辑和删除配送地址
- 💳 **下单支付** — 无缝下单和支付流程
- 📦 **订单追踪** — 查看订单历史和配送状态
- 👤 **个人中心** — 管理个人信息和偏好设置
- 📱 **移动端优先** — 为手机屏幕优化的响应式界面

---

## 🎭 在线演示

访问在线演示地址：**[firmament-user.kaiwen.dev](https://firmament-user.kaiwen.dev)**

**测试账号：**

| 字段 | 值 |
|------|-----|
| 📱 手机号 | `13333333333` |
| 🔒 密码 | `123456` |

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | React 19 · TypeScript · Vite 7 |
| **样式** | Tailwind CSS · antd-mobile · shadcn/ui |
| **路由** | React Router DOM 6 |
| **HTTP** | Axios |
| **部署** | Docker · nginx |

> **说明：** 本项目使用 React 19，通过 `src/main.tsx` 中的 `unstableSetRender` 配置了 `antd-mobile` 的兼容性。需要 antd-mobile >= 5.40.0。

---

## 🚀 快速开始

### 📋 前置要求

- **Node.js** >= 18.0.0（推荐使用 24.x LTS 版本）
- **npm** >= 9.0.0

检查版本：

```bash
node --version && npm --version
```

### 🔧 安装

```bash
# 克隆仓库
git clone https://github.com/kaiwenyao/firmament-take-out-user.git
cd firmament-take-out-user

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

启动成功后，在浏览器中访问 `http://localhost:5173`

### ⚙️ 配置

**开发环境：** Vite 开发服务器会自动代理 API 请求，无需额外配置 — 对 `/api` 的请求会转发到 `http://localhost:8080/user`（配置在 `vite.config.ts` 中）。

**生产环境（Docker）：** 通过环境变量配置：

```bash
FIRMAMENT_SERVER_HOST=your-backend-host
FIRMAMENT_SERVER_PORT=your-backend-port
```

### 📜 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run dev-host` | 启动开发服务器（允许外部访问） |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | 运行 ESLint |

---

## 📂 项目结构

```
user-front-react/
├── src/
│   ├── api/          # API 接口定义
│   ├── components/   # 公共组件
│   ├── pages/        # 页面组件
│   ├── router/       # 路由配置
│   ├── lib/          # 工具函数
│   └── assets/       # 静态资源
├── deploy/
│   └── nginx/        # nginx 配置和启动脚本
├── Dockerfile        # 多阶段 Docker 构建
├── Jenkinsfile       # CI/CD 流水线
└── package.json      # 项目依赖
```

---

## 🐳 部署

### Docker（推荐）

多阶段构建，使用 nginx：

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

**环境变量：**

| 变量 | 说明 |
|------|------|
| `FIRMAMENT_SERVER_HOST` | 后端服务器地址 |
| `FIRMAMENT_SERVER_PORT` | 后端服务器端口 |

### 部署文件

- **Dockerfile** — 多阶段构建，使用 nginx
- **deploy/nginx/user.conf.tpl** — nginx 配置模板
- **deploy/nginx/docker-entrypoint.d/99-envsubst.sh** — 启动时替换环境变量

---

## 🧪 测试

使用 ESLint 运行代码质量检查：

```bash
npm run lint
```

> **说明：** 本项目目前使用 ESLint 进行代码质量检查。单元测试和集成测试计划在后续版本中添加。

---

## 🤝 贡献指南

欢迎贡献！请按以下步骤操作：

1. **Fork** 本仓库
2. **创建** 功能分支：`git checkout -b feature/amazing-feature`
3. **提交** 更改：`git commit -m "Add amazing feature"`
4. **推送** 到分支：`git push origin feature/amazing-feature`
5. **提交** Pull Request

提交前请确保代码通过 `npm run lint` 和 `npm run build`。

---

## 📝 许可证

本项目基于 [MIT 许可证](./LICENSE) 授权。

---

## 📧 联系方式

**Kaiwen Yao** — [@kaiwenyao](https://github.com/kaiwenyao)

项目地址：[https://github.com/kaiwenyao/firmament-take-out-user](https://github.com/kaiwenyao/firmament-take-out-user)

---

由 [Kaiwen Yao](https://github.com/kaiwenyao) 用 ❤️ 制作。编码愉快！🎉


