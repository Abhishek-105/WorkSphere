"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../lib/api";

type Project = {
    id: number;
    title: string;
    description?: string | null;
    status?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    tasks_count?: number;
    employees_count?: number;
    files_count?: number;
};

type ProjectsResponse = {
    message: string;
    projects:
        | Project[]
        | {
              data?: Project[];
              current_page?: number;
              last_page?: number;
              total?: number;
              per_page?: number;
          };
};

function ProjectIcon({
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
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7.5A2.5 2.5 0 0 1 6.5 5h4l2 2h5A2.5 2.5 0 0 1 20 9.5v7A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
            />
        </svg>
    );
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
            <circle cx="11" cy="11" r="7" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m20 20-4-4"
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
                strokeLinejoin="round"
                d="M12 5v14M5 12h14"
            />
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M13 6l6 6-6 6"
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

function UsersIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20"
            />
            <circle cx="10" cy="7.5" r="3.5" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 11a3.5 3.5 0 0 0 0-7M17 14.2a4.5 4.5 0 0 1 3 4.3V20"
            />
        </svg>
    );
}

function TaskIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="2.5"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8 12 2.5 2.5L16 9"
            />
        </svg>
    );
}

function FileIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 3.5V8h4"
            />
        </svg>
    );
}

function getStatusClass(status?: string | null) {
    const normalized = (status || "")
        .toLowerCase()
        .replace(/[-_]/g, " ");

    if (
        normalized === "completed" ||
        normalized === "done"
    ) {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (
        normalized === "in progress" ||
        normalized === "active"
    ) {
        return "border-blue-200 bg-blue-50 text-blue-700";
    }

    if (
        normalized === "pending" ||
        normalized === "not started"
    ) {
        return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-slate-200 bg-slate-100 text-slate-600";
}

function formatStatus(status?: string | null) {
    if (!status) {
        return "Unknown";
    }

    return status
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}

function formatDate(date?: string | null) {
    if (!date) {
        return "No date";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getProjects(
    projects:
        | Project[]
        | {
              data?: Project[];
          }
) {
    if (Array.isArray(projects)) {
        return projects;
    }

    return projects.data || [];
}

export default function ManagerProjectsPage() {
    const router = useRouter();

    const {
        user,
        token,
        loading: authLoading,
    } = useAuth();

    const [projects, setProjects] = useState<Project[]>(
        []
    );

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

        async function loadProjects() {
            setLoading(true);
            setError("");

            try {
                const params = new URLSearchParams();

                if (search.trim()) {
                    params.set(
                        "search",
                        search.trim()
                    );
                }

                if (status !== "all") {
                    params.set("status", status);
                }

                const queryString =
                    params.toString();

                const endpoint =
                    queryString.length > 0
                        ? `/manager/projects?${queryString}`
                        : "/manager/projects";

                const response =
                    await apiFetch<ProjectsResponse>(
                        endpoint,
                        {
                            method: "GET",
                            token,
                        }
                    );

                setProjects(
                    getProjects(response.projects)
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load projects."
                );
            } finally {
                setLoading(false);
            }
        }

        loadProjects();
    }, [
        authLoading,
        user,
        token,
        router,
        search,
        status,
    ]);

    if (authLoading || !user) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

                    <p className="mt-4 text-sm font-medium text-slate-500">
                        Loading projects...
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
            {/* Page Header */}
            <section className="relative overflow-hidden rounded-2xl bg-[#172554] shadow-lg">
                <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

                <div className="relative flex flex-col justify-between gap-6 p-6 sm:p-7 lg:flex-row lg:items-center">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-indigo-200">
                            <span>Workspace</span>
                            <span className="text-indigo-400">
                                /
                            </span>
                            <span className="text-white">
                                Projects
                            </span>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-indigo-200 backdrop-blur-sm">
                                <ProjectIcon className="h-5 w-5" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    Projects
                                </h1>

                                <p className="mt-1 text-sm text-indigo-100/75">
                                    Manage and monitor projects
                                    across your workspace.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/manager/projects/create"
                            )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#172554] shadow-sm transition hover:bg-indigo-50 hover:shadow-md"
                    >
                        <PlusIcon />
                        New Project
                    </button>
                </div>
            </section>

            {/* Search & Filters */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                            <SearchIcon />
                        </div>

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search projects by name or description..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(event) =>
                            setStatus(
                                event.target.value
                            )
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                    >
                        <option value="all">
                            All Status
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
                </div>
            </section>

            {/* Error */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                            !
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-red-800">
                                Unable to load projects
                            </p>

                            <p className="mt-0.5 text-xs text-red-600">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map(
                        (item) => (
                            <div
                                key={item}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                            >
                                <div className="h-1 bg-slate-200" />

                                <div className="animate-pulse p-5">
                                    <div className="flex justify-between">
                                        <div className="h-11 w-11 rounded-xl bg-slate-200" />
                                        <div className="h-6 w-20 rounded-full bg-slate-200" />
                                    </div>

                                    <div className="mt-5 h-5 w-2/3 rounded bg-slate-200" />

                                    <div className="mt-3 space-y-2">
                                        <div className="h-3 w-full rounded bg-slate-100" />
                                        <div className="h-3 w-5/6 rounded bg-slate-100" />
                                        <div className="h-3 w-4/6 rounded bg-slate-100" />
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <div className="h-16 rounded-xl bg-slate-100" />
                                        <div className="h-16 rounded-xl bg-slate-100" />
                                    </div>
                                </div>

                                <div className="h-14 bg-slate-50" />
                            </div>
                        )
                    )}
                </div>
            ) : projects.length === 0 ? (
                /* Empty State */
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col items-center px-6 py-16 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <ProjectIcon className="h-7 w-7" />
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-slate-900">
                            No projects found
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            {search || status !== "all"
                                ? "Try changing your search or status filter."
                                : "Create your first project to start managing work in Nexra."}
                        </p>

                        {!search &&
                            status === "all" && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.push(
                                            "/manager/projects/create"
                                        )
                                    }
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#172554] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-900"
                                >
                                    <PlusIcon />
                                    Create Project
                                </button>
                            )}
                    </div>
                </section>
            ) : (
                /* Projects */
                <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {projects.map((project) => (
                        <article
                            key={project.id}
                            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
                        >
                            <div className="h-1 bg-[#172554]" />

                            <div className="flex-1 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition duration-200 group-hover:bg-[#172554] group-hover:text-white">
                                        <ProjectIcon />
                                    </div>

                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                                            project.status
                                        )}`}
                                    >
                                        {formatStatus(
                                            project.status
                                        )}
                                    </span>
                                </div>

                                <h2 className="mt-5 line-clamp-1 text-lg font-bold tracking-tight text-slate-900">
                                    {project.title}
                                </h2>

                                <p className="mt-2 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-500">
                                    {project.description ||
                                        "No project description available."}
                                </p>

                                {/* Metrics */}
                                <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                    <div className="p-3">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <TaskIcon />
                                            <span className="text-[10px] font-semibold uppercase tracking-wider">
                                                Tasks
                                            </span>
                                        </div>

                                        <p className="mt-1.5 text-lg font-bold text-slate-900">
                                            {project.tasks_count ??
                                                0}
                                        </p>
                                    </div>

                                    <div className="p-3">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <UsersIcon />
                                            <span className="text-[10px] font-semibold uppercase tracking-wider">
                                                Team
                                            </span>
                                        </div>

                                        <p className="mt-1.5 text-lg font-bold text-slate-900">
                                            {project.employees_count ??
                                                0}
                                        </p>
                                    </div>

                                    <div className="p-3">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <FileIcon />
                                            <span className="text-[10px] font-semibold uppercase tracking-wider">
                                                Files
                                            </span>
                                        </div>

                                        <p className="mt-1.5 text-lg font-bold text-slate-900">
                                            {project.files_count ??
                                                0}
                                        </p>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="mt-5 space-y-2.5">
                                    <div className="flex items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <CalendarIcon />
                                            <span>
                                                Start date
                                            </span>
                                        </div>

                                        <span className="font-semibold text-slate-700">
                                            {formatDate(
                                                project.start_date
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <CalendarIcon />
                                            <span>
                                                End date
                                            </span>
                                        </div>

                                        <span className="font-semibold text-slate-700">
                                            {formatDate(
                                                project.end_date
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="border-t border-slate-100 bg-slate-50/70 p-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.push(
                                            `/manager/projects/${project.id}`
                                        )
                                    }
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#172554] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-900 hover:shadow-md"
                                >
                                    View Project
                                    <ArrowIcon />
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </div>
    );
}