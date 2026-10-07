"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "../../../../../lib/api";
import { useAuth } from "../../../../../context/AuthContext";

type Project = {
    id: number;
    title: string;
};

type Employee = {
    id: number;
    name: string;
    email?: string;
    designation?: string | null;
};

type Task = {
    id: number;
    project_id?: number;
    title?: string | null;
    description?: string | null;
    status?: string | null;
    priority?: string | null;
    deadline?: string | null;
    project?: Project | null;
    assigned_to?: number | null;
    assignees?: Employee[];
    employees?: Employee[];
};

type TaskResponse = {
    data?: Task;
    task?: Task;
};

type ProjectsResponse = {
    data?: Project[];
    projects?: Project[];
};

type EmployeesResponse = {
    data?: Employee[];
    employees?:
        | Employee[]
        | {
              data?: Employee[];
          };
};

function getEmployees(
    response: EmployeesResponse
): Employee[] {
    if (Array.isArray(response.employees)) {
        return response.employees;
    }

    if (response.employees?.data) {
        return response.employees.data;
    }

    if (Array.isArray(response.data)) {
        return response.data;
    }

    return [];
}

export default function EditTaskPage() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuth();

    const taskId = Array.isArray(params.id) ? params.id[0] : params.id;

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

        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const [taskResponse, projectsResponse] =
                    await Promise.all([
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
                    ]);

                const loadedTask =
                    taskResponse.data ||
                    taskResponse.task ||
                    null;

                if (!loadedTask) {
                    throw new Error("Task could not be loaded.");
                }

                setTask(loadedTask);

                const loadedProjects =
                    projectsResponse.projects ||
                    projectsResponse.data ||
                    [];

                setProjects(loadedProjects);

                const loadedProjectId =
                    loadedTask.project_id ||
                    loadedTask.project?.id ||
                    "";

                setProjectId(
                    loadedProjectId
                        ? String(loadedProjectId)
                        : ""
                );

                setTitle(
                    loadedTask.title
                        ? String(loadedTask.title)
                        : ""
                );

                setDescription(
                    loadedTask.description
                        ? String(loadedTask.description)
                        : ""
                );

                setStatus(
                    normalizeStatus(loadedTask.status)
                );

                setPriority(
                    normalizePriority(loadedTask.priority)
                );

                setDeadline(
                    normalizeDeadline(loadedTask.deadline)
                );

                const assignedEmployees =
                    loadedTask.assignees ||
                    loadedTask.employees ||
                    [];

                const existingEmployeeIds =
                    assignedEmployees
                        .map((employee) => Number(employee.id))
                        .filter(
                            (id) =>
                                Number.isFinite(id) &&
                                id > 0
                        );

                /*
                 * IMPORTANT:
                 * Load employees belonging to THIS project only.
                 *
                 * The Task API validates assignees against the
                 * selected project's employees.
                 */
                if (loadedProjectId) {
                    const employeesResponse =
                        await apiFetch<EmployeesResponse>(
                            `/manager/projects/employees?project_id=${encodeURIComponent(
                                String(loadedProjectId)
                            )}`,
                            {
                                token,
                            }
                        );

                    const loadedEmployees =
                        getEmployees(employeesResponse);

                    setEmployees(loadedEmployees);

                    /*
                     * Keep only IDs that are actually assigned
                     * to the selected project.
                     *
                     * This prevents the old task assignment data
                     * from causing the backend validation error.
                     */
                    const validEmployeeIds =
                        loadedEmployees
                            .map((employee) =>
                                Number(employee.id)
                            )
                            .filter(
                                (id) =>
                                    Number.isFinite(id) &&
                                    id > 0
                            );

                    const validExistingIds =
                        existingEmployeeIds.filter(
                            (id) =>
                                validEmployeeIds.includes(id)
                        );

                    /*
                     * If the task has an assigned_to value but
                     * assignees is unavailable, use it as fallback.
                     */
                    if (
                        validExistingIds.length === 0 &&
                        loadedTask.assigned_to
                    ) {
                        const fallbackId =
                            Number(
                                loadedTask.assigned_to
                            );

                        if (
                            Number.isFinite(fallbackId) &&
                            validEmployeeIds.includes(
                                fallbackId
                            )
                        ) {
                            setSelectedEmployees([
                                fallbackId,
                            ]);
                        } else {
                            setSelectedEmployees([]);
                        }
                    } else {
                        setSelectedEmployees(
                            validExistingIds
                        );
                    }
                } else {
                    setEmployees([]);
                    setSelectedEmployees([]);
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load task."
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [token, taskId]);

    function normalizeStatus(value?: string | null) {
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

    function normalizePriority(value?: string | null) {
        const normalized = String(value || "").toLowerCase();

        if (
            ["low", "medium", "high"].includes(
                normalized
            )
        ) {
            return normalized;
        }

        return "medium";
    }

    function normalizeDeadline(value?: string | null) {
        if (!value) {
            return "";
        }

        return String(value)
            .split("T")[0]
            .split(" ")[0];
    }

    async function loadProjectEmployees(
        selectedProjectId: string
    ) {
        if (!token || !selectedProjectId) {
            setEmployees([]);
            setSelectedEmployees([]);
            return;
        }

        try {
            setError("");

            const employeesResponse =
                await apiFetch<EmployeesResponse>(
                    `/manager/projects/employees?project_id=${encodeURIComponent(
                        selectedProjectId
                    )}`,
                    {
                        token,
                    }
                );

            const loadedEmployees =
                getEmployees(employeesResponse);

            setEmployees(loadedEmployees);
            setSelectedEmployees([]);
        } catch (err) {
            setEmployees([]);
            setSelectedEmployees([]);

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load project employees."
            );
        }
    }

    function toggleEmployee(employeeId: number) {
        const normalizedId = Number(employeeId);

        setSelectedEmployees((current) => {
            if (current.includes(normalizedId)) {
                return current.filter(
                    (id) => id !== normalizedId
                );
            }

            return [
                ...current,
                normalizedId,
            ];
        });

        setError((current) => {
            if (
                current
                    .toLowerCase()
                    .includes(
                        "select at least one employee assigned to this project"
                    ) ||
                current
                    .toLowerCase()
                    .includes(
                        "please select an employee assigned to the selected project"
                    )
            ) {
                return "";
            }

            return current;
        });
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!token) {
            setError(
                "Your session has expired. Please login again."
            );
            return;
        }

        if (!title.trim()) {
            setError("Task title is required.");
            return;
        }

        if (!projectId) {
            setError("Please select a project.");
            return;
        }

        /*
         * IMPORTANT:
         * Always send numeric employee IDs and only send IDs
         * that exist in the currently loaded project's employee list.
         */
        const validProjectEmployeeIds =
            employees.map((employee) =>
                Number(employee.id)
            );

        const validAssigneeIds =
            selectedEmployees
                .map((id) => Number(id))
                .filter(
                    (id) =>
                        Number.isFinite(id) &&
                        id > 0 &&
                        validProjectEmployeeIds.includes(id)
                );

        /*
         * The backend requires at least one employee assigned
         * to the selected project.
         */
        if (validAssigneeIds.length === 0) {
            setError(
                "Please select an employee assigned to the selected project."
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
                        project_id: Number(projectId),
                        title: title.trim(),
                        description:
                            description.trim() || null,
                        status,
                        priority,
                        deadline:
                            deadline || null,
                        assignees:
                            validAssigneeIds,
                    }),
                }
            );

            setSuccess(
                "Task updated successfully."
            );

            setTimeout(() => {
                router.push(
                    `/manager/tasks/${taskId}`
                );
            }, 1200);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Unable to update task.";

            setError(message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 w-56 rounded bg-slate-200" />
                            <div className="h-12 rounded bg-slate-200" />
                            <div className="h-12 rounded bg-slate-200" />
                            <div className="h-32 rounded bg-slate-200" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                        {error || "Task not found."}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
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
                                href={`/manager/tasks/${taskId}`}
                                className="transition hover:text-slate-900"
                            >
                                Task Details
                            </Link>

                            <span>/</span>

                            <span className="text-slate-700">
                                Edit
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Edit Task
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Update task information, status, priority and assignees.
                        </p>
                    </div>

                    <Link
                        href={`/manager/tasks/${taskId}`}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        Cancel
                    </Link>
                </div>

                {/* Success Popup */}
                {success && (
                    <div className="fixed right-5 top-5 z-[100]">
                        <div className="flex min-w-[300px] items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-2xl">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                ✓
                            </div>

                            <div>
                                <p className="font-semibold text-slate-900">
                                    Success
                                </p>

                                <p className="text-sm text-slate-600">
                                    {success}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Basic Information */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Task Information
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Update the basic details of this task.
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            {/* Title */}
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Task Title
                                </label>

                                <input
                                    type="text"
                                    value={title}
                                    onChange={(event) =>
                                        setTitle(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter task title"
                                    autoComplete="off"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                                />
                            </div>

                            {/* Project */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Project
                                </label>

                                <select
                                    value={projectId}
                                    onChange={async (
                                        event
                                    ) => {
                                        const newProjectId =
                                            event.target
                                                .value;

                                        setProjectId(
                                            newProjectId
                                        );

                                        await loadProjectEmployees(
                                            newProjectId
                                        );
                                    }}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                                >
                                    <option value="">
                                        Select project
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

                            {/* Deadline */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Deadline
                                </label>

                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={(event) =>
                                        setDeadline(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Status
                                </label>

                                <select
                                    value={status}
                                    onChange={(event) =>
                                        setStatus(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
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

                            {/* Priority */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Priority
                                </label>

                                <select
                                    value={priority}
                                    onChange={(event) =>
                                        setPriority(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
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

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter task description"
                                    rows={6}
                                    className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Employees */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Assign Employees
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Select the employees who should work on this task.
                            </p>
                        </div>

                        {!projectId ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                                Select a project first.
                            </div>
                        ) : employees.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                                No employees available.
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {employees.map(
                                    (employee) => {
                                        const employeeId =
                                            Number(
                                                employee.id
                                            );

                                        const selected =
                                            selectedEmployees.includes(
                                                employeeId
                                            );

                                        return (
                                            <button
                                                type="button"
                                                key={
                                                    employee.id
                                                }
                                                onClick={() =>
                                                    toggleEmployee(
                                                        employeeId
                                                    )
                                                }
                                                className={`rounded-xl border p-4 text-left transition ${
                                                    selected
                                                        ? "border-slate-900 bg-slate-900 text-white"
                                                        : "border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p
                                                            className={`truncate text-sm font-semibold ${
                                                                selected
                                                                    ? "text-white"
                                                                    : "text-slate-900"
                                                            }`}
                                                        >
                                                            {
                                                                employee.name
                                                            }
                                                        </p>

                                                        {employee.email && (
                                                            <p
                                                                className={`mt-1 truncate text-xs ${
                                                                    selected
                                                                        ? "text-slate-300"
                                                                        : "text-slate-500"
                                                                }`}
                                                            >
                                                                {
                                                                    employee.email
                                                                }
                                                            </p>
                                                        )}

                                                        {employee.designation && (
                                                            <p
                                                                className={`mt-1 truncate text-xs ${
                                                                    selected
                                                                        ? "text-slate-400"
                                                                        : "text-slate-400"
                                                                }`}
                                                            >
                                                                {
                                                                    employee.designation
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div
                                                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                                            selected
                                                                ? "border-white bg-white text-slate-900"
                                                                : "border-slate-300 bg-white text-transparent"
                                                        }`}
                                                    >
                                                        ✓
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        )}

                        {selectedEmployees.length > 0 && (
                            <p className="mt-4 text-sm font-medium text-slate-600">
                                {selectedEmployees.length} employee
                                {selectedEmployees.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                selected
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href={`/manager/tasks/${taskId}`}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Updating...
                                </>
                            ) : (
                                "Update Task"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}