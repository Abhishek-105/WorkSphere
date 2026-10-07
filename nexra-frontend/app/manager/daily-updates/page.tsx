"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Employee = {
    id?: number;
    name?: string;
    email?: string;
};

type Project = {
    id?: number;
    title?: string;
    name?: string;
};

type Task = {
    id?: number;
    title?: string;
};

type DailyUpdate = {
    id: number;
    employee_id?: number;
    project_id?: number;
    task_id?: number | null;
    update_date?: string | null;
    work_description?: string | null;
    hours_spent?: number | string | null;
    status?: string | null;
    blocker_details?: string | null;
    plans_for_tomorrow?: string | null;
    reviewed_by?: number | null;
    reviewed_at?: string | null;
    blocker_acknowledged_by?: number | null;
    blocker_acknowledged_at?: string | null;
    manager_comment?: string | null;

    employee?: Employee | null;
    user?: Employee | null;
    project?: Project | null;
    task?: Task | null;
};

type ApiResponse = {
    message?: string;
    daily_updates?: DailyUpdate[] | { data?: DailyUpdate[] };
    updates?: DailyUpdate[] | { data?: DailyUpdate[] };
    data?: DailyUpdate[] | { data?: DailyUpdate[] };
};

function getArray(value: unknown): DailyUpdate[] {
    if (Array.isArray(value)) {
        return value;
    }

    if (
        value &&
        typeof value === "object" &&
        "data" in value &&
        Array.isArray((value as { data?: unknown }).data)
    ) {
        return (value as { data: DailyUpdate[] }).data;
    }

    return [];
}

function extractUpdates(response: ApiResponse): DailyUpdate[] {
    const dailyUpdates = getArray(response.daily_updates);

    if (dailyUpdates.length > 0) {
        return dailyUpdates;
    }

    const updates = getArray(response.updates);

    if (updates.length > 0) {
        return updates;
    }

    return getArray(response.data);
}

function formatDate(value?: string | null): string {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(value?: string | null): string {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getEmployee(update: DailyUpdate): Employee | null {
    return update.employee || update.user || null;
}

function getProject(update: DailyUpdate): Project | null {
    return update.project || null;
}

function getTask(update: DailyUpdate): Task | null {
    return update.task || null;
}

function getEmployeeName(update: DailyUpdate): string {
    return getEmployee(update)?.name || "Unknown employee";
}

function getProjectName(update: DailyUpdate): string {
    const project = getProject(update);

    return project?.title || project?.name || "No project";
}

function getTaskName(update: DailyUpdate): string {
    return getTask(update)?.title || "No task";
}

function hasBlocker(update: DailyUpdate): boolean {
    return Boolean(
        update.blocker_details &&
            update.blocker_details.trim().length > 0
    );
}

function isReviewed(update: DailyUpdate): boolean {
    return Boolean(update.reviewed_at || update.reviewed_by);
}

function getInitials(name: string): string {
    const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        return "U";
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}

function getStatusLabel(status?: string | null): string {
    if (!status) {
        return "Submitted";
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusClasses(status?: string | null): string {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "reviewed") {
        return "bg-emerald-50 text-emerald-700";
    }

    if (normalized === "pending") {
        return "bg-amber-50 text-amber-700";
    }

    return "bg-blue-50 text-blue-700";
}

export default function ManagerDailyUpdatesPage() {
    const { user } = useAuth();

    const [updates, setUpdates] = useState<DailyUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [reviewFilter, setReviewFilter] = useState("all");
    const [blockerFilter, setBlockerFilter] = useState("all");

    const getToken = () => {
        if (typeof window === "undefined") {
            return null;
        }

        return localStorage.getItem("nexra_token");
    };

    const loadUpdates = useCallback(
        async (showLoader = true) => {
            try {
                if (showLoader) {
                    setLoading(true);
                } else {
                    setRefreshing(true);
                }

                setError("");

                const token = getToken();

                if (!token) {
                    throw new Error(
                        "Authentication session not found. Please log in again."
                    );
                }

                const response = await apiFetch<ApiResponse>(
                    "/manager/daily-updates",
                    {
                        token,
                    }
                );

                setUpdates(extractUpdates(response));
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load daily updates."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    useEffect(() => {
        if (user) {
            loadUpdates();
        }
    }, [user, loadUpdates]);

    const filteredUpdates = useMemo(() => {
        const query = search.trim().toLowerCase();

        return updates.filter((update) => {
            const employeeName =
                getEmployeeName(update).toLowerCase();

            const employeeEmail =
                getEmployee(update)?.email?.toLowerCase() || "";

            const projectName =
                getProjectName(update).toLowerCase();

            const taskName =
                getTaskName(update).toLowerCase();

            const description =
                update.work_description?.toLowerCase() || "";

            const matchesSearch =
                !query ||
                employeeName.includes(query) ||
                employeeEmail.includes(query) ||
                projectName.includes(query) ||
                taskName.includes(query) ||
                description.includes(query);

            const matchesStatus =
                statusFilter === "all" ||
                String(update.status || "").toLowerCase() ===
                    statusFilter.toLowerCase();

            const matchesReview =
                reviewFilter === "all" ||
                (reviewFilter === "reviewed" && isReviewed(update)) ||
                (reviewFilter === "pending" && !isReviewed(update));

            const matchesBlocker =
                blockerFilter === "all" ||
                (blockerFilter === "blocker" && hasBlocker(update)) ||
                (blockerFilter === "clear" && !hasBlocker(update));

            return (
                matchesSearch &&
                matchesStatus &&
                matchesReview &&
                matchesBlocker
            );
        });
    }, [
        updates,
        search,
        statusFilter,
        reviewFilter,
        blockerFilter,
    ]);

    const counts = useMemo(() => {
        return {
            total: updates.length,
            reviewed: updates.filter(isReviewed).length,
            pending: updates.filter(
                (update) => !isReviewed(update)
            ).length,
            blockers: updates.filter(hasBlocker).length,
        };
    }, [updates]);

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setReviewFilter("all");
        setBlockerFilter("all");
    };

    const hasFilters =
        Boolean(search.trim()) ||
        statusFilter !== "all" ||
        reviewFilter !== "all" ||
        blockerFilter !== "all";

    return (
        <div className="space-y-6">
            {/* Compact Hero */}
            <section className="relative overflow-hidden rounded-2xl bg-[#172554] shadow-lg">
                <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
                <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

                <div className="relative flex flex-col gap-5 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-indigo-200">
                            <span>Workspace</span>

                            <svg
                                className="h-3.5 w-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>

                            <span className="text-white">
                                Daily Updates
                            </span>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/10">
                                <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8 10h8M8 14h5"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19 19l-3.2-3.2A7.5 7.5 0 104 12a7.5 7.5 0 0011.8 6.2L19 19z"
                                    />
                                </svg>
                            </div>

                            <div className="min-w-0">
                                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    Daily Updates
                                </h1>

                                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-indigo-100/75">
                                    Review team progress, track work activity,
                                    and identify blockers across your workspace.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => loadUpdates(false)}
                        disabled={refreshing}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#172554] shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <svg
                            className={`h-4 w-4 ${
                                refreshing ? "animate-spin" : ""
                            }`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 4v5h5M20 20v-5h-5M5.5 9A7 7 0 0117.9 6.1L20 9M18.5 15A7 7 0 016.1 17.9L4 15"
                            />
                        </svg>

                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Total Updates
                            </p>

                            <p className="mt-2 text-3xl font-bold text-slate-950">
                                {counts.total}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Team submissions
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Reviewed
                            </p>

                            <p className="mt-2 text-3xl font-bold text-emerald-600">
                                {counts.reviewed}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Manager reviewed
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 12l4 4L19 6"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Pending Review
                            </p>

                            <p className="mt-2 text-3xl font-bold text-amber-600">
                                {counts.pending}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Need your attention
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <circle cx="12" cy="12" r="8.5" />
                                <path
                                    strokeLinecap="round"
                                    d="M12 8v4l2.5 2.5"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Active Blockers
                            </p>

                            <p className="mt-2 text-3xl font-bold text-rose-600">
                                {counts.blockers}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Updates reporting blockers
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 3l9 17H3L12 3z"
                                />
                                <path
                                    strokeLinecap="round"
                                    d="M12 9v4"
                                />
                                <path
                                    strokeLinecap="round"
                                    d="M12 16.5h.01"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">
                            Filter Updates
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Find updates by employee, project, review state,
                            or blocker.
                        </p>
                    </div>

                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-left text-xs font-semibold text-indigo-600 transition hover:text-indigo-700 sm:text-right"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <div className="relative">
                        <svg
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path
                                strokeLinecap="round"
                                d="M20 20l-4-4"
                            />
                        </svg>

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search updates..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="submitted">Submitted</option>
                    </select>

                    <select
                        value={reviewFilter}
                        onChange={(event) =>
                            setReviewFilter(event.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                    >
                        <option value="all">All Review States</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="pending">Pending Review</option>
                    </select>

                    <select
                        value={blockerFilter}
                        onChange={(event) =>
                            setBlockerFilter(event.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                    >
                        <option value="all">All Blocker States</option>
                        <option value="blocker">Has Blocker</option>
                        <option value="clear">No Blocker</option>
                    </select>
                </div>
            </section>

            {/* Updates Workspace */}
            <section>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-950">
                            Team Daily Updates
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Showing{" "}
                            <span className="font-semibold text-slate-700">
                                {filteredUpdates.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-700">
                                {updates.length}
                            </span>{" "}
                            updates
                        </p>
                    </div>

                    {hasFilters && (
                        <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                            Filters active
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <article
                                key={item}
                                className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                            >
                                <div className="h-1 bg-slate-200" />

                                <div className="p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="h-11 w-11 rounded-xl bg-slate-200" />

                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-2/3 rounded bg-slate-200" />
                                            <div className="h-3 w-1/2 rounded bg-slate-100" />
                                        </div>
                                    </div>

                                    <div className="mt-5 h-20 rounded-xl bg-slate-100" />

                                    <div className="mt-4 h-12 rounded-xl bg-slate-100" />
                                </div>

                                <div className="h-14 border-t border-slate-100 bg-slate-50" />
                            </article>
                        ))}
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-rose-200 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                            <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <circle cx="12" cy="12" r="9" />
                                <path
                                    strokeLinecap="round"
                                    d="M12 8v5"
                                />
                                <path
                                    strokeLinecap="round"
                                    d="M12 16.5h.01"
                                />
                            </svg>
                        </div>

                        <h3 className="mt-4 text-base font-bold text-slate-900">
                            Unable to load daily updates
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => loadUpdates()}
                            className="mt-5 inline-flex items-center rounded-xl bg-[#172554] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e3a8a]"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredUpdates.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                            <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 10h8M8 14h5m6 6l-3.5-3.5A8 8 0 104 12a8 8 0 008 8c1.42 0 2.75-.37 3.9-1.02L19 20z"
                                />
                            </svg>
                        </div>

                        <h3 className="mt-4 text-base font-bold text-slate-900">
                            {hasFilters
                                ? "No matching updates"
                                : "No daily updates yet"}
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            {hasFilters
                                ? "Try changing or clearing your filters to see more team updates."
                                : "Employee daily standup submissions will appear here."}
                        </p>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-5 inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {filteredUpdates.map((update) => {
                            const employeeName =
                                getEmployeeName(update);

                            const reviewed = isReviewed(update);
                            const blocker = hasBlocker(update);

                            return (
                                <article
                                    key={update.id}
                                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <div className="h-1 bg-[#172554]" />

                                    <div className="flex-1 p-5">
                                        {/* Employee Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#172554] text-xs font-bold text-white">
                                                    {getInitials(
                                                        employeeName
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <h3 className="truncate text-sm font-bold text-slate-950">
                                                        {employeeName}
                                                    </h3>

                                                    <p className="mt-0.5 truncate text-xs text-slate-500">
                                                        {getEmployee(
                                                            update
                                                        )?.email ||
                                                            "Team member"}
                                                    </p>
                                                </div>
                                            </div>

                                            {blocker ? (
                                                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                    Blocker
                                                </span>
                                            ) : (
                                                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Clear
                                                </span>
                                            )}
                                        </div>

                                        {/* Project / Task */}
                                        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
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
                                                        <path
                                                            strokeLinecap="round"
                                                            d="M3 9h18"
                                                        />
                                                    </svg>
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-bold text-slate-900">
                                                        {getProjectName(
                                                            update
                                                        )}
                                                    </p>

                                                    <p className="mt-1 truncate text-xs text-slate-500">
                                                        {getTaskName(
                                                            update
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Metrics */}
                                        <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                            <div className="p-3">
                                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Date
                                                </p>

                                                <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                                                    {formatDate(
                                                        update.update_date
                                                    )}
                                                </p>
                                            </div>

                                            <div className="p-3">
                                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Hours
                                                </p>

                                                <p className="mt-1 text-xs font-semibold text-slate-700">
                                                    {update.hours_spent ??
                                                        0}
                                                    h
                                                </p>
                                            </div>

                                            <div className="p-3">
                                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Status
                                                </p>

                                                <span
                                                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusClasses(
                                                        update.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(
                                                        update.status
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Work Description */}
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Work Accomplished
                                                </p>

                                                {reviewed ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        Reviewed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                        Pending
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-slate-600">
                                                {update.work_description ||
                                                    "No work description provided."}
                                            </p>
                                        </div>

                                        {/* Blocker Details */}
                                        {blocker && (
                                            <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/70 p-3">
                                                <div className="flex items-center gap-2">
                                                    <svg
                                                        className="h-4 w-4 shrink-0 text-rose-600"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M12 3l9 17H3L12 3z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            d="M12 9v4"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            d="M12 16.5h.01"
                                                        />
                                                    </svg>

                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                                                        Blocker
                                                    </p>
                                                </div>

                                                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-rose-700/80">
                                                    {
                                                        update.blocker_details
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {/* Reviewed Time */}
                                        {reviewed &&
                                            update.reviewed_at && (
                                                <p className="mt-3 text-[10px] text-slate-400">
                                                    Reviewed{" "}
                                                    {formatDateTime(
                                                        update.reviewed_at
                                                    )}
                                                </p>
                                            )}
                                    </div>

                                    {/* Card Footer */}
                                    <div className="border-t border-slate-100 bg-slate-50/70 p-4">
                                        <Link
                                            href={`/manager/daily-updates/${update.id}`}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#172554] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1e3a8a]"
                                        >
                                            View Update

                                            <svg
                                                className="h-3.5 w-3.5"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}