# 🍜 Firmament Takeout - User Frontend

**Firmament Takeout** is a mobile-first food delivery web application built with React 19, TypeScript, and Vite. Browse restaurants, manage your cart, place orders, and track deliveries — all from your phone. ✨

[中文版](./README_EN.md) | [Live Demo](https://firmament-user.kaiwen.dev)

---

## 📋 Table of Contents

- [✨ Features](#features)
- [🎭 Live Demo](#live-demo)
- [🛠️ Tech Stack](#tech-stack)
- [🚀 Getting Started](#getting-started)
  - [📋 Prerequisites](#prerequisites)
  - [🔧 Installation](#installation)
  - [⚙️ Configuration](#configuration)
  - [📜 Available Scripts](#available-scripts)
- [📂 Project Structure](#project-structure)
- [🐳 Deployment](#deployment)
- [🧪 Testing](#testing)
- [🤝 Contributing](#contributing)
- [📝 License](#license)
- [📧 Contact](#contact)

---

## ✨ Features

- 🍔 **Browse & Discover** — Explore food by category and restaurant from the home page
- 🛒 **Shopping Cart** — Add, remove, and manage items before checkout
- 🔐 **User Authentication** — Secure login with phone number and password
- 📍 **Address Management** — Add, edit, and delete delivery addresses
- 💳 **Order & Pay** — Seamless order placement and payment flow
- 📦 **Order Tracking** — View order history and delivery status
- 👤 **User Profile** — Manage personal information and preferences
- 📱 **Mobile-First Design** — Responsive UI optimized for phone screens

---

## 🎭 Live Demo

Visit the live demo at **[firmament-user.kaiwen.dev](https://firmament-user.kaiwen.dev)**

**Test Account:**

| Field | Value |
|-------|-------|
| 📱 Phone | `13333333333` |
| 🔒 Password | `123456` |

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19 · TypeScript · Vite 7 |
| **Styling** | Tailwind CSS · antd-mobile · shadcn/ui |
| **Routing** | React Router DOM 6 |
| **HTTP** | Axios |
| **Deployment** | Docker · nginx |

> **Note:** This project uses React 19 with `antd-mobile` compatibility configured via `unstableSetRender` in `src/main.tsx`. Requires antd-mobile >= 5.40.0.

---

## 🚀 Getting Started

### 📋 Prerequisites

- **Node.js** >= 18.0.0 (24.x LTS recommended)
- **npm** >= 9.0.0

Check your versions:

```bash
node --version && npm --version
```

### 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/kaiwenyao/firmament-take-out-user.git
cd firmament-take-out-user

# Install dependencies
npm install

# Start development server
npm run dev
```

Access the app at `http://localhost:5173`

### ⚙️ Configuration

**Development:** The Vite dev server proxies API requests automatically. No additional configuration needed — requests to `/api` are forwarded to `http://localhost:8080/user` (configured in `vite.config.ts`).

**Production (Docker):** Configure via environment variables:

```bash
FIRMAMENT_SERVER_HOST=your-backend-host
FIRMAMENT_SERVER_PORT=your-backend-port
```

### 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run dev-host` | Start dev server (allow external access) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 📂 Project Structure

```
user-front-react/
├── src/
│   ├── api/          # API interfaces
│   ├── components/   # Shared components
│   ├── pages/        # Page components
│   ├── router/       # Route configuration
│   ├── lib/          # Utilities
│   └── assets/       # Static assets
├── deploy/
│   └── nginx/        # nginx config & entrypoint scripts
├── Dockerfile        # Multi-stage Docker build
├── Jenkinsfile       # CI/CD pipeline
└── package.json      # Dependencies
```

---

## 🐳 Deployment

### Docker (Recommended)

Multi-stage build with nginx:

```bash
# Build image
docker build -t firmament-user:latest .

# Run container
docker run -d \
  --name firmament-user \
  --restart unless-stopped \
  -p 80:80 \
  -e FIRMAMENT_SERVER_HOST=your-backend-host \
  -e FIRMAMENT_SERVER_PORT=your-backend-port \
  firmament-user:latest
```

**Environment Variables:**

| Variable | Description |
|----------|-------------|
| `FIRMAMENT_SERVER_HOST` | Backend server host |
| `FIRMAMENT_SERVER_PORT` | Backend server port |

### Deployment Files

- **Dockerfile** — Multi-stage build using nginx
- **deploy/nginx/user.conf.tpl** — nginx config template
- **deploy/nginx/docker-entrypoint.d/99-envsubst.sh** — Environment variable substitution on startup

---

## 🧪 Testing

Run code quality checks with ESLint:

```bash
npm run lint
```

> **Note:** This project currently uses ESLint for code quality. Unit and integration tests are planned for future releases.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m "Add amazing feature"`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please ensure your code passes `npm run lint` and `npm run build` before submitting.

---

## 📝 License

This project is licensed under the [MIT License](./LICENSE).

---

## 📧 Contact

**Kaiwen Yao** — [@kaiwenyao](https://github.com/kaiwenyao)

Project Link: [https://github.com/kaiwenyao/firmament-take-out-user](https://github.com/kaiwenyao/firmament-take-out-user)

---

Made with ❤️ by [Kaiwen Yao](https://github.com/kaiwenyao). Happy coding! 🎉

---

## 🎨 Emoticon Guide

Emoticons used in this README and their meanings:

| Emoji | Meaning | Usage |
|-------|---------|-------|
| 🍜 | Noodles | Food / project identity |
| ✨ | Sparkles | Features / highlights |
| 🎭 | Theater masks | Live demo |
| 🛠️ | Tools | Tech stack |
| 🚀 | Rocket | Getting started |
| 📋 | Clipboard | Prerequisites / TOC |
| 🔧 | Wrench | Installation |
| ⚙️ | Gear | Configuration |
| 📜 | Scroll | Scripts / commands |
| 📂 | Folder | Project structure |
| 🐳 | Whale | Docker / deployment |
| 🧪 | Test tube | Testing |
| 🤝 | Handshake | Contributing |
| 📝 | Memo | License |
| 📧 | Email | Contact |
| ❤️ | Heart | Footer / appreciation |

Check full emoji cheatsheet: [Emoji Cheatsheet](https://github.com/ikatyang/emoji-cheat-sheet)
