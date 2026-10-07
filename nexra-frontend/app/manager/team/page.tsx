"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Employee = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    designation?: string | null;
    role?: string | null;
    status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

type EmployeeForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
    designation: string;
};

type ApiResponse = {
    message?: string;
    employees?: Employee[] | { data?: Employee[] };
    data?: Employee[] | { data?: Employee[] };
};

const emptyForm: EmployeeForm = {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    designation: "",
};

function extractEmployees(response: ApiResponse): Employee[] {
    const source = response.employees ?? response.data;

    if (Array.isArray(source)) {
        return source;
    }

    if (
        source &&
        typeof source === "object" &&
        Array.isArray(source.data)
    ) {
        return source.data;
    }

    return [];
}

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (!parts.length) {
        return "E";
    }

    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }

    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}

function formatDate(date?: string | null) {
    if (!date) {
        return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getStatusClass(status?: string | null) {
    const normalized = (
        status || "active"
    ).toLowerCase();

    if (normalized === "active") {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    return "border-amber-200 bg-amber-50 text-amber-700";
}

function getStatusDotClass(status?: string | null) {
    const normalized = (
        status || "active"
    ).toLowerCase();

    if (normalized === "active") {
        return "bg-emerald-500";
    }

    return "bg-amber-500";
}

function formatStatus(status?: string | null) {
    if (!status) {
        return "Active";
    }

    return status
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}

function TeamIcon({
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
                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
            />
            <circle cx="9" cy="7" r="4" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
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

function PhoneIcon() {
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
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z"
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

function BriefcaseIcon() {
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
                y="7"
                width="18"
                height="13"
                rx="2"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"
            />
        </svg>
    );
}

export default function ManagerTeamPage() {
    const router = useRouter();

    const {
        token,
        user,
        loading: authLoading,
    } = useAuth();

    const [employees, setEmployees] = useState<Employee[]>(
        []
    );

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] =
        useState<Employee | null>(null);

    const [form, setForm] =
        useState<EmployeeForm>(emptyForm);

    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!token) {
            router.push("/login");
            return;
        }

        if (user?.role && user.role !== "manager") {
            router.push("/");
            return;
        }

        void loadTeam();
    }, [token, user, authLoading, router]);

    async function loadTeam() {
        if (!token) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response =
                await apiFetch<ApiResponse>(
                    "/manager/team",
                    {
                        token,
                    }
                );

            setEmployees(
                extractEmployees(response)
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load team members."
            );
        } finally {
            setLoading(false);
        }
    }

    const filteredEmployees = useMemo(() => {
        const normalizedSearch =
            search.trim().toLowerCase();

        return employees.filter((employee) => {
            const matchesSearch =
                !normalizedSearch ||
                employee.name
                    ?.toLowerCase()
                    .includes(normalizedSearch) ||
                employee.email
                    ?.toLowerCase()
                    .includes(normalizedSearch) ||
                employee.designation
                    ?.toLowerCase()
                    .includes(normalizedSearch);

            const normalizedStatus =
                employee.status?.toLowerCase() ||
                "active";

            const matchesStatus =
                statusFilter === "all" ||
                normalizedStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [employees, search, statusFilter]);

    function openCreateModal() {
        setEditingEmployee(null);
        setForm(emptyForm);
        setError("");
        setModalOpen(true);
    }

    function openEditModal(employee: Employee) {
        setEditingEmployee(employee);

        setForm({
            name: employee.name || "",
            email: employee.email || "",
            password: "",
            password_confirmation: "",
            phone: employee.phone || "",
            designation: employee.designation || "",
        });

        setError("");
        setModalOpen(true);
    }

    function closeModal() {
        if (saving) {
            return;
        }

        setModalOpen(false);
        setEditingEmployee(null);
        setForm(emptyForm);
        setError("");
    }

    function updateForm(
        field: keyof EmployeeForm,
        value: string
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!token) {
            return;
        }

        setError("");

        const name = form.name.trim();
        const email = form.email.trim();
        const phone = form.phone.trim();
        const designation =
            form.designation.trim();
        const password = form.password.trim();
        const passwordConfirmation =
            form.password_confirmation.trim();

        if (!name) {
            setError("Employee name is required.");
            return;
        }

        if (!email) {
            setError("Employee email is required.");
            return;
        }

        if (!editingEmployee && !password) {
            setError(
                "Password is required when creating an employee."
            );
            return;
        }

        if (password) {
            if (password.length < 8) {
                setError(
                    "Password must be at least 8 characters."
                );
                return;
            }

            if (!passwordConfirmation) {
                setError(
                    "Please confirm the password."
                );
                return;
            }

            if (
                password !== passwordConfirmation
            ) {
                setError(
                    "Passwords do not match."
                );
                return;
            }
        }

        if (
            !password &&
            passwordConfirmation
        ) {
            setError(
                "Enter a new password before entering password confirmation."
            );
            return;
        }

        const payload: Record<string, string> = {
            name,
            email,
            phone,
            designation,
        };

        if (password) {
            payload.password = password;
            payload.password_confirmation =
                passwordConfirmation;
        }

        try {
            setSaving(true);

            if (editingEmployee) {
                await apiFetch(
                    `/manager/team/${editingEmployee.id}`,
                    {
                        method: "PUT",
                        token,
                        body: JSON.stringify(
                            payload
                        ),
                    }
                );
            } else {
                await apiFetch(
                    "/manager/team",
                    {
                        method: "POST",
                        token,
                        body: JSON.stringify({
                            ...payload,
                            password,
                            password_confirmation:
                                passwordConfirmation,
                        }),
                    }
                );
            }

            closeModal();
            await loadTeam();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save employee."
            );
        } finally {
            setSaving(false);
        }
    }

    async function toggleStatus(
        employee: Employee
    ) {
        if (!token) {
            return;
        }

        const currentStatus =
            employee.status?.toLowerCase() ||
            "active";

        const newStatus =
            currentStatus === "active"
                ? "inactive"
                : "active";

        const confirmed = window.confirm(
            `Are you sure you want to ${
                newStatus === "active"
                    ? "activate"
                    : "deactivate"
            } ${employee.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await apiFetch(
                `/manager/team/${employee.id}/status`,
                {
                    method: "PATCH",
                    token,
                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            );

            await loadTeam();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update employee status."
            );
        }
    }

    async function deleteEmployee(
        employee: Employee
    ) {
        if (!token) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${employee.name}? This action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await apiFetch(
                `/manager/team/${employee.id}`,
                {
                    method: "DELETE",
                    token,
                }
            );

            await loadTeam();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete employee."
            );
        }
    }

    if (authLoading || loading) {
        return (
            <div className="space-y-6">
                <section className="overflow-hidden rounded-2xl bg-[#172554] shadow-lg">
                    <div className="animate-pulse p-6 sm:p-7">
                        <div className="h-3 w-32 rounded bg-white/10" />
                        <div className="mt-5 h-10 w-48 rounded bg-white/10" />
                        <div className="mt-2 h-4 w-80 max-w-full rounded bg-white/10" />
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="h-11 flex-1 animate-pulse rounded-xl bg-slate-100" />
                        <div className="h-11 w-36 animate-pulse rounded-xl bg-slate-100" />
                    </div>
                </section>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map(
                        (item) => (
                            <div
                                key={item}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                            >
                                <div className="h-1 bg-slate-200" />

                                <div className="animate-pulse p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="h-11 w-11 rounded-xl bg-slate-200" />
                                        <div className="h-6 w-20 rounded-full bg-slate-200" />
                                    </div>

                                    <div className="mt-5 h-5 w-2/3 rounded bg-slate-200" />

                                    <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />

                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <div className="h-16 rounded-xl bg-slate-100" />
                                        <div className="h-16 rounded-xl bg-slate-100" />
                                    </div>

                                    <div className="mt-5 space-y-2">
                                        <div className="h-3 w-full rounded bg-slate-100" />
                                        <div className="h-3 w-4/5 rounded bg-slate-100" />
                                    </div>
                                </div>

                                <div className="h-14 bg-slate-50" />
                            </div>
                        )
                    )}
                </div>
            </div>
        );
    }

    if (!user || user.role !== "manager") {
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
                                Team
                            </span>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-indigo-200 backdrop-blur-sm">
                                <TeamIcon className="h-5 w-5" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    Team
                                </h1>

                                <p className="mt-1 text-sm text-indigo-100/75">
                                    Manage employees and
                                    workspace access.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#172554] shadow-sm transition hover:bg-indigo-50 hover:shadow-md"
                    >
                        <PlusIcon />
                        Add Employee
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
                            placeholder="Search team members by name, email or designation..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                    >
                        <option value="all">
                            All Status
                        </option>

                        <option value="active">
                            Active
                        </option>

                        <option value="inactive">
                            Inactive
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
                                Unable to process team request
                            </p>

                            <p className="mt-0.5 text-xs text-red-600">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading &&
                filteredEmployees.length === 0 && (
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col items-center px-6 py-16 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                <TeamIcon className="h-7 w-7" />
                            </div>

                            <h2 className="mt-5 text-lg font-bold text-slate-900">
                                No team members found
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                {search ||
                                statusFilter !==
                                    "all"
                                    ? "Try changing your search or status filter."
                                    : "Add your first employee to start managing your team in Nexra."}
                            </p>

                            {!search &&
                                statusFilter ===
                                    "all" && (
                                    <button
                                        type="button"
                                        onClick={
                                            openCreateModal
                                        }
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#172554] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-900"
                                    >
                                        <PlusIcon />
                                        Add Employee
                                    </button>
                                )}
                        </div>
                    </section>
                )}

            {/* Team Cards */}
            {filteredEmployees.length > 0 && (
                <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredEmployees.map(
                        (employee) => {
                            const status =
                                employee.status?.toLowerCase() ||
                                "active";

                            const isActive =
                                status === "active";

                            return (
                                <article
                                    key={employee.id}
                                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
                                >
                                    {/* Card accent */}
                                    <div className="h-1 bg-[#172554]" />

                                    <div className="flex-1 p-5">
                                        {/* Top */}
                                        <div className="flex items-start justify-between gap-4">
                                            <Link
                                                href={`/manager/team/${employee.id}`}
                                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700 transition duration-200 group-hover:bg-[#172554] group-hover:text-white"
                                            >
                                                {getInitials(
                                                    employee.name
                                                )}
                                            </Link>

                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                                                    employee.status
                                                )}`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${getStatusDotClass(
                                                        employee.status
                                                    )}`}
                                                />

                                                {formatStatus(
                                                    employee.status
                                                )}
                                            </span>
                                        </div>

                                        {/* Employee */}
                                        <Link
                                            href={`/manager/team/${employee.id}`}
                                            className="block"
                                        >
                                            <h2 className="mt-5 line-clamp-1 text-lg font-bold tracking-tight text-slate-900 transition group-hover:text-indigo-700">
                                                {employee.name}
                                            </h2>

                                            <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                                                {employee.designation ||
                                                    "Employee"}
                                            </p>

                                            <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                                                {employee.email}
                                            </p>
                                        </Link>

                                        {/* Contact / Role Metrics */}
                                        <div className="mt-5 grid grid-cols-2 divide-x divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                            <div className="p-3">
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <BriefcaseIcon />

                                                    <span className="text-[10px] font-semibold uppercase tracking-wider">
                                                        Role
                                                    </span>
                                                </div>

                                                <p className="mt-1.5 truncate text-sm font-bold capitalize text-slate-900">
                                                    {employee.role ||
                                                        "Employee"}
                                                </p>
                                            </div>

                                            <div className="p-3">
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <PhoneIcon />

                                                    <span className="text-[10px] font-semibold uppercase tracking-wider">
                                                        Phone
                                                    </span>
                                                </div>

                                                <p className="mt-1.5 truncate text-sm font-bold text-slate-900">
                                                    {employee.phone ||
                                                        "—"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="mt-5 space-y-2.5">
                                            <div className="flex items-center justify-between gap-3 text-xs">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <CalendarIcon />

                                                    <span>
                                                        Joined
                                                    </span>
                                                </div>

                                                <span className="font-semibold text-slate-700">
                                                    {formatDate(
                                                        employee.created_at
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 text-xs">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <BriefcaseIcon />

                                                    <span>
                                                        Designation
                                                    </span>
                                                </div>

                                                <span className="max-w-[170px] truncate font-semibold text-slate-700">
                                                    {employee.designation ||
                                                        "—"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="border-t border-slate-100 bg-slate-50/70 p-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link
                                                href={`/manager/team/${employee.id}`}
                                                className="group flex items-center justify-center gap-2 rounded-xl bg-[#172554] px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-900 hover:shadow-md"
                                            >
                                                View Member
                                                <ArrowIcon />
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditModal(
                                                        employee
                                                    )
                                                }
                                                className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                                            >
                                                Edit
                                            </button>
                                        </div>

                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void toggleStatus(
                                                        employee
                                                    )
                                                }
                                                className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                                            >
                                                {isActive
                                                    ? "Deactivate"
                                                    : "Activate"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void deleteEmployee(
                                                        employee
                                                    )
                                                }
                                                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        }
                    )}
                </section>
            )}

            {/* Add / Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
                    <div
                        className="absolute inset-0"
                        onClick={closeModal}
                    />

                    <div className="relative z-10 my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div className="relative overflow-hidden bg-[#172554] px-6 py-5 sm:px-7">
                            <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-indigo-200">
                                        <span>
                                            Workspace
                                        </span>

                                        <span className="text-indigo-400">
                                            /
                                        </span>

                                        <span className="text-white">
                                            Team
                                        </span>
                                    </div>

                                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
                                        {editingEmployee
                                            ? "Edit Employee"
                                            : "Add Employee"}
                                    </h2>

                                    <p className="mt-1 text-sm text-indigo-100/70">
                                        {editingEmployee
                                            ? "Update employee information and account credentials."
                                            : "Create a new employee account for Nexra."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white"
                                    aria-label="Close modal"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            d="m6 6 12 12M18 6 6 18"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="max-h-[calc(100vh-180px)] overflow-y-auto"
                        >
                            <div className="space-y-5 p-6 sm:p-7">
                                {error && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                        {error}
                                    </div>
                                )}

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Full Name
                                            <span className="text-red-500">
                                                {" "}
                                                *
                                            </span>
                                        </label>

                                        <input
                                            value={
                                                form.name
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateForm(
                                                    "name",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter employee name"
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Email
                                            <span className="text-red-500">
                                                {" "}
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="email"
                                            value={
                                                form.email
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateForm(
                                                    "email",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="employee@example.com"
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Phone
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                form.phone
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateForm(
                                                    "phone",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter phone number"
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Designation
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                form.designation
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateForm(
                                                    "designation",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="e.g. Frontend Developer"
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            {editingEmployee
                                                ? "New Password"
                                                : "Password"}

                                            {!editingEmployee && (
                                                <span className="text-red-500">
                                                    {" "}
                                                    *
                                                </span>
                                            )}
                                        </label>

                                        <input
                                            type="password"
                                            value={
                                                form.password
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateForm(
                                                    "password",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder={
                                                editingEmployee
                                                    ? "Leave blank to keep current"
                                                    : "Minimum 8 characters"
                                            }
                                            autoComplete="new-password"
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                        />

                                        {editingEmployee && (
                                            <p className="mt-1.5 text-xs text-slate-400">
                                                Leave blank if you
                                                do not want to
                                                change the
                                                password.
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Confirm Password

                                            {!editingEmployee && (
                                                <span className="text-red-500">
                                                    {" "}
                                                    *
                                                </span>
                                            )}
                                        </label>

                                        <input
                                            type="password"
                                            value={
                                                form.password_confirmation
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateForm(
                                                    "password_confirmation",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder={
                                                editingEmployee
                                                    ? "Confirm new password"
                                                    : "Re-enter password"
                                            }
                                            autoComplete="new-password"
                                            className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                                                form.password_confirmation &&
                                                form.password !==
                                                    form.password_confirmation
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10"
                                            }`}
                                        />

                                        {form.password_confirmation &&
                                            form.password !==
                                                form.password_confirmation && (
                                                <p className="mt-1.5 text-xs font-medium text-red-600">
                                                    Passwords do
                                                    not match.
                                                </p>
                                            )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                                    <div className="flex gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                            <svg
                                                className="h-5 w-5"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="9"
                                                />

                                                <path
                                                    d="M12 11v5M12 8h.01"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-indigo-900">
                                                Employee account
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-indigo-700">
                                                New accounts are
                                                created with the
                                                employee role.
                                                Password
                                                confirmation is
                                                required whenever
                                                a password is
                                                created or
                                                changed.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end sm:px-7">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#172554] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#1e3a8a] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving && (
                                        <svg
                                            className="h-4 w-4 animate-spin"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                className="opacity-30"
                                                cx="12"
                                                cy="12"
                                                r="9"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            />

                                            <path
                                                d="M21 12a9 9 0 0 0-9-9"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    )}

                                    {saving
                                        ? "Saving..."
                                        : editingEmployee
                                        ? "Save Changes"
                                        : "Create Employee"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}