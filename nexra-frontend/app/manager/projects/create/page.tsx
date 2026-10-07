"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../../../../context/AuthContext";
import { apiFetch } from "../../../../lib/api";

type Employee = {
    id: number;
    name: string;
    email: string;
    designation?: string | null;
    role?: string;
    status?: string;
};

type EmployeesResponse = {
    message: string;
    employees:
        | Employee[]
        | {
              data?: Employee[];
          };
};

type ProjectResponse = {
    message: string;
    project: unknown;
};

function getEmployees(
    employees:
        | Employee[]
        | {
              data?: Employee[];
          }
) {
    if (Array.isArray(employees)) {
        return employees;
    }

    return employees.data || [];
}

function ArrowLeftIcon() {
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
                d="M19 12H5M12 19l-7-7 7-7"
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

function UserIcon() {
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
                d="M20 21a8 8 0 0 0-16 0"
            />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

export default function CreateProjectPage() {
    const router = useRouter();

    const {
        user,
        token,
        loading: authLoading,
    } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("pending");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedEmployees, setSelectedEmployees] =
        useState<number[]>([]);

    const [employees, setEmployees] = useState<Employee[]>(
        []
    );

    const [loadingEmployees, setLoadingEmployees] =
        useState(true);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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

        async function loadEmployees() {
            setLoadingEmployees(true);

            try {
                const response =
                    await apiFetch<EmployeesResponse>(
                        "/manager/projects/employees",
                        {
                            method: "GET",
                            token,
                        }
                    );

                setEmployees(
                    getEmployees(response.employees)
                );
            } catch {
                setEmployees([]);
            } finally {
                setLoadingEmployees(false);
            }
        }

        loadEmployees();
    }, [
        authLoading,
        user,
        token,
        router,
    ]);

    function toggleEmployee(id: number) {
        setSelectedEmployees((current) => {
            if (current.includes(id)) {
                return current.filter(
                    (employeeId) =>
                        employeeId !== id
                );
            }

            return [...current, id];
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
            setError("Project title is required.");
            return;
        }

        if (
            startDate &&
            endDate &&
            new Date(endDate) < new Date(startDate)
        ) {
            setError(
                "End date cannot be before the start date."
            );
            return;
        }

        setSubmitting(true);

        try {
            const response =
                await apiFetch<ProjectResponse>(
                    "/manager/projects",
                    {
                        method: "POST",
                        token,
                        body: JSON.stringify({
                            title: title.trim(),
                            description:
                                description.trim() ||
                                null,
                            status,
                            start_date:
                                startDate || null,
                            end_date:
                                endDate || null,
                            employee_ids:
                                selectedEmployees,
                        }),
                    }
                );

            setSuccess(
                response.message ||
                    "Project created successfully."
            );

            setTimeout(() => {
                router.push("/manager/projects");
            }, 700);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to create project."
            );
        } finally {
            setSubmitting(false);
        }
    }

    if (authLoading || !user) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    if (user.role !== "manager") {
        return null;
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div>
                <button
                    type="button"
                    onClick={() =>
                        router.push(
                            "/manager/projects"
                        )
                    }
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
                >
                    <ArrowLeftIcon />
                    Back to Projects
                </button>

                <div className="mt-5">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Create Project
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Create a new project and assign
                        employees to start managing work.
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-700">
                            {error}
                        </p>
                    </div>
                )}

                {success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-sm font-medium text-emerald-700">
                            {success}
                        </p>
                    </div>
                )}

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 p-6">
                        <h2 className="text-base font-semibold text-slate-900">
                            Project Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Basic information about the
                            project.
                        </p>
                    </div>

                    <div className="grid gap-5 p-6 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Project Title
                            </label>

                            <input
                                type="text"
                                value={title}
                                onChange={(event) =>
                                    setTitle(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="e.g. Nexra Workspace"
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target
                                            .value
                                    )
                                }
                                rows={5}
                                placeholder="Describe the project, its goals and scope..."
                                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Status
                            </label>

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target
                                            .value
                                    )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
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

                        <div />

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Start Date
                            </label>

                            <input
                                type="date"
                                value={startDate}
                                onChange={(event) =>
                                    setStartDate(
                                        event.target
                                            .value
                                    )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                End Date
                            </label>

                            <input
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={(event) =>
                                    setEndDate(
                                        event.target
                                            .value
                                    )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    Assign Employees
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Select the team members
                                    who will work on this
                                    project.
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                {selectedEmployees.length}{" "}
                                selected
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        {loadingEmployees ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(
                                    (item) => (
                                        <div
                                            key={item}
                                            className="h-16 animate-pulse rounded-xl bg-slate-100"
                                        />
                                    )
                                )}
                            </div>
                        ) : employees.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                                    <UserIcon />
                                </div>

                                <p className="mt-3 text-sm font-medium text-slate-700">
                                    No employees available
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Employees can be assigned
                                    after they are added to
                                    the team.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2">
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
                                                        ? "border-blue-300 bg-blue-50"
                                                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                                }`}
                                            >
                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                                        selected
                                                            ? "bg-blue-600 text-white"
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
                                                        {employee.designation ||
                                                            employee.email}
                                                    </p>
                                                </div>

                                                <div
                                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                                        selected
                                                            ? "border-blue-600 bg-blue-600 text-white"
                                                            : "border-slate-300 bg-white"
                                                    }`}
                                                >
                                                    {selected && (
                                                        <svg
                                                            className="h-3.5 w-3.5"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="3"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="m5 12 4 4L19 7"
                                                            />
                                                        </svg>
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
                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/manager/projects"
                            )
                        }
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <PlusIcon />
                                Create Project
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}