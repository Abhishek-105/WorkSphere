# 🚀 WorkSphere

### Employee Daily Work & Project Management Platform

WorkSphere is a full-stack internal workspace for managing **employees, projects, tasks, assignments, and daily work updates**.

It is built as a production-style SaaS application with a separate **Next.js frontend, Laravel REST API, PostgreSQL database, authentication, role-based access, file management, and cloud deployment**.

---

## 🌐 Live

**Frontend:** YOUR_VERCEL_URL

**Backend:** https://worksphere-api-qvnl.onrender.com

**GitHub:** https://github.com/Abhishek-105/WorkSphere

---

## 🔐 Demo Access

Public registration is intentionally disabled because WorkSphere represents an internal company platform.

| Role           | Email                          | Password      |
| -------------- | ------------------------------ | ------------- |
| 👨‍💼 Manager  | `demo.manager@worksphere.com`  | `Demo@123456` |
| 👨‍💻 Employee | `demo.employee@worksphere.com` | `Demo@123456` |

Demo credentials are protected so visitors can safely share the same accounts.

---

## 💼 How It Works

```text
👨‍💼 Manager
   │
   ├── 📁 Creates Projects
   ├── 📋 Creates Tasks
   └── 👥 Assigns Employees
              │
              ▼
        👨‍💻 Employee
              │
              ├── 🛠️ Completes Work
              └── 📝 Submits Daily Update
                         │
                         ▼
                    👨‍💼 Manager
                         │
                      🔎 Reviews
```

The application provides different workflows and permissions for **Managers** and **Employees**.

---

## ✨ Key Features

* 🔐 Sanctum authentication & role-based authorization
* 👥 Employee and team management
* 📁 Project management & employee assignments
* 📋 Task management & deadlines
* 📝 Daily work updates, hours & blockers
* 📎 Project and update file uploads
* 👤 Profile management & profile photos
* 📊 Manager and employee dashboards
* 📱 Responsive enterprise SaaS interface
* 🛡️ Protected demo accounts

---

## 🏗️ Architecture

```text
Next.js + React + TypeScript
            │
         REST API
            ▼
   Laravel 12 + Sanctum
            │
        Eloquent ORM
            ▼
       PostgreSQL
```

**Frontend:** UI, navigation, state & API integration

**Backend:** Authentication, authorization, validation & business logic

**Database:** Users, projects, tasks, assignments, updates & files

---

## 🛠️ Tech Stack

| Layer      | Technologies                             |
| ---------- | ---------------------------------------- |
| Frontend   | Next.js, React, TypeScript, Tailwind CSS |
| Backend    | Laravel 12, PHP 8.2, Sanctum             |
| Database   | PostgreSQL                               |
| Deployment | Vercel, Render, Docker                   |
| Tools      | Git, GitHub                              |

---

## 🚀 Run Locally

### Backend

```text
git clone https://github.com/Abhishek-105/WorkSphere.git
cd WorkSphere

composer install
copy .env.example .env
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

Create `nexra-frontend/.env.local`:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

**Frontend:** `http://localhost:3000`

**Backend:** `http://127.0.0.1:8000`

---

## 🎯 What This Project Demonstrates

WorkSphere demonstrates practical full-stack development across:

**Architecture → Database Design → REST APIs → Authentication → Authorization → Frontend Integration → File Handling → Responsive UI → Docker → Production Deployment**

The goal was to build a realistic business application rather than another isolated CRUD project.

---

## 👨‍💻 Author

**Abhishek Kumar**

Full-Stack Developer

[GitHub](https://github.com/Abhishek-105)
