"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Project = {
id: number;
title?: string;
name?: string;
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
tasks?: Task[] | { data?: Task[] };
data?: Task[] | { data?: Task[] };
};

function extractTasks(response: ApiResponse): Task[] {
if (Array.isArray(response.tasks)) {
return response.tasks;
}


if (
    response.tasks &&
    typeof response.tasks === "object" &&
    Array.isArray(response.tasks.data)
) {
    return response.tasks.data;
}

if (Array.isArray(response.data)) {
    return response.data;
}

if (
    response.data &&
    typeof response.data === "object" &&
    Array.isArray(response.data.data)
) {
    return response.data.data;
}

return [];


}

function normalizeStatus(status?: string | null): string {
if (!status) {
return "unknown";
}


return status.toLowerCase().replace(/[_-]/g, " ");


}

function getStatusClasses(status?: string | null): string {
const normalized = normalizeStatus(status);


if (
    normalized === "completed" ||
    normalized === "complete" ||
    normalized === "done"
) {
    return "bg-[#ECFDF3] text-[#166534] ring-[#BBF7D0]";
}

if (
    normalized === "in progress" ||
    normalized === "started"
) {
    return "bg-[#F0FDF4] text-[#15803D] ring-[#BBF7D0]";
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


if (normalized === "urgent" || normalized === "high") {
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
return "No deadline";
}


const parsed = new Date(date);

if (Number.isNaN(parsed.getTime())) {
    return "No deadline";
}

return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
});


}

function getProjectName(project?: Project | null): string {
if (!project) {
return "No project";
}


return project.title || project.name || "Untitled Project";


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

function isPending(status?: string | null): boolean {
const normalized = normalizeStatus(status);


return (
    normalized === "pending" ||
    normalized === "todo" ||
    normalized === "to do"
);


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

const TaskIcon = () => ( <svg
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="1.8"
     className="h-5 w-5"
 > <path
         strokeLinecap="round"
         strokeLinejoin="round"
         d="M9 5h6M9 9h6M9 13h4m-7 7h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
     /> </svg>
);

const SearchIcon = () => ( <svg
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="1.8"
     className="h-4 w-4"
 > <circle cx="10.8" cy="10.8" r="6.3" /> <path
         strokeLinecap="round"
         d="m16 16 4.2 4.2"
     /> </svg>
);

const ArrowIcon = () => ( <svg
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="2"
     className="h-4 w-4"
 > <path
         strokeLinecap="round"
         strokeLinejoin="round"
         d="M5 12h13M13 6l6 6-6 6"
     /> </svg>
);

const CheckIcon = () => ( <svg
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="2"
     className="h-4 w-4"
 > <path
         strokeLinecap="round"
         strokeLinejoin="round"
         d="m5 12 4 4L19 6"
     /> </svg>
);

const ClockIcon = () => ( <svg
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     strokeWidth="1.8"
     className="h-4 w-4"
 > <circle cx="12" cy="12" r="8.5" /> <path
         strokeLinecap="round"
         d="M12 7.5v5l3 1.75"
     /> </svg>
);

export default function EmployeeTasksPage() {
const [tasks, setTasks] = useState<Task[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");


const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [priorityFilter, setPriorityFilter] =
    useState("all");

const getToken = () => {
    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem("nexra_token");
};

const loadTasks = async () => {
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
            "/employee/tasks",
            {
                token,
            }
        );

        setTasks(extractTasks(response));
    } catch (err) {
        setError(
            err instanceof Error
                ? err.message
                : "Unable to load tasks."
        );
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    loadTasks();
}, []);

const filteredTasks = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return tasks.filter((task) => {
        const taskTitle =
            task.title?.toLowerCase() || "";

        const taskDescription =
            task.description?.toLowerCase() || "";

        const projectName =
            getProjectName(task.project).toLowerCase();

        const matchesSearch =
            !searchTerm ||
            taskTitle.includes(searchTerm) ||
            taskDescription.includes(searchTerm) ||
            projectName.includes(searchTerm);

        const matchesStatus =
            statusFilter === "all" ||
            normalizeStatus(task.status) ===
                statusFilter;

        const matchesPriority =
            priorityFilter === "all" ||
            normalizeStatus(task.priority) ===
                priorityFilter;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority
        );
    });
}, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
]);

const totalCount = tasks.length;

const completedCount = tasks.filter((task) =>
    isCompleted(task.status)
).length;

const inProgressCount = tasks.filter((task) =>
    isInProgress(task.status)
).length;

const pendingCount = tasks.filter((task) =>
    isPending(task.status)
).length;

const overdueCount = tasks.filter((task) =>
    isOverdue(task)
).length;

if (loading) {
    return (
        <main className="min-h-screen bg-[#F5F7F6] p-4 sm:p-5 lg:p-6">
            <div className="mx-auto max-w-7xl animate-pulse space-y-5">
                <div className="h-32 rounded-2xl bg-[#DDE4DF]" />

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map(
                        (_, index) => (
                            <div
                                key={index}
                                className="h-24 rounded-2xl bg-white"
                            />
                        )
                    )}
                </div>

                <div className="h-16 rounded-2xl bg-white" />

                <div className="h-72 rounded-2xl bg-white" />
            </div>
        </main>
    );
}

if (error) {
    return (
        <main className="min-h-screen bg-[#F5F7F6] p-4 sm:p-5 lg:p-6">
            <div className="mx-auto max-w-3xl">
                <div className="rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-lg font-bold text-red-600">
                        !
                    </div>

                    <h1 className="mt-4 text-lg font-bold text-[#18201C]">
                        Unable to load tasks
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-[#6B7770]">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={loadTasks}
                        className="mt-5 rounded-xl bg-[#166534] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#14532D]"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </main>
    );
}

return (
    <main className="min-h-screen bg-[#F5F7F6] p-4 pt-2 sm:p-5 sm:pt-3 lg:p-6 lg:pt-3">
        <div className="mx-auto max-w-7xl space-y-5">

            {/* Compact Header */}
            <section className="relative overflow-hidden rounded-2xl bg-[#171A19] px-5 py-4 shadow-sm sm:px-6 sm:py-4">
                <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#166534]/20 blur-3xl" />

                <div className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-[#22C55E]/10 blur-3xl" />

                <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold text-[#8C9891]">
                            <span>
                                Workspace
                            </span>

                            <span className="text-[#4E5953]">
                                /
                            </span>

                            <span className="text-[#D4DBD7]">
                                Tasks
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#166534] text-white shadow-lg shadow-black/20">
                                <TaskIcon />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-white">
                                    My Tasks
                                </h1>

                                <p className="mt-0.5 text-[11px] text-[#9AA69F] sm:text-xs">
                                    Track assigned work, deadlines and progress.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/employee/daily-updates/create"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#14532D]"
                    >
                        Submit Daily Update
                        <ArrowIcon />
                    </Link>
                </div>
            </section>

            {/* Statistics */}
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-[#E1E7E3] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A857F]">
                                Total
                            </p>

                            <p className="mt-1.5 text-2xl font-bold tracking-tight text-[#18201C]">
                                {totalCount}
                            </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ECFDF3] text-[#166534]">
                            <TaskIcon />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-[#E1E7E3] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A857F]">
                                Pending
                            </p>

                            <p className="mt-1.5 text-2xl font-bold tracking-tight text-[#18201C]">
                                {pendingCount}
                            </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <ClockIcon />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-[#E1E7E3] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A857F]">
                                In Progress
                            </p>

                            <p className="mt-1.5 text-2xl font-bold tracking-tight text-[#18201C]">
                                {inProgressCount}
                            </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ECFDF3] text-[#166534]">
                            <ClockIcon />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-[#E1E7E3] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A857F]">
                                Completed
                            </p>

                            <p className="mt-1.5 text-2xl font-bold tracking-tight text-[#18201C]">
                                {completedCount}
                            </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <CheckIcon />
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="rounded-2xl border border-[#E1E7E3] bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A958F]">
                            <SearchIcon />
                        </span>

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search tasks or projects..."
                            className="w-full rounded-xl border border-[#E1E7E3] bg-[#F5F7F6] py-2.5 pl-10 pr-4 text-sm text-[#18201C] outline-none transition placeholder:text-[#8A958F] focus:border-[#166534] focus:bg-white focus:ring-2 focus:ring-[#166534]/10"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                        className="rounded-xl border border-[#E1E7E3] bg-[#F5F7F6] px-4 py-2.5 text-sm font-medium text-[#36413B] outline-none transition focus:border-[#166534] focus:bg-white focus:ring-2 focus:ring-[#166534]/10"
                    >
                        <option value="all">
                            All Statuses
                        </option>

                        <option value="pending">
                            Pending
                        </option>

                        <option value="in progress">
                            In Progress
                        </option>

                        <option value="completed">
                            Completed
                        </option>

                        <option value="done">
                            Done
                        </option>
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={(event) =>
                            setPriorityFilter(
                                event.target.value
                            )
                        }
                        className="rounded-xl border border-[#E1E7E3] bg-[#F5F7F6] px-4 py-2.5 text-sm font-medium text-[#36413B] outline-none transition focus:border-[#166534] focus:bg-white focus:ring-2 focus:ring-[#166534]/10"
                    >
                        <option value="all">
                            All Priorities
                        </option>

                        <option value="urgent">
                            Urgent
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

                    {(search ||
                        statusFilter !== "all" ||
                        priorityFilter !== "all") && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("all");
                                setPriorityFilter("all");
                            }}
                            className="rounded-xl border border-[#E1E7E3] px-4 py-2.5 text-sm font-bold text-[#59645E] transition hover:bg-[#F5F7F6]"
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8A958F]">
                    <span>
                        Showing{" "}
                        <span className="font-bold text-[#36413B]">
                            {filteredTasks.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-bold text-[#36413B]">
                            {tasks.length}
                        </span>{" "}
                        tasks
                    </span>

                    {(search ||
                        statusFilter !== "all" ||
                        priorityFilter !== "all") && (
                        <span className="font-medium text-[#166534]">
                            Filters applied
                        </span>
                    )}
                </div>
            </section>

            {/* Tasks */}
            <section className="overflow-hidden rounded-2xl border border-[#E1E7E3] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E8EEEA] px-4 py-3.5 sm:px-5">
                    <div>
                        <h2 className="text-sm font-bold text-[#18201C]">
                            Assigned Tasks
                        </h2>

                        <p className="mt-0.5 text-[11px] text-[#7A857F]">
                            {filteredTasks.length}{" "}
                            {filteredTasks.length === 1
                                ? "task"
                                : "tasks"}{" "}
                            shown
                        </p>
                    </div>

                    <div className="hidden h-8 w-8 items-center justify-center rounded-lg bg-[#ECFDF3] text-[#166534] sm:flex">
                        <TaskIcon />
                    </div>
                </div>

                {filteredTasks.length === 0 ? (
                    <div className="px-6 py-14 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECFDF3] text-[#166534]">
                            <TaskIcon />
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-[#18201C]">
                            {tasks.length === 0
                                ? "No tasks assigned"
                                : "No matching tasks"}
                        </h3>

                        <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-[#6B7770]">
                            {tasks.length === 0
                                ? "You currently have no tasks assigned to you."
                                : "Try changing your search or filters to find the task you are looking for."}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop */}
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full min-w-[850px]">
                                <thead>
                                    <tr className="border-b border-[#E8EEEA] text-left">
                                        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[#8A958F]">
                                            Task
                                        </th>

                                        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[#8A958F]">
                                            Project
                                        </th>

                                        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[#8A958F]">
                                            Status
                                        </th>

                                        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[#8A958F]">
                                            Priority
                                        </th>

                                        <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[#8A958F]">
                                            Deadline
                                        </th>

                                        <th className="px-5 py-3.5" />
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#E8EEEA]">
                                    {filteredTasks.map(
                                        (task) => (
                                            <tr
                                                key={task.id}
                                                className="group transition hover:bg-[#F8FAF9]"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="max-w-sm">
                                                        <p className="line-clamp-1 text-sm font-bold text-[#18201C]">
                                                            {task.title ||
                                                                "Untitled Task"}
                                                        </p>

                                                        {task.description && (
                                                            <p className="mt-0.5 line-clamp-1 text-[11px] text-[#7A857F]">
                                                                {
                                                                    task.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="text-xs font-semibold text-[#4A564F]">
                                                        {getProjectName(
                                                            task.project
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ring-1 ${getStatusClasses(
                                                            task.status
                                                        )}`}
                                                    >
                                                        {normalizeStatus(
                                                            task.status
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    {task.priority ? (
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ring-1 ${getPriorityClasses(
                                                                task.priority
                                                            )}`}
                                                        >
                                                            {
                                                                task.priority
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-[#8A958F]">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div>
                                                        <p
                                                            className={`text-xs font-semibold ${
                                                                isOverdue(
                                                                    task
                                                                )
                                                                    ? "text-rose-600"
                                                                    : "text-[#4A564F]"
                                                            }`}
                                                        >
                                                            {formatDate(
                                                                task.deadline
                                                            )}
                                                        </p>

                                                        {isOverdue(
                                                            task
                                                        ) && (
                                                            <p className="mt-0.5 text-[10px] font-bold text-rose-500">
                                                                Overdue
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <Link
                                                        href={`/employee/tasks/${task.id}`}
                                                        className="inline-flex items-center gap-1 text-xs font-bold text-[#6B7770] transition group-hover:text-[#166534]"
                                                    >
                                                        View
                                                        <ArrowIcon />
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile */}
                        <div className="divide-y divide-[#E8EEEA] lg:hidden">
                            {filteredTasks.map((task) => (
                                <Link
                                    key={task.id}
                                    href={`/employee/tasks/${task.id}`}
                                    className="block p-4 transition hover:bg-[#F8FAF9]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="line-clamp-1 text-sm font-bold text-[#18201C]">
                                                {task.title ||
                                                    "Untitled Task"}
                                            </h3>

                                            <p className="mt-1 text-[11px] font-medium text-[#6B7770]">
                                                {getProjectName(
                                                    task.project
                                                )}
                                            </p>
                                        </div>

                                        <span className="shrink-0 text-[#8A958F]">
                                            <ArrowIcon />
                                        </span>
                                    </div>

                                    {task.description && (
                                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#6B7770]">
                                            {task.description}
                                        </p>
                                    )}

                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        <span
                                            className={`rounded-full px-2 py-1 text-[10px] font-bold capitalize ring-1 ${getStatusClasses(
                                                task.status
                                            )}`}
                                        >
                                            {normalizeStatus(
                                                task.status
                                            )}
                                        </span>

                                        {task.priority && (
                                            <span
                                                className={`rounded-full px-2 py-1 text-[10px] font-bold capitalize ring-1 ${getPriorityClasses(
                                                    task.priority
                                                )}`}
                                            >
                                                {task.priority}
                                            </span>
                                        )}

                                        {isOverdue(task) && (
                                            <span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200">
                                                Overdue
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-3 flex items-center justify-between border-t border-[#E8EEEA] pt-3">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A958F]">
                                            Deadline
                                        </span>

                                        <span
                                            className={`text-[11px] font-bold ${
                                                isOverdue(task)
                                                    ? "text-rose-600"
                                                    : "text-[#4A564F]"
                                            }`}
                                        >
                                            {formatDate(
                                                task.deadline
                                            )}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    </main>
);


}
