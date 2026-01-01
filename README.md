# 苍穹外卖 - 用户端

## 技术栈

### 核心框架
- **React** 19.2.0 - 用于构建用户界面的 JavaScript 库
- **TypeScript** ~5.9.3 - JavaScript 的超集，提供类型安全
- **Vite** ^7.2.4 - 下一代前端构建工具，提供快速的开发体验

### 路由管理
- **React Router DOM** ^6.28.0 - 用于单页应用的路由管理

### UI 组件库
- **Ant Design Mobile** ^5.37.0 - 移动端 UI 组件库
- **Ant Design Mobile Icons** ^0.3.0 - 移动端图标库
- **Radix UI** - 无样式、可访问的 UI 组件基础库
  - @radix-ui/react-label ^2.1.8
  - @radix-ui/react-slot ^1.2.4
  - @radix-ui/react-toast ^1.2.15

### 样式方案
- **Tailwind CSS** ^3.4.0 - 实用优先的 CSS 框架
- **tailwindcss-animate** ^1.0.7 - Tailwind CSS 动画插件
- **PostCSS** ^8.5.6 - CSS 后处理器
- **Autoprefixer** ^10.4.23 - 自动添加 CSS 浏览器前缀

### HTTP 请求
- **Axios** ^1.7.9 - 基于 Promise 的 HTTP 客户端

### 工具库
- **class-variance-authority** ^0.7.1 - 用于管理组件变体的工具
- **clsx** ^2.1.1 - 用于条件性地构造 className 字符串
- **tailwind-merge** ^3.4.0 - 智能合并 Tailwind CSS 类名
- **lucide-react** ^0.562.0 - 图标库
- **next-themes** ^0.4.6 - 主题切换工具
- **sonner** ^2.0.7 - Toast 通知组件

### 开发工具
- **ESLint** ^9.39.1 - JavaScript/TypeScript 代码检查工具
- **TypeScript ESLint** ^8.46.4 - TypeScript 的 ESLint 插件
- **@vitejs/plugin-react** ^5.1.1 - Vite 的 React 插件

## 演示网站

**访问地址：** https://firmament-user.kaiwen.dev

### 测试账号

- **账号：** 13333333333
- **密码：** 123456

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

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动开发服务器（允许外部访问）
npm run dev-host

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```
