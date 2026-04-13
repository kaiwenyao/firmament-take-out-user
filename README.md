# Firmament Takeout - User Frontend

[中文版](./README_EN.md)

## Live Demo

**URL:** <https://firmament-user.kaiwen.dev>

### Test Account

* **Phone:** 13333333333
* **Password:** 123456

## Tech Stack

### Core Framework

* **React** ^19.2.0 - JavaScript library for building user interfaces
* **React DOM** ^19.2.0 - DOM rendering library for React
* **TypeScript** \~5.9.3 - Type-safe superset of JavaScript
* **Vite** ^7.2.4 - Next-generation frontend build tool

### React 19 Compatibility

This project uses React 19.2.0 with antd-mobile compatibility configured via `unstableSetRender` API in `src/main.tsx`.

* **Requirement:** antd-mobile >= 5.40.0 (currently using 5.42.3)
* **Note:** This compatibility hack will be removed in the next major version of antd-mobile

### Routing

* **React Router DOM** ^6.28.0 - Routing for single-page applications

### UI Components

* **Ant Design Mobile** ^5.42.3 - Mobile UI component library
* **Ant Design Mobile Icons** ^0.3.0 - Mobile icon library
* **shadcn/ui** - Reusable components based on Radix UI and Tailwind CSS
  * Components used: Button, Card, Input, Label, Sonner
  * Based on **Radix UI** - unstyled, accessible UI components
    * @radix-ui/react-label ^2.1.8
    * @radix-ui/react-slot ^1.2.4
    * @radix-ui/react-toast ^1.2.15

### Styling

* **Tailwind CSS** ^3.4.0 - Utility-first CSS framework
* **tailwindcss-animate** ^1.0.7 - Animation plugin for Tailwind CSS
* **PostCSS** ^8.5.6 - CSS post-processor
* **Autoprefixer** ^10.4.23 - CSS browser prefix automation

### HTTP Client

* **Axios** ^1.7.9 - Promise-based HTTP client

### Utilities

* **class-variance-authority** ^0.7.1 - Component variant management
* **clsx** ^2.1.1 - Conditional className construction
* **tailwind-merge** ^3.4.0 - Smart Tailwind CSS class merging
* **lucide-react** ^0.562.0 - Icon library
* **next-themes** ^0.4.6 - Theme switching
* **sonner** ^2.0.7 - Toast notifications

### Dev Tools

* **ESLint** ^9.39.1 - JavaScript/TypeScript linting
* **TypeScript ESLint** ^8.46.4 - TypeScript ESLint plugin
* **@vitejs/plugin-react** ^5.1.2 - Vite React plugin (supports React 19)

## Project Structure

```
user-front-react/
├── src/
│   ├── api/          # API interfaces
│   ├── components/   # Shared components
│   ├── pages/        # Page components
│   ├── router/       # Route configuration
│   ├── lib/          # Utilities
│   └── assets/       # Static assets
├── public/           # Public static files
└── package.json      # Project dependencies
```

## Prerequisites

* **Node.js** \>= 18.0.0 (Node.js 24.x LTS recommended)
* **npm** \>= 9.0.0 (usually bundled with Node.js)

Check versions:

```bash
node --version
npm --version
```

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Access at `http://localhost:5173`

### Other Commands

```bash
# Start dev server (allow external access)
npm run dev-host

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Deployment

### Docker

The project includes Docker support for containerized deployment.

### Deployment Files

* **Dockerfile** - Multi-stage build using nginx
* **deploy/nginx/user.conf.tpl** - nginx config template
* **deploy/nginx/docker-entrypoint.d/99-envsubst.sh** - Env variable substitution

### Manual Deploy

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
