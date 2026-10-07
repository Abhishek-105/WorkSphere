"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Project = {
    id: number;
    title?: string;
    name?: string;
    status?: string | null;
};

type Employee = {
    id: number;
    name?: string;
    email?: string;
};

type Task = {
    id: number;
    project_id?: number | null;
    assigned_to?: number | null;
    created_by?: number | null;
    title?: string | null;
    description?: string | null;
    status?: string | null;
    priority?: string | null;
    deadline?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    project?: Project | null;
    assigned_employee?: Employee | null;
    assignees?: Employee[];
};

type ApiResponse = {
    message?: string;
    task?: Task;
    data?: Task | { data?: Task };
};

function extractTask(response: ApiResponse): Task | null {
    if (response.task) {
        return response.task;
    }

    if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data &&
        response.data.data
    ) {
        return response.data.data;
    }

    if (
        response.data &&
        typeof response.data === "object" &&
        "id" in response.data
    ) {
        return response.data as Task;
    }

    return null;
}

function normalizeStatus(status?: string | null): string {
    if (!status) {
        return "unknown";
    }

    return status.toLowerCase().replace(/[_-]/g, " ");
}

function isCompleted(status?: string | null): boolean {
    const normalized = normalizeStatus(status);

    return (
        normalized === "completed" ||
        normalized === "complete" ||
        normalized === "done"
    );
}

function isInProgress(status?: string | null): boolean {
    const normalized = normalizeStatus(status);

    return (
        normalized === "in progress" ||
        normalized === "started"
    );
}

function getStatusClasses(status?: string | null): string {
    const normalized = normalizeStatus(status);

    if (
        normalized === "completed" ||
        normalized === "complete" ||
        normalized === "done"
    ) {
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    }

    if (
        normalized === "in progress" ||
        normalized === "started"
    ) {
        return "bg-blue-50 text-blue-700 ring-blue-200";
    }

    if (
        normalized === "pending" ||
        normalized === "todo" ||
        normalized === "to do"
    ) {
        return "bg-amber-50 text-amber-700 ring-amber-200";
    }

    if (
        normalized === "cancelled" ||
        normalized === "canceled"
    ) {
        return "bg-rose-50 text-rose-700 ring-rose-200";
    }

    return "bg-slate-100 text-slate-600 ring-slate-200";
}

function getPriorityClasses(priority?: string | null): string {
    const normalized = normalizeStatus(priority);

    if (
        normalized === "urgent" ||
        normalized === "high"
    ) {
        return "bg-rose-50 text-rose-700 ring-rose-200";
    }

    if (normalized === "medium") {
        return "bg-amber-50 text-amber-700 ring-amber-200";
    }

    if (normalized === "low") {
        return "bg-slate-100 text-slate-600 ring-slate-200";
    }

    return "bg-slate-100 text-slate-600 ring-slate-200";
}

function formatDate(date?: string | null): string {
    if (!date) {
        return "Not set";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "Not set";
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(date?: string | null): string {
    if (!date) {
        return "Not available";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "Not available";
    }

    return parsed.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getProjectName(project?: Project | null): string {
    if (!project) {
        return "No project";
    }

    return project.title || project.name || "Untitled Project";
}

function getInitials(name?: string): string {
    if (!name) {
        return "U";
    }

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

function isOverdue(task: Task): boolean {
    if (!task.deadline || isCompleted(task.status)) {
        return false;
    }

    const deadline = new Date(task.deadline);

    if (Number.isNaN(deadline.getTime())) {
        return false;
    }

    return deadline.getTime() < Date.now();
}

export default function EmployeeTaskDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const taskId = Array.isArray(params?.id)
        ? params.id[0]
        : params?.id;

    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [success, setSuccess] = useState("");

    const getToken = () => {
        if (typeof window === "undefined") {
            return null;
        }

        return localStorage.getItem("nexra_token");
    };

    const loadTask = async () => {
        if (!taskId) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "Authentication session not found. Please log in again."
                );
            }

            const response = await apiFetch<ApiResponse>(
                `/employee/tasks/${taskId}`,
                {
                    token,
                }
            );

            const taskData = extractTask(response);

            if (!taskData) {
                throw new Error(
                    "Task data was not found in the API response."
                );
            }

            setTask(taskData);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load task details."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTask();
    }, [taskId]);

    const updateStatus = async (
        newStatus: "pending" | "in_progress" | "completed"
    ) => {
        if (!taskId || updating) {
            return;
        }

        try {
            setUpdating(true);
            setActionError("");
            setSuccess("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "Authentication session not found. Please log in again."
                );
            }

            const response = await apiFetch<ApiResponse>(
                `/employee/tasks/${taskId}/status`,
                {
                    method: "PATCH",
                    token,
                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            );

            const updatedTask = extractTask(response);

            if (updatedTask) {
                setTask(updatedTask);
            } else {
                await loadTask();
            }

            setSuccess(
                newStatus === "completed"
                    ? "Task marked as completed."
                    : newStatus === "in_progress"
                        ? "Task moved to in progress."
                        : "Task moved back to pending."
            );
        } catch (err) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "Unable to update task status."
            );
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="h-8 w-36 animate-pulse rounded-lg bg-slate-200" />

                    <div className="h-52 animate-pulse rounded-3xl bg-slate-200" />

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="h-80 animate-pulse rounded-3xl bg-white" />
                        <div className="h-80 animate-pulse rounded-3xl bg-white" />
                    </div>
                </div>
            </main>
        );
    }

    if (error || !task) {
        return (
            <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
                    <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                            <svg
                                className="h-8 w-8"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v4m0 4h.01M10.29 3.86l-7.82 14a2 2 0 001.74 2.98h15.58a2 2 0 002-2.98l-7.82-14a2 2 0 00-3.42 0z"
                                />
                            </svg>
                        </div>

                        <h1 className="mt-5 text-xl font-bold text-slate-900">
                            Unable to load task
                        </h1>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            {error ||
                                "The requested task could not be found."}
                        </p>

                        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Go Back
                            </button>

                            <Link
                                href="/employee/tasks"
                                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                My Tasks
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const completed = isCompleted(task.status);
    const inProgress = isInProgress(task.status);
    const overdue = isOverdue(task);

    return (
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                    >
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
                                d="m15 19-7-7 7-7"
                            />
                        </svg>
                        Back to Tasks
                    </button>

                    <Link
                        href="/employee/tasks"
                        className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        All Tasks
                    </Link>
                </div>

                <section className="relative overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.28),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.16),transparent_35%)]" />

                    <div className="relative p-6 sm:p-8 lg:p-10">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                    <span
                                        className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ring-1 ${getStatusClasses(
                                            task.status
                                        )}`}
                                    >
                                        {normalizeStatus(task.status)}
                                    </span>

                                    {task.priority && (
                                        <span
                                            className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ring-1 ${getPriorityClasses(
                                                task.priority
                                            )}`}
                                        >
                                            {task.priority} priority
                                        </span>
                                    )}

                                    {overdue && (
                                        <span className="rounded-full bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-300 ring-1 ring-rose-400/30">
                                            Overdue
                                        </span>
                                    )}
                                </div>

                                <h1 className="break-words text-3xl font-black tracking-tight text-white sm:text-4xl">
                                    {task.title || "Untitled Task"}
                                </h1>

                                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
                                    <span>
                                        Project:{" "}
                                        <span className="font-semibold text-white">
                                            {getProjectName(
                                                task.project
                                            )}
                                        </span>
                                    </span>

                                    <span>
                                        Task #{task.id}
                                    </span>
                                </div>
                            </div>

                            <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                                {!completed && !inProgress && (
                                    <button
                                        type="button"
                                        disabled={updating}
                                        onClick={() =>
                                            updateStatus(
                                                "in_progress"
                                            )
                                        }
                                        className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {updating
                                            ? "Updating..."
                                            : "Start Task"}
                                    </button>
                                )}

                                {inProgress && (
                                    <button
                                        type="button"
                                        disabled={updating}
                                        onClick={() =>
                                            updateStatus(
                                                "completed"
                                            )
                                        }
                                        className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {updating
                                            ? "Updating..."
                                            : "Mark Completed"}
                                    </button>
                                )}

                                {completed && (
                                    <button
                                        type="button"
                                        disabled={updating}
                                        onClick={() =>
                                            updateStatus(
                                                "in_progress"
                                            )
                                        }
                                        className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {updating
                                            ? "Updating..."
                                            : "Reopen Task"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {(actionError || success) && (
                    <div
                        className={`rounded-2xl border px-5 py-4 text-sm font-medium ${
                            actionError
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                    >
                        {actionError || success}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="space-y-6">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="text-lg font-bold text-slate-900">
                                Task Description
                            </h2>

                            <div className="mt-5">
                                {task.description ? (
                                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                                        {task.description}
                                    </p>
                                ) : (
                                    <p className="text-sm text-slate-400">
                                        No description has been provided for
                                        this task.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Task Timeline
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Important dates for this task.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-7 grid gap-5 sm:grid-cols-2">
                                <div className="rounded-2xl bg-slate-50 p-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Created
                                    </p>

                                    <p className="mt-2 text-sm font-bold text-slate-800">
                                        {formatDateTime(
                                            task.created_at
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 p-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Deadline
                                    </p>

                                    <p
                                        className={`mt-2 text-sm font-bold ${
                                            overdue
                                                ? "text-rose-600"
                                                : "text-slate-800"
                                        }`}
                                    >
                                        {formatDateTime(
                                            task.deadline
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 p-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Started
                                    </p>

                                    <p className="mt-2 text-sm font-bold text-slate-800">
                                        {formatDateTime(
                                            task.started_at
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 p-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Completed
                                    </p>

                                    <p className="mt-2 text-sm font-bold text-slate-800">
                                        {formatDateTime(
                                            task.completed_at
                                        )}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900">
                                Task Information
                            </h2>

                            <div className="mt-5 space-y-4">
                                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                    <span className="text-sm text-slate-500">
                                        Status
                                    </span>

                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${getStatusClasses(
                                            task.status
                                        )}`}
                                    >
                                        {normalizeStatus(
                                            task.status
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                    <span className="text-sm text-slate-500">
                                        Priority
                                    </span>

                                    <span className="text-sm font-bold capitalize text-slate-800">
                                        {task.priority || "Not set"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                    <span className="text-sm text-slate-500">
                                        Deadline
                                    </span>

                                    <span
                                        className={`text-right text-sm font-bold ${
                                            overdue
                                                ? "text-rose-600"
                                                : "text-slate-800"
                                        }`}
                                    >
                                        {formatDate(
                                            task.deadline
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-slate-500">
                                        Project
                                    </span>

                                    {task.project?.id ? (
                                        <Link
                                            href={`/employee/projects/${task.project.id}`}
                                            className="max-w-[180px] truncate text-right text-sm font-bold text-slate-800 transition hover:text-blue-600"
                                        >
                                            {getProjectName(
                                                task.project
                                            )}
                                        </Link>
                                    ) : (
                                        <span className="text-sm font-bold text-slate-800">
                                            {getProjectName(
                                                task.project
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900">
                                Assigned To
                            </h2>

                            {task.assigned_employee ? (
                                <div className="mt-5 flex items-center gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                                        {getInitials(
                                            task.assigned_employee
                                                .name
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate font-bold text-slate-800">
                                            {task.assigned_employee
                                                .name ||
                                                "Employee"}
                                        </p>

                                        {task.assigned_employee
                                            .email && (
                                            <p className="truncate text-xs text-slate-500">
                                                {
                                                    task
                                                        .assigned_employee
                                                        .email
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : task.assignees &&
                              task.assignees.length > 0 ? (
                                <div className="mt-5 space-y-3">
                                    {task.assignees.map(
                                        (employee) => (
                                            <div
                                                key={
                                                    employee.id
                                                }
                                                className="flex items-center gap-3"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                                                    {getInitials(
                                                        employee.name
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-bold text-slate-800">
                                                        {employee.name ||
                                                            "Employee"}
                                                    </p>

                                                    {employee.email && (
                                                        <p className="truncate text-xs text-slate-500">
                                                            {
                                                                employee.email
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p className="mt-5 text-sm text-slate-500">
                                    You are assigned to this task.
                                </p>
                            )}
                        </section>

                        {task.project?.id && (
                            <Link
                                href={`/employee/projects/${task.project.id}`}
                                className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                            >
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Related Project
                                    </p>

                                    <p className="mt-1 font-bold text-slate-900">
                                        {getProjectName(
                                            task.project
                                        )}
                                    </p>
                                </div>

                                <svg
                                    className="h-5 w-5 text-slate-400"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m9 5 7 7-7 7"
                                    />
                                </svg>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}