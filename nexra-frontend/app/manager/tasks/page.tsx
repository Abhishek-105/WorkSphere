"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useRouter,
    useSearchParams,
} from "next/navigation";

import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../lib/api";

type User = {
    id: number;
    name: string;
    email?: string;
    designation?: string | null;
};

type Project = {
    id: number;
    title: string;
};

type Task = {
    id: number;
    project_id: number;
    assigned_to?: number | null;
    created_by?: number | null;
    title: string;
    description?: string | null;
    status?: string | null;
    priority?: string | null;
    deadline?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    project?: Project | null;
    assignee?: User | null;
    assigned_employee?: User | null;
};

type PaginatedTasks = {
    data: Task[];
    current_page?: number;
    last_page?: number;
    total?: number;
};

type TasksResponse = {
    message: string;
    counts?: {
        all?: number;
        pending?: number;
        in_progress?: number;
        completed?: number;
        done?: number;
    };
    tasks:
        | Task[]
        | PaginatedTasks;
};

function getTasks(
    tasks: Task[] | PaginatedTasks
): Task[] {
    if (Array.isArray(tasks)) {
        return tasks;
    }

    return tasks.data || [];
}

function getPagination(
    tasks: Task[] | PaginatedTasks
) {
    if (Array.isArray(tasks)) {
        return {
            currentPage: 1,
            lastPage: 1,
            total: tasks.length,
        };
    }

    return {
        currentPage: tasks.current_page || 1,
        lastPage: tasks.last_page || 1,
        total: tasks.total || tasks.data.length,
    };
}

function normalizeStatus(
    status?: string | null
): string {
    const value = (
        status || "pending"
    ).toLowerCase().trim();

    if (
        value === "done" ||
        value === "complete" ||
        value === "completed"
    ) {
        return "completed";
    }

    if (
        value === "in progress" ||
        value === "in-progress" ||
        value === "in_progress"
    ) {
        return "in_progress";
    }

    return "pending";
}

function statusLabel(
    status?: string | null
): string {
    const normalized =
        normalizeStatus(status);

    if (normalized === "completed") {
        return "Completed";
    }

    if (normalized === "in_progress") {
        return "In Progress";
    }

    return "Pending";
}

function statusClasses(
    status?: string | null
): string {
    const normalized =
        normalizeStatus(status);

    if (normalized === "completed") {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (normalized === "in_progress") {
        return "border-blue-200 bg-blue-50 text-blue-700";
    }

    return "border-amber-200 bg-amber-50 text-amber-700";
}

function priorityLabel(
    priority?: string | null
): string {
    if (!priority) {
        return "Medium";
    }

    return (
        priority.charAt(0).toUpperCase() +
        priority.slice(1).toLowerCase()
    );
}

function priorityClasses(
    priority?: string | null
): string {
    const value = (
        priority || "medium"
    ).toLowerCase();

    if (value === "high") {
        return "border-red-200 bg-red-50 text-red-700";
    }

    if (value === "low") {
        return "border-slate-200 bg-slate-100 text-slate-600";
    }

    return "border-indigo-200 bg-indigo-50 text-indigo-700";
}

function formatDate(
    date?: string | null
): string {
    if (!date) {
        return "No deadline";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

function isOverdue(
    deadline?: string | null,
    status?: string | null
): boolean {
    if (
        !deadline ||
        normalizeStatus(status) === "completed"
    ) {
        return false;
    }

    const deadlineDate =
        new Date(deadline);

    if (
        Number.isNaN(
            deadlineDate.getTime()
        )
    ) {
        return false;
    }

    deadlineDate.setHours(
        23,
        59,
        59,
        999
    );

    return deadlineDate.getTime() <
        Date.now();
}

function SearchIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <circle
                cx="11"
                cy="11"
                r="7"
            />
            <path
                strokeLinecap="round"
                d="m20 20-3.5-3.5"
            />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path
                strokeLinecap="round"
                d="M12 5v14"
            />
            <path
                strokeLinecap="round"
                d="M5 12h14"
            />
        </svg>
    );
}

function ClipboardIcon({
    className = "h-5 w-5",
}: {
    className?: string;
}) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <rect
                x="5"
                y="4"
                width="14"
                height="17"
                rx="2"
            />
            <path
                strokeLinecap="round"
                d="M9 4.5V3h6v1.5"
            />
            <path
                strokeLinecap="round"
                d="M9 10h6"
            />
            <path
                strokeLinecap="round"
                d="M9 14h4"
            />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 18 6-6-6-6"
            />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <rect
                x="3"
                y="4.5"
                width="18"
                height="16"
                rx="2"
            />
            <path
                strokeLinecap="round"
                d="M8 2.5v4M16 2.5v4M3 9h18"
            />
        </svg>
    );
}

function FolderIcon() {
    return (
        <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7.5A2.5 2.5 0 0 1 6.5 5h4l2 2h5A2.5 2.5 0 0 1 20 9.5v7A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
            />
        </svg>
    );
}

export default function ManagerTasksPage() {
    const router = useRouter();

    const searchParams =
        useSearchParams();

    const {
        user,
        token,
        loading: authLoading,
    } = useAuth();

    const [tasks, setTasks] =
        useState<Task[]>([]);

    const [counts, setCounts] =
        useState({
            all: 0,
            pending: 0,
            in_progress: 0,
            completed: 0,
        });

    const [search, setSearch] =
        useState(
            searchParams.get("search") || ""
        );

    const [status, setStatus] =
        useState(
            searchParams.get("status") || "all"
        );

    const [priority, setPriority] =
        useState(
            searchParams.get("priority") || "all"
        );

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [currentPage, setCurrentPage] =
        useState(1);

    const [lastPage, setLastPage] =
        useState(1);

    const [total, setTotal] =
        useState(0);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (
            !user ||
            user.role !== "manager" ||
            !token
        ) {
            router.replace("/");
            return;
        }

        async function loadTasks() {
            setLoading(true);
            setError("");

            try {
                const query =
                    new URLSearchParams();

                if (search.trim()) {
                    query.set(
                        "search",
                        search.trim()
                    );
                }

                if (
                    status &&
                    status !== "all"
                ) {
                    query.set(
                        "status",
                        status
                    );
                }

                if (
                    priority &&
                    priority !== "all"
                ) {
                    query.set(
                        "priority",
                        priority
                    );
                }

                query.set(
                    "page",
                    String(currentPage)
                );

                const endpoint =
                    `/manager/tasks?${query.toString()}`;

                const response =
                    await apiFetch<TasksResponse>(
                        endpoint,
                        {
                            method: "GET",
                            token,
                        }
                    );

                const loadedTasks =
                    getTasks(response.tasks);

                const pagination =
                    getPagination(
                        response.tasks
                    );

                setTasks(
                    loadedTasks
                );

                setCounts({
                    all:
                        response.counts?.all ??
                        pagination.total,

                    pending:
                        response.counts?.pending ??
                        loadedTasks.filter(
                            (task) =>
                                normalizeStatus(
                                    task.status
                                ) === "pending"
                        ).length,

                    in_progress:
                        response.counts
                            ?.in_progress ??
                        loadedTasks.filter(
                            (task) =>
                                normalizeStatus(
                                    task.status
                                ) ===
                                "in_progress"
                        ).length,

                    completed:
                        response.counts
                            ?.completed ??
                        response.counts?.done ??
                        loadedTasks.filter(
                            (task) =>
                                normalizeStatus(
                                    task.status
                                ) === "completed"
                        ).length,
                });

                setLastPage(
                    pagination.lastPage
                );

                setTotal(
                    pagination.total
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load tasks."
                );

                setTasks([]);
            } finally {
                setLoading(false);
            }
        }

        loadTasks();
    }, [
        authLoading,
        user,
        token,
        router,
        search,
        status,
        priority,
        currentPage,
    ]);

    function handleSearchChange(
        value: string
    ) {
        setSearch(value);
        setCurrentPage(1);
    }

    function handleStatusChange(
        value: string
    ) {
        setStatus(value);
        setCurrentPage(1);
    }

    function handlePriorityChange(
        value: string
    ) {
        setPriority(value);
        setCurrentPage(1);
    }

    if (authLoading || !user) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

                    <p className="mt-4 text-sm font-medium text-slate-500">
                        Loading tasks...
                    </p>
                </div>
            </div>
        );
    }

    if (user.role !== "manager") {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <section className="relative overflow-hidden rounded-2xl bg-[#172554] shadow-lg">
                <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

                <div className="absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

                <div className="relative flex flex-col justify-between gap-6 p-6 sm:p-7 lg:flex-row lg:items-center">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-indigo-200">
                            <span>
                                Workspace
                            </span>

                            <span className="text-indigo-400">
                                /
                            </span>

                            <span className="text-white">
                                Tasks
                            </span>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-indigo-200">
                                <ClipboardIcon />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    Tasks
                                </h1>

                                <p className="mt-1 text-sm text-indigo-100/75">
                                    Manage assignments,
                                    priorities and project
                                    progress.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/manager/tasks/create"
                            )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#172554] shadow-sm transition hover:bg-indigo-50 hover:shadow-md"
                    >
                        <PlusIcon />
                        New Task
                    </button>
                </div>
            </section>

            {/* Statistics */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                All Tasks
                            </p>

                            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                {counts.all}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <ClipboardIcon className="h-4.5 w-4.5" />
                        </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                        Across all projects
                    </p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                                Pending
                            </p>

                            <p className="mt-2 text-2xl font-bold tracking-tight text-amber-800">
                                {counts.pending}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        </div>
                    </div>

                    <p className="mt-3 text-xs text-amber-700/70">
                        Waiting to start
                    </p>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                                In Progress
                            </p>

                            <p className="mt-2 text-2xl font-bold tracking-tight text-blue-800">
                                {counts.in_progress}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        </div>
                    </div>

                    <p className="mt-3 text-xs text-blue-700/70">
                        Currently active
                    </p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                                Completed
                            </p>

                            <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-800">
                                {counts.completed}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </div>
                    </div>

                    <p className="mt-3 text-xs text-emerald-700/70">
                        Finished tasks
                    </p>
                </div>
            </section>

            {/* Filters */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            Find Tasks
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Search and filter your workspace tasks.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <SearchIcon />
                        </div>

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                handleSearchChange(
                                    event.target.value
                                )
                            }
                            placeholder="Search tasks..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(event) =>
                            handleStatusChange(
                                event.target.value
                            )
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                    >
                        <option value="all">
                            All Statuses
                        </option>

                        <option value="pending">
                            Pending
                        </option>

                        <option value="in_progress">
                            In Progress
                        </option>

                        <option value="completed">
                            Completed
                        </option>
                    </select>

                    <select
                        value={priority}
                        onChange={(event) =>
                            handlePriorityChange(
                                event.target.value
                            )
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                    >
                        <option value="all">
                            All Priorities
                        </option>

                        <option value="high">
                            High
                        </option>

                        <option value="medium">
                            Medium
                        </option>

                        <option value="low">
                            Low
                        </option>
                    </select>
                </div>
            </section>

            {/* Error */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                    <p className="text-sm font-semibold text-red-800">
                        Unable to load tasks
                    </p>

                    <p className="mt-1 text-xs text-red-600">
                        {error}
                    </p>
                </div>
            )}

            {/* Task List */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative overflow-hidden bg-[#172554] px-6 py-5">
                    <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

                    <div className="relative flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-base font-semibold text-white">
                                All Tasks
                            </h2>

                            <p className="mt-1 text-xs text-indigo-100/70">
                                {total} task
                                {total === 1
                                    ? ""
                                    : "s"}{" "}
                                found
                            </p>
                        </div>

                        <div className="hidden rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-100 sm:block">
                            Page {currentPage} of{" "}
                            {lastPage}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="divide-y divide-slate-100">
                        {[1, 2, 3, 4, 5].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="animate-pulse p-6"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-200" />

                                        <div className="flex-1">
                                            <div className="h-4 w-1/3 rounded bg-slate-200" />

                                            <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />
                                        </div>

                                        <div className="hidden h-6 w-20 rounded-full bg-slate-200 sm:block" />
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <ClipboardIcon className="h-7 w-7" />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-900">
                            No tasks found
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Try changing your search or
                            filters, or create a new task.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/manager/tasks/create"
                                )
                            }
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#172554] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-900"
                        >
                            <PlusIcon />
                            Create Task
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Task
                                        </th>

                                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Project
                                        </th>

                                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Assignee
                                        </th>

                                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Priority
                                        </th>

                                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Status
                                        </th>

                                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Deadline
                                        </th>

                                        <th className="px-6 py-3.5" />
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {tasks.map(
                                        (task) => {
                                            const assignee =
                                                task.assignee ||
                                                task.assigned_employee;

                                            const overdue =
                                                isOverdue(
                                                    task.deadline,
                                                    task.status
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        task.id
                                                    }
                                                    onClick={() =>
                                                        router.push(
                                                            `/manager/tasks/${task.id}`
                                                        )
                                                    }
                                                    className="group cursor-pointer transition hover:bg-indigo-50/40"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-[#172554] group-hover:text-white">
                                                                <ClipboardIcon className="h-4 w-4" />
                                                            </div>

                                                            <div className="min-w-0 max-w-xs">
                                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                                    {
                                                                        task.title
                                                                    }
                                                                </p>

                                                                <p className="mt-1 truncate text-xs text-slate-500">
                                                                    {task.description ||
                                                                        "No description"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                            <FolderIcon />

                                                            <span className="max-w-[150px] truncate">
                                                                {task
                                                                    .project
                                                                    ?.title ||
                                                                    "—"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {assignee ? (
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#172554] text-xs font-bold text-white">
                                                                    {assignee.name
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()}
                                                                </div>

                                                                <p className="max-w-[130px] truncate text-sm font-medium text-slate-700">
                                                                    {
                                                                        assignee.name
                                                                    }
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                                                                Unassigned
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${priorityClasses(
                                                                task.priority
                                                            )}`}
                                                        >
                                                            {priorityLabel(
                                                                task.priority
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses(
                                                                task.status
                                                            )}`}
                                                        >
                                                            {statusLabel(
                                                                task.status
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div
                                                            className={`flex items-center gap-1.5 text-xs ${
                                                                overdue
                                                                    ? "font-semibold text-red-600"
                                                                    : "text-slate-500"
                                                            }`}
                                                        >
                                                            <CalendarIcon />

                                                            <span>
                                                                {overdue
                                                                    ? "Overdue · "
                                                                    : ""}
                                                                {formatDate(
                                                                    task.deadline
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-right">
                                                        <span className="inline-flex text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-600">
                                                            <ChevronRightIcon />
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="divide-y divide-slate-100 lg:hidden">
                            {tasks.map(
                                (task) => {
                                    const assignee =
                                        task.assignee ||
                                        task.assigned_employee;

                                    const overdue =
                                        isOverdue(
                                            task.deadline,
                                            task.status
                                        );

                                    return (
                                        <button
                                            key={
                                                task.id
                                            }
                                            type="button"
                                            onClick={() =>
                                                router.push(
                                                    `/manager/tasks/${task.id}`
                                                )
                                            }
                                            className="block w-full p-5 text-left transition hover:bg-indigo-50/40"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                                    <ClipboardIcon className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                                {
                                                                    task.title
                                                                }
                                                            </p>

                                                            <p className="mt-1 truncate text-xs text-slate-500">
                                                                {task
                                                                    .project
                                                                    ?.title ||
                                                                    "No project"}
                                                            </p>
                                                        </div>

                                                        <ChevronRightIcon />
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <span
                                                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses(
                                                                task.status
                                                            )}`}
                                                        >
                                                            {statusLabel(
                                                                task.status
                                                            )}
                                                        </span>

                                                        <span
                                                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${priorityClasses(
                                                                task.priority
                                                            )}`}
                                                        >
                                                            {priorityLabel(
                                                                task.priority
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 flex items-center justify-between gap-3">
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#172554] text-xs font-bold text-white">
                                                                {assignee
                                                                    ? assignee.name
                                                                          .charAt(
                                                                              0
                                                                          )
                                                                          .toUpperCase()
                                                                    : "?"}
                                                            </div>

                                                            <span className="max-w-[150px] truncate text-xs text-slate-500">
                                                                {assignee
                                                                    ?.name ||
                                                                    "Unassigned"}
                                                            </span>
                                                        </div>

                                                        <span
                                                            className={`flex items-center gap-1 text-xs ${
                                                                overdue
                                                                    ? "font-semibold text-red-600"
                                                                    : "text-slate-500"
                                                            }`}
                                                        >
                                                            <CalendarIcon />

                                                            {overdue
                                                                ? "Overdue · "
                                                                : ""}

                                                            {formatDate(
                                                                task.deadline
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {!loading &&
                    tasks.length > 0 &&
                    lastPage > 1 && (
                        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-xs text-slate-500">
                                Page{" "}
                                <span className="font-semibold text-slate-700">
                                    {currentPage}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-700">
                                    {lastPage}
                                </span>
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={
                                        currentPage <=
                                        1
                                    }
                                    onClick={() =>
                                        setCurrentPage(
                                            (page) =>
                                                Math.max(
                                                    1,
                                                    page - 1
                                                )
                                        )
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        currentPage >=
                                        lastPage
                                    }
                                    onClick={() =>
                                        setCurrentPage(
                                            (page) =>
                                                Math.min(
                                                    lastPage,
                                                    page + 1
                                                )
                                        )
                                    }
                                    className="rounded-xl bg-[#172554] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
            </section>
        </div>
    );
}