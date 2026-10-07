"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiFetch } from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";

type Project = {
    id: number;
    title: string;
    description?: string | null;
};

type Employee = {
    id: number;
    name: string;
    email: string;
    designation?: string | null;
};

type ProjectsResponse = {
    projects:
        | Project[]
        | {
              data: Project[];
          };
};

type EmployeesResponse = {
    employees:
        | Employee[]
        | {
              data: Employee[];
          };
};

type CreateTaskResponse = {
    message: string;
    task: {
        id: number;
    };
};

function extractArray<T>(
    value: T[] | { data: T[] }
): T[] {
    return Array.isArray(value)
        ? value
        : value.data;
}

export default function CreateTaskPage() {
    const router = useRouter();
    const { token } = useAuth();

    const [projects, setProjects] = useState<Project[]>([]);
    const [employees, setEmployees] = useState<Employee[]>(
        []
    );

    const [projectId, setProjectId] =
        useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] =
        useState("");
    const [priority, setPriority] =
        useState("medium");
    const [deadline, setDeadline] =
        useState("");
    const [selectedEmployees, setSelectedEmployees] =
        useState<number[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingEmployees, setLoadingEmployees] =
        useState(false);
    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        async function loadProjects() {
            try {
                setLoading(true);
                setError("");

                const response =
                    await apiFetch<ProjectsResponse>(
                        "/manager/projects",
                        {
                            token,
                        }
                    );

                setProjects(
                    extractArray(response.projects)
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
    }, [token]);

    useEffect(() => {
        if (!token || !projectId) {
            setEmployees([]);
            setSelectedEmployees([]);
            return;
        }

        async function loadEmployees() {
            try {
                setLoadingEmployees(true);
                setError("");

                const response =
                    await apiFetch<EmployeesResponse>(
                        "/manager/projects/employees",
                        {
                            token,
                        }
                    );

                setEmployees(
                    extractArray(response.employees)
                );

                setSelectedEmployees([]);
            } catch (err) {
                setEmployees([]);
                setSelectedEmployees([]);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load employees."
                );
            } finally {
                setLoadingEmployees(false);
            }
        }

        loadEmployees();
    }, [projectId, token]);

    function toggleEmployee(
        employeeId: number
    ) {
        setSelectedEmployees((current) => {
            if (current.includes(employeeId)) {
                return current.filter(
                    (id) => id !== employeeId
                );
            }

            return [...current, employeeId];
        });
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!token) {
            setError("You are not authenticated.");
            return;
        }

        if (!projectId) {
            setError("Please select a project.");
            return;
        }

        if (!title.trim()) {
            setError("Task title is required.");
            return;
        }

        setSubmitting(true);
        setError("");
        setSuccess("");

        try {
            const response =
                await apiFetch<CreateTaskResponse>(
                    "/manager/tasks",
                    {
                        method: "POST",
                        token,
                        body: JSON.stringify({
                            project_id: Number(projectId),
                            title: title.trim(),
                            description:
                                description.trim() || null,
                            priority,
                            deadline:
                                deadline || null,
                            assignees:
                                selectedEmployees,
                        }),
                    }
                );

            setSuccess(
                response.message ||
                    "Task created successfully."
            );

            setTimeout(() => {
                router.push(
                    `/manager/tasks/${response.task.id}`
                );
            }, 700);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to create task."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="min-h-full bg-slate-50">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        href="/manager/tasks"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
                    >
                        <span>←</span>
                        Back to Tasks
                    </Link>

                    <div className="mt-4">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Create New Task
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Create a task and assign it to
                            employees working on the selected
                            project.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-5">
                            <h2 className="text-base font-semibold text-slate-900">
                                Task Information
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Define the main details of the
                                task.
                            </p>
                        </div>

                        <div className="grid gap-5 p-6 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="title"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Task Title
                                </label>

                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(event) =>
                                        setTitle(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. Build employee dashboard"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label
                                    htmlFor="description"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    rows={5}
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Describe what needs to be completed..."
                                    className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="project"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Project
                                </label>

                                <select
                                    id="project"
                                    value={projectId}
                                    onChange={(event) =>
                                        setProjectId(
                                            event.target.value
                                        )
                                    }
                                    disabled={loading}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                                    required
                                >
                                    <option value="">
                                        {loading
                                            ? "Loading projects..."
                                            : "Select a project"}
                                    </option>

                                    {projects.map(
                                        (project) => (
                                            <option
                                                key={
                                                    project.id
                                                }
                                                value={
                                                    project.id
                                                }
                                            >
                                                {
                                                    project.title
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="priority"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Priority
                                </label>

                                <select
                                    id="priority"
                                    value={priority}
                                    onChange={(event) =>
                                        setPriority(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                >
                                    <option value="low">
                                        Low
                                    </option>

                                    <option value="medium">
                                        Medium
                                    </option>

                                    <option value="high">
                                        High
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="deadline"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Deadline
                                </label>

                                <input
                                    id="deadline"
                                    type="date"
                                    value={deadline}
                                    onChange={(event) =>
                                        setDeadline(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">
                                        Assign Employees
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Select one or more employees
                                        for this task.
                                    </p>
                                </div>

                                {selectedEmployees.length >
                                    0 && (
                                    <span className="inline-flex w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                        {
                                            selectedEmployees.length
                                        }{" "}
                                        selected
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            {!projectId ? (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                                    <p className="text-sm font-medium text-slate-600">
                                        Select a project first.
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Employees assigned to that
                                        project will appear here.
                                    </p>
                                </div>
                            ) : loadingEmployees ? (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-8 text-center">
                                    <p className="text-sm font-medium text-slate-600">
                                        Loading employees...
                                    </p>
                                </div>
                            ) : employees.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-5 py-8 text-center">
                                    <p className="text-sm font-semibold text-amber-800">
                                        No employees available.
                                    </p>

                                    <p className="mt-1 text-xs text-amber-700">
                                        Assign employees to this
                                        project before creating an
                                        assigned task.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {employees.map(
                                        (employee) => {
                                            const selected =
                                                selectedEmployees.includes(
                                                    employee.id
                                                );

                                            return (
                                                <button
                                                    key={
                                                        employee.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        toggleEmployee(
                                                            employee.id
                                                        )
                                                    }
                                                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                                                        selected
                                                            ? "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-500/10"
                                                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <div
                                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                                            selected
                                                                ? "bg-indigo-600 text-white"
                                                                : "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >
                                                        {employee.name
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-slate-900">
                                                            {
                                                                employee.name
                                                            }
                                                        </p>

                                                        <p className="truncate text-xs text-slate-500">
                                                            {
                                                                employee.designation ||
                                                                employee.email
                                                            }
                                                        </p>
                                                    </div>

                                                    <div
                                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                                            selected
                                                                ? "border-indigo-600 bg-indigo-600 text-white"
                                                                : "border-slate-300 bg-white"
                                                        }`}
                                                    >
                                                        {selected && (
                                                            <span className="text-xs font-bold">
                                                                ✓
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href="/manager/tasks"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                loading ||
                                !projectId ||
                                !title.trim()
                            }
                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting
                                ? "Creating Task..."
                                : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}