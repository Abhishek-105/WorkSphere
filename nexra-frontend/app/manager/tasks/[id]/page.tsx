"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";

type Project = {
    id: number;
    title: string;
};

type Employee = {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    designation?: string | null;
    profile_photo?: string | null;
    role?: string | null;
    status?: string | null;
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
    project?: Project | null;
    assigned_employee?: Employee | null;
    assignees?: Employee[];
};

type TaskResponse = {
    message?: string;
    task?: Task;
};

type ProjectsResponse = {
    message?: string;
    projects?: Project[];
    data?: Project[];
};

type EmployeesResponse = {
    message?: string;
    employees?: Employee[];
};

export default function EditTaskPage() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuth();

    const taskId = Array.isArray(params.id)
        ? params.id[0]
        : params.id;

    const [task, setTask] = useState<Task | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);

    const [projectId, setProjectId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("pending");
    const [priority, setPriority] = useState("medium");
    const [deadline, setDeadline] = useState("");
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!token || !taskId) {
            return;
        }

        let cancelled = false;

        async function loadData() {
            try {
                setLoading(true);
                setError("");
                setSuccess("");

                const [
                    taskResponse,
                    projectsResponse,
                    employeesResponse,
                ] = await Promise.all([
                    apiFetch<TaskResponse>(
                        `/manager/tasks/${taskId}`,
                        {
                            token,
                        }
                    ),

                    apiFetch<ProjectsResponse>(
                        "/manager/projects",
                        {
                            token,
                        }
                    ),

                    apiFetch<EmployeesResponse>(
                        "/manager/projects/employees",
                        {
                            token,
                        }
                    ),
                ]);

                if (cancelled) {
                    return;
                }

                const loadedTask = taskResponse.task || null;

                if (!loadedTask) {
                    throw new Error(
                        "Task could not be loaded."
                    );
                }

                const loadedProjects =
                    projectsResponse.projects ||
                    projectsResponse.data ||
                    [];

                const loadedEmployees =
                    employeesResponse.employees ||
                    [];

                setTask(loadedTask);
                setProjects(loadedProjects);
                setEmployees(loadedEmployees);

                /*
                 * Populate every field directly from the fresh
                 * task API response.
                 */

                const loadedProjectId =
                    loadedTask.project_id ??
                    loadedTask.project?.id ??
                    "";

                setProjectId(
                    loadedProjectId
                        ? String(loadedProjectId)
                        : ""
                );

                setTitle(
                    loadedTask.title ?? ""
                );

                setDescription(
                    loadedTask.description ?? ""
                );

                setStatus(
                    normalizeStatus(
                        loadedTask.status
                    )
                );

                setPriority(
                    normalizePriority(
                        loadedTask.priority
                    )
                );

                setDeadline(
                    normalizeDeadline(
                        loadedTask.deadline
                    )
                );

                /*
                 * The API gives the complete current assignee
                 * list in task.assignees.
                 *
                 * For task 12 this becomes [5], so Rohan is
                 * automatically selected.
                 */
                const assignedEmployees =
                    loadedTask.assignees || [];

                const assignedIds =
                    assignedEmployees
                        .map((employee) =>
                            Number(employee.id)
                        )
                        .filter((id) =>
                            Number.isFinite(id)
                        );

                /*
                 * If assignees is unexpectedly empty but
                 * assigned_to exists, preserve that employee.
                 */
                if (
                    assignedIds.length === 0 &&
                    loadedTask.assigned_to
                ) {
                    assignedIds.push(
                        Number(
                            loadedTask.assigned_to
                        )
                    );
                }

                setSelectedEmployees(
                    Array.from(
                        new Set(assignedIds)
                    )
                );
            } catch (err) {
                if (cancelled) {
                    return;
                }

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load task."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadData();

        return () => {
            cancelled = true;
        };
    }, [token, taskId]);

    function normalizeStatus(
        value?: string | null
    ) {
        const normalized = String(value || "")
            .toLowerCase()
            .replace(/[\s-]+/g, "_");

        if (
            normalized === "completed" ||
            normalized === "complete" ||
            normalized === "done"
        ) {
            return "completed";
        }

        if (
            normalized === "in_progress" ||
            normalized === "inprogress"
        ) {
            return "in_progress";
        }

        return "pending";
    }

    function normalizePriority(
        value?: string | null
    ) {
        const normalized =
            String(value || "").toLowerCase();

        if (
            ["low", "medium", "high"].includes(
                normalized
            )
        ) {
            return normalized;
        }

        return "medium";
    }

    function normalizeDeadline(
        value?: string | null
    ) {
        if (!value) {
            return "";
        }

        return String(value)
            .split("T")[0]
            .split(" ")[0];
    }

    function toggleEmployee(
        employeeId: number
    ) {
        setSelectedEmployees((current) => {
            if (current.includes(employeeId)) {
                return current.filter(
                    (id) => id !== employeeId
                );
            }

            return [
                ...current,
                employeeId,
            ];
        });

        setError("");
    }

    /*
     * Only show employees returned by the employee API.
     *
     * The current backend endpoint returns the available
     * employee list directly, so we don't incorrectly hide
     * employees because of missing project-membership data.
     */
    const availableEmployees = useMemo(() => {
        return employees;
    }, [employees]);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!title.trim()) {
            setError(
                "Task title is required."
            );
            return;
        }

        if (!projectId) {
            setError(
                "Please select a project."
            );
            return;
        }

        if (selectedEmployees.length === 0) {
            setError(
                "Please select at least one employee."
            );
            return;
        }

        setSaving(true);

        try {
            await apiFetch(
                `/manager/tasks/${taskId}`,
                {
                    method: "PUT",
                    token,

                    body: JSON.stringify({
                        project_id:
                            Number(projectId),

                        title:
                            title.trim(),

                        description:
                            description.trim() ||
                            null,

                        status,

                        priority,

                        deadline:
                            deadline || null,

                        assignees:
                            selectedEmployees,
                    }),
                }
            );

            /*
             * Only show success after the PUT request
             * actually succeeds.
             */
            setSuccess(
                "Task updated successfully."
            );

            /*
             * Give the user time to see the success
             * notification before opening the detail page.
             */
            window.setTimeout(() => {
                router.push(
                    `/manager/tasks/${taskId}`
                );
            }, 1200);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Unable to update task.";

            /*
             * Do not convert backend errors into fake
             * success messages.
             *
             * Hide the specific unwanted validation text
             * and show a cleaner message instead.
             */
            if (
                message
                    .toLowerCase()
                    .includes(
                        "select at least one employee assigned to this project"
                    )
            ) {
                setError(
                    "Please select an employee assigned to the selected project."
                );
            } else {
                setError(message);
            }
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 w-64 rounded bg-slate-200" />
                            <div className="h-4 w-96 rounded bg-slate-200" />

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="h-12 rounded bg-slate-200" />
                                <div className="h-12 rounded bg-slate-200" />
                                <div className="h-12 rounded bg-slate-200" />
                                <div className="h-12 rounded bg-slate-200" />
                            </div>

                            <div className="h-32 rounded bg-slate-200" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!task) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-3xl">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                        <h1 className="text-lg font-semibold text-red-800">
                            Task not found
                        </h1>

                        {error && (
                            <p className="mt-2 text-sm text-red-700">
                                {error}
                            </p>
                        )}

                        <Link
                            href="/manager/tasks"
                            className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                            Back to Tasks
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
            <div className="mx-auto max-w-5xl">

                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                            <Link
                                href="/manager/tasks"
                                className="transition hover:text-slate-900"
                            >
                                Tasks
                            </Link>

                            <span>/</span>

                            <Link
                                href={`/manager/tasks/${task.id}`}
                                className="transition hover:text-slate-900"
                            >
                                {task.title || "Task"}
                            </Link>

                            <span>/</span>

                            <span className="text-slate-700">
                                Edit
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Edit Task
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Update task details, status,
                            priority and assigned employees.
                        </p>
                    </div>

                    <Link
                        href={`/manager/tasks/${task.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        Cancel
                    </Link>
                </div>

                {/* Success notification */}
                {success && (
                    <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                            ✓
                        </div>

                        <span>{success}</span>
                    </div>
                )}

                {/* Error notification */}
                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 font-semibold">
                            !
                        </div>

                        <span>{error}</span>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Main details */}
                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                            <h2 className="text-base font-semibold text-slate-900">
                                Task Details
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Modify the basic information
                                for this task.
                            </p>
                        </div>

                        <div className="space-y-5 p-5 sm:p-6">

                            {/* Project */}
                            <div>
                                <label
                                    htmlFor="project"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Project
                                </label>

                                <select
                                    id="project"
                                    value={projectId}
                                    onChange={(event) => {
                                        setProjectId(
                                            event.target.value
                                        );
                                        setSelectedEmployees([]);
                                        setError("");
                                    }}
                                    disabled={saving}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                >
                                    <option value="">
                                        Select project
                                    </option>

                                    {projects.map(
                                        (project) => (
                                            <option
                                                key={project.id}
                                                value={project.id}
                                            >
                                                {project.title}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* Title */}
                            <div>
                                <label
                                    htmlFor="title"
                                    className="mb-2 block text-sm font-medium text-slate-700"
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
                                    disabled={saving}
                                    placeholder="Enter task title"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    htmlFor="description"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(
                                            event.target.value
                                        )
                                    }
                                    disabled={saving}
                                    rows={5}
                                    placeholder="Describe the task..."
                                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                />
                            </div>

                            {/* Status / Priority / Deadline */}
                            <div className="grid gap-5 md:grid-cols-3">

                                <div>
                                    <label
                                        htmlFor="status"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Status
                                    </label>

                                    <select
                                        id="status"
                                        value={status}
                                        onChange={(event) =>
                                            setStatus(
                                                event.target.value
                                            )
                                        }
                                        disabled={saving}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                    >
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

                                <div>
                                    <label
                                        htmlFor="priority"
                                        className="mb-2 block text-sm font-medium text-slate-700"
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
                                        disabled={saving}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
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
                                        className="mb-2 block text-sm font-medium text-slate-700"
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
                                        disabled={saving}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Employees */}
                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    Assign Employees
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Select one or more employees
                                    for this task.
                                </p>
                            </div>

                            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                {selectedEmployees.length} selected
                            </div>
                        </div>

                        <div className="p-5 sm:p-6">

                            {availableEmployees.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                                    <p className="text-sm font-medium text-slate-700">
                                        No employees available.
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Please add an employee
                                        before assigning this task.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {availableEmployees.map(
                                        (employee) => {
                                            const isSelected =
                                                selectedEmployees.includes(
                                                    employee.id
                                                );

                                            return (
                                                <button
                                                    key={employee.id}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleEmployee(
                                                            employee.id
                                                        )
                                                    }
                                                    disabled={saving}
                                                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                                                        isSelected
                                                            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                                                            : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                                                    } disabled:cursor-not-allowed disabled:opacity-60`}
                                                >
                                                    <div
                                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                                            isSelected
                                                                ? "bg-white/15 text-white"
                                                                : "bg-slate-100 text-slate-700"
                                                        }`}
                                                    >
                                                        {employee.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className={`truncate text-sm font-semibold ${
                                                                isSelected
                                                                    ? "text-white"
                                                                    : "text-slate-900"
                                                            }`}
                                                        >
                                                            {employee.name}
                                                        </p>

                                                        <p
                                                            className={`mt-0.5 truncate text-xs ${
                                                                isSelected
                                                                    ? "text-slate-300"
                                                                    : "text-slate-500"
                                                            }`}
                                                        >
                                                            {employee.email ||
                                                                "Employee"}
                                                        </p>
                                                    </div>

                                                    <div
                                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                                                            isSelected
                                                                ? "border-white bg-white text-slate-900"
                                                                : "border-slate-300 bg-white text-transparent"
                                                        }`}
                                                    >
                                                        ✓
                                                    </div>
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            )}

                            {selectedEmployees.length > 0 && (
                                <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
                                    <p className="text-xs font-medium text-slate-500">
                                        Selected employees
                                    </p>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {selectedEmployees.map(
                                            (employeeId) => {
                                                const employee =
                                                    availableEmployees.find(
                                                        (item) =>
                                                            item.id ===
                                                            employeeId
                                                    );

                                                if (!employee) {
                                                    return null;
                                                }

                                                return (
                                                    <span
                                                        key={employee.id}
                                                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                                                    >
                                                        {employee.name}
                                                    </span>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Footer actions */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href={`/manager/tasks/${task.id}`}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Updating...
                                </>
                            ) : (
                                "Update Task"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}