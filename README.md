# WorkSphere

### Employee Daily Work & Project Management Platform

WorkSphere is a full-stack internal workspace designed to help companies manage employees, projects, tasks, assignments, and daily work updates from one platform.

The project was built to simulate a real-world business application with a separate frontend, REST API, authentication, role-based access, relational data, file management, and production deployment.

---

## 🌐 Live Application

**Frontend:** YOUR_VERCEL_URL

**Backend API:** https://worksphere-api-qvnl.onrender.com

**GitHub:** https://github.com/Abhishek-105/WorkSphere

---

## 🔐 Demo Access

WorkSphere does not provide public registration because it represents an internal company workspace.

Instead, dedicated demo accounts are available so anyone can safely explore the application.

| Role | Email | Password |
|---|---|---|
| Manager | `demo.manager@worksphere.com` | `Demo@123456` |
| Employee | `demo.employee@worksphere.com` | `Demo@123456` |

### Demo account protection

The demo accounts are intentionally restricted from changing their shared email address or password.

This allows multiple people to explore the same demo environment without breaking access for other visitors.

---

## 💡 What Is WorkSphere?

WorkSphere connects managers and employees through a structured daily-work workflow.

### Manager

A manager can:

- Create and manage projects
- Create and manage tasks
- Manage employees
- Assign employees to projects
- Assign tasks
- Review daily work updates
- View project information
- Manage project files
- Manage their own profile

### Employee

An employee can:

- View assigned projects
- View assigned tasks
- Submit daily work updates
- Track previous work
- View project information
- Upload a profile photo
- Manage their own profile

The application keeps these workflows separate through role-based access control.

---

## 🏗️ Architecture

WorkSphere follows a separated frontend and backend architecture.

```text
                    WorkSphere

              ┌─────────────────┐
              │   Next.js App   │
              │    Frontend     │
              └────────┬────────┘
                       │
                       │ REST API
                       ▼
              ┌─────────────────┐
              │ Laravel Backend │
              │   API Layer     │
              └────────┬────────┘
                       │
                       │ Eloquent
                       ▼
              ┌─────────────────┐
              │   PostgreSQL    │
              │    Database     │
              └─────────────────┘
