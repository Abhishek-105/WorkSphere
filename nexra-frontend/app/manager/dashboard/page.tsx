"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type User = {
    id: number;
    name: string;
    email?: string;
    role?: string;
    designation?: string;
    status?: string;
};

type Project = {
    id: number;
    title?: string;
    name?: string;
    status?: string;
    created_at?: string;
    employees?: User[];
};

type Task = {
    id: number;
    title?: string;
    status?: string;
    priority?: string;
    deadline?: string;
    project?: Project;
    assigned_employee?: User;
    assignedEmployee?: User;
};

type DailyUpdate = {
    id: number;
    work_description?: string;
    status?: string;
    update_date?: string;
    created_at?: string;
    employee?: User;
    project?: Project;
};

type Statistics = {
    total_tasks?: number;
    pending_tasks?: number;
    in_progress_tasks?: number;
    completed_tasks?: number;
    overdue_tasks?: number;
    tasks_due_today?: number;
    tasks_due_this_week?: number;
    task_completion_percentage?: number;

    total_projects?: number;
    active_projects?: number;
    completed_projects?: number;
    pending_projects?: number;
    on_hold_projects?: number;

    total_employees?: number;
    today_updates?: number;
    total_daily_updates?: number;
};

type DashboardResponse = {
    message?: string;
    stats?: Statistics;
    recent_employees?: User[];
    recent_updates?: DailyUpdate[];
    recent_tasks?: Task[];
    recent_projects?: Project[];
    completed_projects?: Project[];
    overdue_tasks?: Task[];
    project_progress?: unknown[];
    task_status_distribution?: unknown;
};

function numberValue(value?: number) {
    return Number(value || 0);
}

function formatDate(value?: string) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getProjectTitle(project?: Project) {
    return project?.title || project?.name || "No project";
}

function formatStatus(status?: string) {
    if (!status) {
        return "Pending";
    }

    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusStyle(status?: string) {
    const normalized = (status || "")
        .toLowerCase()
        .replace(/[\s-]/g, "_");

    if (
        normalized === "completed" ||
        normalized === "complete" ||
        normalized === "done" ||
        normalized === "reviewed" ||
        normalized === "active"
    ) {
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (
        normalized === "in_progress" ||
        normalized === "inprogress"
    ) {
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }

    if (
        normalized === "on_hold" ||
        normalized === "blocked"
    ) {
        return "bg-amber-50 text-amber-700 border-amber-200";
    }

    if (
        normalized === "overdue" ||
        normalized === "rejected"
    ) {
        return "bg-red-50 text-red-700 border-red-200";
    }

    return "bg-slate-100 text-slate-600 border-slate-200";
}

function priorityStyle(priority?: string) {
    const normalized = (priority || "").toLowerCase();

    if (
        normalized === "high" ||
        normalized === "urgent"
    ) {
        return "text-red-600";
    }

    if (normalized === "medium") {
        return "text-amber-600";
    }

    if (normalized === "low") {
        return "text-emerald-600";
    }

    return "text-slate-500";
}

function StatIcon({
    type,
}: {
    type: "tasks" | "projects" | "team" | "updates";
}) {
    if (type === "tasks") {
        return (
            <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
            >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
        );
    }

    if (type === "projects") {
        return (
            <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
            >
                <path d="M3 7h5l2 2h11v10a2 2 0 01-2 2H3z" />
                <path d="M3 7V5a2 2 0 012-2h5l2 2" />
            </svg>
        );
    }

    if (type === "team") {
        return (
            <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
            >
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
        );
    }

    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8z" />
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
        </svg>
    );
}

function RefreshIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M20 11a8.1 8.1 0 00-15.5-2M4 5v4h4" />
            <path d="M4 13a8.1 8.1 0 0015.5 2M20 19v-4h-4" />
        </svg>
    );
}

function StatCard({
    label,
    value,
    description,
    type,
    href,
}: {
    label: string;
    value: number;
    description: string;
    type: "tasks" | "projects" | "team" | "updates";
    href: string;
}) {
    return (
        <Link
            href={href}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
        >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-50 opacity-60 blur-2xl transition group-hover:opacity-100" />

            <div className="relative">
                <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                        <StatIcon type={type} />
                    </div>

                    <span className="text-slate-300 transition group-hover:text-indigo-400">
                        <ArrowIcon />
                    </span>
                </div>

                <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        {label}
                    </p>

                    <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                        {value}
                    </p>

                    <p className="mt-1.5 text-xs text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
        </Link>
    );
}

function ProgressBar({
    value,
    type = "primary",
}: {
    value: number;
    type?: "primary" | "success";
}) {
    const safeValue = Math.min(100, Math.max(0, value));

    return (
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
                className={`h-full rounded-full transition-all duration-500 ${
                    type === "success"
                        ? "bg-emerald-500"
                        : "bg-indigo-600"
                }`}
                style={{
                    width: `${safeValue}%`,
                }}
            />
        </div>
    );
}

export default function ManagerDashboardPage() {
    const { user, token, loading: authLoading } = useAuth();

    const [dashboard, setDashboard] =
        useState<DashboardResponse | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = useCallback(async () => {
        if (!token) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response =
                await apiFetch<DashboardResponse>(
                    "/manager/dashboard",
                    {
                        token,
                    }
                );

            setDashboard(response);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load dashboard."
            );
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!authLoading && token) {
            fetchDashboard();
        }
    }, [authLoading, token, fetchDashboard]);

    if (authLoading || loading) {
        return (
            <div className="space-y-6">
                <div className="h-40 animate-pulse rounded-2xl bg-[#172554]" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-36 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />
                    <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <svg
                        className="h-6 w-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                    </svg>
                </div>

                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                    Dashboard unavailable
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    {error}
                </p>

                <button
                    onClick={fetchDashboard}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                    <RefreshIcon />
                    Try again
                </button>
            </div>
        );
    }

    const stats = dashboard?.stats || {};

    const totalTasks = numberValue(stats.total_tasks);
    const pendingTasks = numberValue(stats.pending_tasks);
    const inProgressTasks = numberValue(
        stats.in_progress_tasks
    );
    const completedTasks = numberValue(
        stats.completed_tasks
    );

    const totalProjects = numberValue(
        stats.total_projects
    );
    const activeProjects = numberValue(
        stats.active_projects
    );
    const completedProjects = numberValue(
        stats.completed_projects
    );

    const totalEmployees = numberValue(
        stats.total_employees
    );

    const todayUpdates = numberValue(
        stats.today_updates
    );

    const taskCompletion = Math.round(
        Number(stats.task_completion_percentage || 0)
    );

    const projectCompletion =
        totalProjects > 0
            ? Math.round(
                  (completedProjects / totalProjects) * 100
              )
            : 0;

    const recentProjects =
        dashboard?.recent_projects?.slice(0, 4) || [];

    const recentTasks =
        dashboard?.recent_tasks?.slice(0, 4) || [];

    const recentUpdates =
        dashboard?.recent_updates?.slice(0, 4) || [];

    const managerName =
        user?.name?.split(" ")[0] || "Manager";

    return (
        <div className="space-y-6">
            {/* =====================================================
                WELCOME HEADER
            ====================================================== */}
            <section className="relative overflow-hidden rounded-2xl bg-[#172554] shadow-lg">
                <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

                <div className="absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

                <div className="relative flex flex-col justify-between gap-6 p-6 sm:p-7 lg:flex-row lg:items-center">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/10" />

                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-200">
                                Manager Dashboard
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Welcome back, {managerName}
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/80">
                            Monitor projects, tasks and team
                            activity from one central workspace.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-bold text-[#172554] shadow-sm">
                            {managerName
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white">
                                Nexra Workspace
                            </p>

                            <div className="mt-0.5 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                                <span className="text-xs text-indigo-100/70">
                                    Workspace active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =====================================================
                KPI CARDS
            ====================================================== */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total Tasks"
                    value={totalTasks}
                    description={`${pendingTasks} pending tasks`}
                    type="tasks"
                    href="/manager/tasks"
                />

                <StatCard
                    label="Projects"
                    value={totalProjects}
                    description={`${activeProjects} currently active`}
                    type="projects"
                    href="/manager/projects"
                />

                <StatCard
                    label="Team Members"
                    value={totalEmployees}
                    description="Active employees"
                    type="team"
                    href="/manager/team"
                />

                <StatCard
                    label="Daily Updates"
                    value={todayUpdates}
                    description="Updates submitted today"
                    type="updates"
                    href="/manager/daily-updates"
                />
            </section>

            {/* =====================================================
                OPERATIONAL OVERVIEW
            ====================================================== */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Task Overview */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
                                Task Overview
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Current task completion across the
                                workspace
                            </p>
                        </div>

                        <Link
                            href="/manager/tasks"
                            className="group flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition hover:text-indigo-800"
                        >
                            View all

                            <span className="transition-transform group-hover:translate-x-0.5">
                                <ArrowIcon />
                            </span>
                        </Link>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5">
                        <div className="mb-3 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-medium text-slate-500">
                                    Completion rate
                                </p>

                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    {taskCompletion}%
                                </p>
                            </div>

                            <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                {completedTasks} completed
                            </span>
                        </div>

                        <ProgressBar value={taskCompletion} />
                    </div>

                    <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200">
                        <div className="px-3 first:pl-0">
                            <p className="text-xs text-slate-500">
                                Pending
                            </p>

                            <p className="mt-1 text-lg font-bold text-slate-900">
                                {pendingTasks}
                            </p>
                        </div>

                        <div className="px-4">
                            <p className="text-xs text-slate-500">
                                In progress
                            </p>

                            <p className="mt-1 text-lg font-bold text-indigo-600">
                                {inProgressTasks}
                            </p>
                        </div>

                        <div className="px-4">
                            <p className="text-xs text-slate-500">
                                Completed
                            </p>

                            <p className="mt-1 text-lg font-bold text-emerald-600">
                                {completedTasks}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-xl border border-red-100 bg-red-50/60 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm">
                                <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M12 9v4" />
                                    <path d="M12 17h.01" />
                                    <path d="M10.3 3.9L2.6 17a2 2 0 001.7 3h15.4a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
                                </svg>
                            </span>

                            <div>
                                <p className="text-xs font-semibold text-red-700">
                                    Overdue tasks
                                </p>

                                <p className="text-[11px] text-red-600/80">
                                    Tasks requiring attention
                                </p>
                            </div>
                        </div>

                        <span className="text-lg font-bold text-red-700">
                            {numberValue(stats.overdue_tasks)}
                        </span>
                    </div>
                </div>

                {/* Project Overview */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
                                Project Overview
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Current project portfolio status
                            </p>
                        </div>

                        <Link
                            href="/manager/projects"
                            className="group flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition hover:text-indigo-800"
                        >
                            View all

                            <span className="transition-transform group-hover:translate-x-0.5">
                                <ArrowIcon />
                            </span>
                        </Link>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5">
                        <div className="mb-3 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-medium text-slate-500">
                                    Completed projects
                                </p>

                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    {projectCompletion}%
                                </p>
                            </div>

                            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                {completedProjects} completed
                            </span>
                        </div>

                        <ProgressBar
                            value={projectCompletion}
                            type="success"
                        />
                    </div>

                    <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200">
                        <div className="px-3 first:pl-0">
                            <p className="text-xs text-slate-500">
                                Total
                            </p>

                            <p className="mt-1 text-lg font-bold text-slate-900">
                                {totalProjects}
                            </p>
                        </div>

                        <div className="px-4">
                            <p className="text-xs text-slate-500">
                                Active
                            </p>

                            <p className="mt-1 text-lg font-bold text-indigo-600">
                                {activeProjects}
                            </p>
                        </div>

                        <div className="px-4">
                            <p className="text-xs text-slate-500">
                                Completed
                            </p>

                            <p className="mt-1 text-lg font-bold text-emerald-600">
                                {completedProjects}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                                <StatIcon type="updates" />
                            </span>

                            <div>
                                <p className="text-xs font-semibold text-indigo-700">
                                    Team activity
                                </p>

                                <p className="text-[11px] text-indigo-600/80">
                                    Daily updates submitted today
                                </p>
                            </div>
                        </div>

                        <span className="text-lg font-bold text-indigo-700">
                            {todayUpdates}
                        </span>
                    </div>
                </div>
            </section>

            {/* =====================================================
                RECENT PROJECTS + RECENT TASKS
            ====================================================== */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Recent Projects */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="relative overflow-hidden bg-[#172554] px-6 py-5">
                        <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

                        <div className="relative flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-[15px] font-semibold text-white">
                                    Recent Projects
                                </h2>

                                <p className="mt-1 text-xs text-indigo-100/70">
                                    Latest projects added to the
                                    workspace
                                </p>
                            </div>

                            <Link
                                href="/manager/projects"
                                className="group flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                            >
                                View all

                                <span className="transition-transform group-hover:translate-x-0.5">
                                    <ArrowIcon />
                                </span>
                            </Link>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100 px-6">
                        {recentProjects.length > 0 ? (
                            recentProjects.map(
                                (project, index) => (
                                    <Link
                                        key={project.id}
                                        href={`/manager/projects/${project.id}`}
                                        className="group flex items-center gap-4 py-4 first:pt-5 last:pb-5"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600 ring-1 ring-indigo-100">
                                            {getProjectTitle(
                                                project
                                            )
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="truncate text-sm font-semibold text-slate-900 transition group-hover:text-indigo-700">
                                                    {getProjectTitle(
                                                        project
                                                    )}
                                                </p>

                                                <span
                                                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusStyle(
                                                        project.status
                                                    )}`}
                                                >
                                                    {formatStatus(
                                                        project.status
                                                    )}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Project {index + 1}

                                                <span className="mx-1 text-slate-300">
                                                    •
                                                </span>

                                                {formatDate(
                                                    project.created_at
                                                )}
                                            </p>
                                        </div>

                                        <span className="hidden text-slate-300 transition group-hover:text-indigo-400 sm:block">
                                            <ArrowIcon />
                                        </span>
                                    </Link>
                                )
                            )
                        ) : (
                            <div className="py-10 text-center">
                                <p className="text-sm font-medium text-slate-600">
                                    No projects found
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    New projects will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Tasks */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="relative overflow-hidden bg-[#172554] px-6 py-5">
                        <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

                        <div className="relative flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-[15px] font-semibold text-white">
                                    Recent Tasks
                                </h2>

                                <p className="mt-1 text-xs text-indigo-100/70">
                                    Latest tasks across your
                                    projects
                                </p>
                            </div>

                            <Link
                                href="/manager/tasks"
                                className="group flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                            >
                                View all

                                <span className="transition-transform group-hover:translate-x-0.5">
                                    <ArrowIcon />
                                </span>
                            </Link>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100 px-6">
                        {recentTasks.length > 0 ? (
                            recentTasks.map((task) => (
                                <Link
                                    key={task.id}
                                    href={`/manager/tasks/${task.id}`}
                                    className="group flex items-center gap-4 py-4 first:pt-5 last:pb-5"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                                        <svg
                                            className="h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <rect
                                                x="3"
                                                y="4"
                                                width="18"
                                                height="16"
                                                rx="2"
                                            />

                                            <path d="M8 9h8M8 13h5" />
                                        </svg>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="truncate text-sm font-semibold text-slate-900 transition group-hover:text-indigo-700">
                                                {task.title ||
                                                    "Untitled task"}
                                            </p>

                                            <span
                                                className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusStyle(
                                                    task.status
                                                )}`}
                                            >
                                                {formatStatus(
                                                    task.status
                                                )}
                                            </span>
                                        </div>

                                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                            <span className="truncate">
                                                {getProjectTitle(
                                                    task.project
                                                )}
                                            </span>

                                            <span className="text-slate-300">
                                                •
                                            </span>

                                            <span>
                                                {formatDate(
                                                    task.deadline
                                                )}
                                            </span>

                                            {task.priority && (
                                                <>
                                                    <span className="hidden text-slate-300 sm:block">
                                                        •
                                                    </span>

                                                    <span
                                                        className={`hidden font-semibold sm:block ${priorityStyle(
                                                            task.priority
                                                        )}`}
                                                    >
                                                        {formatStatus(
                                                            task.priority
                                                        )}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <span className="hidden text-slate-300 transition group-hover:text-indigo-400 sm:block">
                                        <ArrowIcon />
                                    </span>
                                </Link>
                            ))
                        ) : (
                            <div className="py-10 text-center">
                                <p className="text-sm font-medium text-slate-600">
                                    No recent tasks
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    New tasks will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* =====================================================
                RECENT DAILY UPDATES
            ====================================================== */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative overflow-hidden bg-[#172554] px-6 py-5">
                    <div className="absolute -right-12 -top-20 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

                    <div className="relative flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-[15px] font-semibold text-white">
                                Recent Daily Updates
                            </h2>

                            <p className="mt-1 text-xs text-indigo-100/70">
                                Latest work updates submitted by
                                your team
                            </p>
                        </div>

                        <Link
                            href="/manager/daily-updates"
                            className="group flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                        >
                            View all

                            <span className="transition-transform group-hover:translate-x-0.5">
                                <ArrowIcon />
                            </span>
                        </Link>
                    </div>
                </div>

                <div className="px-6 pb-6">
                    <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                        <div className="hidden grid-cols-[2fr_1.4fr_1fr_120px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 md:grid">
                            <span>Employee</span>
                            <span>Project</span>
                            <span>Date</span>
                            <span>Status</span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {recentUpdates.length > 0 ? (
                                recentUpdates.map((update) => {
                                    const employeeName =
                                        update.employee?.name ||
                                        "Employee";

                                    return (
                                        <Link
                                            key={update.id}
                                            href={`/manager/daily-updates/${update.id}`}
                                            className="group grid gap-3 px-5 py-4 transition hover:bg-indigo-50/40 md:grid-cols-[2fr_1.4fr_1fr_120px] md:items-center md:gap-4"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600 ring-1 ring-indigo-100">
                                                    {employeeName
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                                                        {employeeName}
                                                    </p>

                                                    <p className="mt-0.5 truncate text-xs text-slate-500">
                                                        {update.work_description ||
                                                            "Work update submitted"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="min-w-0 pl-12 md:pl-0">
                                                <p className="truncate text-xs font-medium text-slate-700">
                                                    {getProjectTitle(
                                                        update.project
                                                    )}
                                                </p>
                                            </div>

                                            <div className="pl-12 text-xs text-slate-500 md:pl-0">
                                                {formatDate(
                                                    update.update_date ||
                                                        update.created_at
                                                )}
                                            </div>

                                            <div className="pl-12 md:pl-0">
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusStyle(
                                                        update.status
                                                    )}`}
                                                >
                                                    {formatStatus(
                                                        update.status
                                                    )}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="py-10 text-center">
                                    <p className="text-sm font-medium text-slate-600">
                                        No daily updates yet
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Team submissions will
                                        appear here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* =====================================================
                FOOTER
            ====================================================== */}
            <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row">
                <div>
                    <p className="text-sm font-semibold text-slate-800">
                        Nexra Workspace
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                        Your team's daily work at a glance.
                    </p>
                </div>

                <button
                    onClick={fetchDashboard}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshIcon />
                    Refresh dashboard
                </button>
            </div>
        </div>
    );
}