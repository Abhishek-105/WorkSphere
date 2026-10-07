# ⚡ WorkSphere

### Employee Daily Work & Project Management Platform

A production-ready full-stack workspace for managing **projects, tasks, team activity, and daily work updates** — built with a separate Next.js frontend and Laravel API.

🌐 **[Live Demo](https://work-sphere-git-main-abhishek-105s-projects.vercel.app/)** · 💻 **[GitHub](https://github.com/Abhishek-105/WorkSphere)**

---

## 🎯 The Product

WorkSphere is built around a simple workplace workflow:

**Plan → Assign → Track → Report → Review**

It gives **Managers** and **Employees** focused workflows for the work they are responsible for.

The goal was to build something closer to a **real internal SaaS product** than a collection of CRUD screens.

---

## ✨ Core Capabilities

### 👨‍💼 Manager

* 📁 Create and manage projects
* ✅ Create and assign tasks
* 👥 Manage team members
* 📝 Review daily work updates
* 📊 Monitor project and team activity
* 📎 Manage project files

### 👨‍💻 Employee

* 📌 View assigned projects
* 🎯 Track tasks and deadlines
* 📝 Submit daily work updates
* 🚧 Report blockers
* 📈 Track personal work progress

---

## 🎨 Design System

The interface follows a **compact enterprise SaaS design system**.

The design intentionally focuses on:

**Hierarchy · Consistency · Density · Clarity**

Rather than making every screen visually heavy, the UI uses a consistent system for:

* Navigation
* Cards
* Filters
* Status indicators
* Loading states
* Empty states
* Forms
* Actions
* Responsive layouts

The objective was simple:

> **Make the product feel predictable, focused, and professional.**

---

## 🏗️ Architecture

```text
┌──────────────────────┐
│     Next.js App      │
│  React + TypeScript  │
└──────────┬───────────┘
           │
           │ REST API
           ▼
┌──────────────────────┐
│     Laravel API      │
│ PHP + Sanctum        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      PostgreSQL      │
└──────────────────────┘
```

### ☁️ Production

```text
Next.js  →  Vercel
Laravel  →  Render
Database →  PostgreSQL
```

The frontend and backend are intentionally separated.

**Next.js** owns the application experience, while **Laravel** handles business logic, authentication, authorization, and data through APIs.

---

## 🔐 Authentication

Authentication is handled through **Laravel Sanctum**.

```text
Login
  ↓
Laravel API
  ↓
Sanctum Token
  ↓
Authenticated Requests
  ↓
Role-based Access
```

Protected resources are available according to the authenticated user's role.

---

## 🧩 Backend Architecture

The backend follows an API-first approach instead of coupling the frontend directly to Laravel's server-rendered views.

Core business entities include:

**Users · Projects · Tasks · Assignments · Daily Updates · Files · Activity Logs**

These relationships represent the actual workflow of a workplace rather than treating every feature as an isolated CRUD module.

---

## 🛠️ Tech Stack

| Layer              | Technology                   |
| ------------------ | ---------------------------- |
| 🎨 Frontend        | Next.js · React · TypeScript |
| 💅 Styling         | Tailwind CSS                 |
| ⚙️ Backend         | Laravel 12 · PHP 8.2         |
| 🔐 Authentication  | Laravel Sanctum              |
| 🗄️ Database       | PostgreSQL                   |
| 🔗 API             | REST                         |
| ☁️ Deployment      | Vercel · Render              |
| 📦 Version Control | Git · GitHub                 |

---

## 🧠 Engineering Focus

This project demonstrates practical full-stack engineering across:

* ⚛️ Next.js frontend architecture
* 🔌 Laravel REST API development
* 🔐 Authentication & role-based authorization
* 🗄️ Relational database design
* 🔄 CRUD and assignment workflows
* 📎 File management
* 🔗 API integration
* 📱 Responsive SaaS UI
* 🐳 Docker-based deployment
* ☁️ Production environment configuration
* 🚀 Vercel + Render deployment
* 🐘 PostgreSQL production setup

The emphasis was on building a **complete product workflow**, not simply implementing individual features.

---

## 📂 Project Structure

```text
WorkSphere/
│
├── app/                    Laravel application
├── database/               Migrations & seeders
├── routes/                 API routes
├── config/                 Application configuration
│
├── nexra-frontend/        Next.js application
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── lib/
│   └── types/
│
├── Dockerfile
├── composer.json
└── package.json
```

---

## 🚀 Local Setup

### Backend

```text
cd nexra
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend

```text
cd nexra-frontend
npm install
npm run dev
```

Configure the frontend API URL using:

```text
NEXT_PUBLIC_API_URL
```

---

## 🌍 Production

**Frontend:** Vercel
**API:** Render
**Database:** PostgreSQL

The production application is fully deployed with the frontend communicating with the Laravel API through authenticated requests.

---

## ✅ Status

**🟢 Live · Production Deployed**

WorkSphere represents my approach to building a modern full-stack application — from **database design and API architecture to frontend UX and production deployment**.

---

### ⚡ Built with Laravel × Next.js × PostgreSQL

*Designed to solve a workflow, engineered to behave like a product.*
