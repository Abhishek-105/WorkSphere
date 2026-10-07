"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";

type Employee = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    designation?: string | null;
    role?: string | null;
    status?: string | null;
    profile_photo?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

type EmployeeResponse = {
    message?: string;
    employee?: Employee;
    team?: Employee;
    data?: Employee;
};

export default function ManagerTeamDetailsPage() {
    const { token } = useAuth();
    const params = useParams();
    const router = useRouter();

    const employeeId = params?.id as string;

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadEmployee = async () => {
        if (!token || !employeeId) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await apiFetch<EmployeeResponse>(
                `/manager/team/${employeeId}`,
                {
                    token,
                }
            );

            const employeeData =
                response.employee ||
                response.team ||
                response.data ||
                null;

            setEmployee(employeeData);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load employee details."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmployee();
    }, [token, employeeId]);

    const normalizeStatus = (status?: string | null) => {
        if (!status) {
            return "active";
        }

        return status.toLowerCase();
    };

    const getInitials = (name?: string) => {
        if (!name) {
            return "U";
        }

        return (
            name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part.charAt(0))
                .join("")
                .toUpperCase() || "U"
        );
    };

    const formatDate = (date?: string | null) => {
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
    };

    const handleToggleStatus = async () => {
        if (!token || !employee) {
            return;
        }

        const currentStatus = normalizeStatus(employee.status);

        const newStatus =
            currentStatus === "active"
                ? "inactive"
                : "active";

        try {
            setActionLoading(true);
            setError("");
            setSuccess("");

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

            await loadEmployee();

            setSuccess(
                `Employee account is now ${newStatus}.`
            );

            setTimeout(() => {
                setSuccess("");
            }, 2500);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to update employee status."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !employee) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${employee.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setSuccess("");

            await apiFetch(
                `/manager/team/${employee.id}`,
                {
                    method: "DELETE",
                    token,
                }
            );

            router.push("/manager/team");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to delete employee."
            );
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                    <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-200" />

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="h-56 animate-pulse bg-slate-200" />

                        <div className="space-y-5 p-6">
                            <div className="h-6 w-64 animate-pulse rounded bg-slate-200" />
                            <div className="h-4 w-96 max-w-full animate-pulse rounded bg-slate-100" />

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3, 4, 5, 6].map(
                                    (item) => (
                                        <div
                                            key={item}
                                            className="h-24 animate-pulse rounded-2xl bg-slate-100"
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center p-6">
                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-600">
                            !
                        </div>

                        <h1 className="mt-5 text-xl font-bold text-slate-900">
                            Employee not found
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {error ||
                                "The requested employee could not be found."}
                        </p>

                        <Link
                            href="/manager/team"
                            className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Back to Team
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const status = normalizeStatus(employee.status);
    const isActive = status === "active";

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Breadcrumb / Back */}
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/manager/team"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    >
                        <span>←</span>
                        Back to Team
                    </Link>

                    <span className="text-sm text-slate-400">
                        / Employee Details
                    </span>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <span className="font-bold">!</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        <span className="font-bold">✓</span>
                        <span>{success}</span>
                    </div>
                )}

                {/* Profile Hero */}
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="relative overflow-hidden bg-slate-950 px-6 py-8 sm:px-8 lg:px-10">
                        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
                        <div className="absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 items-center gap-5">
                                {employee.profile_photo ? (
                                    <img
                                        src={employee.profile_photo}
                                        alt={employee.name}
                                        className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-4 ring-white/10 sm:h-24 sm:w-24"
                                    />
                                ) : (
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-2xl font-bold text-indigo-200 ring-4 ring-white/10 sm:h-24 sm:w-24 sm:text-3xl">
                                        {getInitials(
                                            employee.name
                                        )}
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
                                            Team Member
                                        </span>

                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                                isActive
                                                    ? "bg-emerald-400/15 text-emerald-300"
                                                    : "bg-white/10 text-slate-300"
                                            }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    isActive
                                                        ? "bg-emerald-400"
                                                        : "bg-slate-400"
                                                }`}
                                            />
                                            {isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </div>

                                    <h1 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                        {employee.name}
                                    </h1>

                                    <p className="mt-1 truncate text-sm text-slate-300 sm:text-base">
                                        {employee.designation ||
                                            "Employee"}
                                    </p>

                                    <p className="mt-1 truncate text-sm text-slate-400">
                                        {employee.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                                <Link
                                    href={`/manager/team/${employee.id}/edit`}
                                    className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
                                >
                                    Edit Employee
                                </Link>

                                <button
                                    type="button"
                                    onClick={
                                        handleToggleStatus
                                    }
                                    disabled={actionLoading}
                                    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {actionLoading
                                        ? "Updating..."
                                        : isActive
                                          ? "Deactivate"
                                          : "Activate"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Profile details */}
                    <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="bg-white p-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Email Address
                            </p>
                            <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                                {employee.email || "—"}
                            </p>
                        </div>

                        <div className="bg-white p-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Phone
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">
                                {employee.phone || "—"}
                            </p>
                        </div>

                        <div className="bg-white p-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Designation
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">
                                {employee.designation || "—"}
                            </p>
                        </div>

                        <div className="bg-white p-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Role
                            </p>
                            <p className="mt-2 text-sm font-semibold capitalize text-slate-900">
                                {employee.role || "employee"}
                            </p>
                        </div>

                        <div className="bg-white p-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Account Status
                            </p>
                            <p
                                className={`mt-2 text-sm font-semibold ${
                                    isActive
                                        ? "text-emerald-600"
                                        : "text-slate-600"
                                }`}
                            >
                                {isActive
                                    ? "Active"
                                    : "Inactive"}
                            </p>
                        </div>

                        <div className="bg-white p-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Joined
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">
                                {formatDate(
                                    employee.created_at
                                )}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Account Overview */}
                <section className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                                    Account Overview
                                </p>

                                <h2 className="mt-2 text-lg font-bold text-slate-900">
                                    Employee information
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Basic account information for this
                                    team member.
                                </p>
                            </div>

                            <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 sm:flex">
                                ◈
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-xs font-medium text-slate-400">
                                    Employee ID
                                </p>
                                <p className="mt-1 text-sm font-bold text-slate-900">
                                    #{employee.id}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-xs font-medium text-slate-400">
                                    Account Role
                                </p>
                                <p className="mt-1 text-sm font-bold capitalize text-slate-900">
                                    {employee.role ||
                                        "employee"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-xs font-medium text-slate-400">
                                    Created
                                </p>
                                <p className="mt-1 text-sm font-bold text-slate-900">
                                    {formatDate(
                                        employee.created_at
                                    )}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-xs font-medium text-slate-400">
                                    Last Updated
                                </p>
                                <p className="mt-1 text-sm font-bold text-slate-900">
                                    {formatDate(
                                        employee.updated_at
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
                            Danger Zone
                        </p>

                        <h2 className="mt-2 text-lg font-bold text-slate-900">
                            Delete employee
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Remove this employee account from the
                            team. This action should only be used when
                            the account is no longer required.
                        </p>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={actionLoading}
                            className="mt-6 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {actionLoading
                                ? "Processing..."
                                : "Delete Employee"}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}