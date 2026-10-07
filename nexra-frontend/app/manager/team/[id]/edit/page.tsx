"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

type FormData = {
    name: string;
    email: string;
    phone: string;
    designation: string;
    password: string;
    password_confirmation: string;
};

type ApiResponse = {
    message?: string;
    employee?: Employee;
    data?: Employee;
};

const emptyForm: FormData = {
    name: "",
    email: "",
    phone: "",
    designation: "",
    password: "",
    password_confirmation: "",
};

export default function EditEmployeePage() {
    const params = useParams();
    const router = useRouter();

    const { token, user, loading: authLoading } = useAuth();

    const employeeId = params?.id as string;

    const [employee, setEmployee] = useState<Employee | null>(
        null
    );

    const [form, setForm] = useState<FormData>(emptyForm);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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

        if (!employeeId) {
            setError("Employee ID is missing.");
            setLoading(false);
            return;
        }

        void loadEmployee();
    }, [
        token,
        user,
        authLoading,
        employeeId,
        router,
    ]);

    async function loadEmployee() {
        if (!token || !employeeId) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await apiFetch<ApiResponse>(
                `/manager/team/${employeeId}`,
                {
                    token,
                }
            );

            const employeeData =
                response.employee ?? response.data;

            if (!employeeData) {
                throw new Error(
                    "Employee information could not be loaded."
                );
            }

            setEmployee(employeeData);

            setForm({
                name: employeeData.name || "",
                email: employeeData.email || "",
                phone: employeeData.phone || "",
                designation:
                    employeeData.designation || "",
                password: "",
                password_confirmation: "",
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load employee."
            );
        } finally {
            setLoading(false);
        }
    }

    function updateForm(
        field: keyof FormData,
        value: string
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setError("");
        setSuccess("");
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!token || !employeeId) {
            return;
        }

        setError("");
        setSuccess("");

        const name = form.name.trim();
        const email = form.email.trim();
        const phone = form.phone.trim();
        const designation = form.designation.trim();
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

        /*
         * Password is optional while editing.
         * If the manager enters a password, confirmation
         * becomes required and both values must match.
         */
        if (password) {
            if (password.length < 8) {
                setError(
                    "Password must be at least 8 characters."
                );
                return;
            }

            if (!passwordConfirmation) {
                setError(
                    "Please confirm the new password."
                );
                return;
            }

            if (password !== passwordConfirmation) {
                setError("Passwords do not match.");
                return;
            }
        }

        if (!password && passwordConfirmation) {
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

        /*
         * Only send password fields when the manager
         * actually wants to change the password.
         */
        if (password) {
            payload.password = password;
            payload.password_confirmation =
                passwordConfirmation;
        }

        try {
            setSaving(true);

            const response =
                await apiFetch<ApiResponse>(
                    `/manager/team/${employeeId}`,
                    {
                        method: "PUT",
                        token,
                        body: JSON.stringify(payload),
                    }
                );

            const updatedEmployee =
                response.employee ?? response.data;

            if (updatedEmployee) {
                setEmployee(updatedEmployee);
            }

            setForm((current) => ({
                ...current,
                password: "",
                password_confirmation: "",
            }));

            setSuccess(
                "Employee information updated successfully."
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update employee."
            );
        } finally {
            setSaving(false);
        }
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

    if (authLoading || loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-5xl">
                    <div className="animate-pulse space-y-6">
                        <div className="h-10 w-72 rounded-xl bg-slate-200" />

                        <div className="h-[600px] rounded-3xl bg-white shadow-sm" />
                    </div>
                </div>
            </main>
        );
    }

    if (!employee) {
        return (
            <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                            <svg
                                className="h-7 w-7"
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
                                    d="M12 8v4M12 16h.01"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>

                        <h1 className="mt-4 text-xl font-bold text-red-900">
                            Employee not found
                        </h1>

                        <p className="mt-2 text-sm text-red-700">
                            {error ||
                                "The requested employee could not be loaded."}
                        </p>

                        <Link
                            href="/manager/team"
                            className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                        >
                            Back to Team
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const status =
        employee.status?.toLowerCase() || "active";

    const isActive = status === "active";

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Breadcrumb / Back */}
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/manager/team"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                    >
                        <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                d="m15 18-6-6 6-6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        Team
                    </Link>

                    <span className="text-slate-300">/</span>

                    <Link
                        href={`/manager/team/${employee.id}`}
                        className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                    >
                        {employee.name}
                    </Link>

                    <span className="text-slate-300">/</span>

                    <span className="text-sm font-semibold text-slate-900">
                        Edit
                    </span>
                </div>

                {/* Header */}
                <section className="overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
                    <div className="relative px-6 py-8 sm:px-8">
                        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
                        <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

                        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-lg">
                                    {employee.name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "E"}
                                </div>

                                <div>
                                    <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                        Edit Employee
                                    </div>

                                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                        {employee.name}
                                    </h1>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Update employee profile and
                                        account information.
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={`/manager/team/${employee.id}`}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
                            >
                                <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        d="M15 18 9 12l6-6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                View Profile
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Alerts */}
                {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        <svg
                            className="mt-0.5 h-5 w-5 shrink-0"
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
                                d="M12 8v4M12 16h.01"
                                strokeLinecap="round"
                            />
                        </svg>

                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        <svg
                            className="mt-0.5 h-5 w-5 shrink-0"
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
                                d="m8 12 2.5 2.5L16 9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        <span>{success}</span>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                    >
                        <div className="border-b border-slate-200 px-6 py-5 sm:px-7">
                            <h2 className="text-lg font-bold text-slate-950">
                                Employee Information
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Update the employee&apos;s profile
                                details.
                            </p>
                        </div>

                        <div className="space-y-6 p-6 sm:p-7">
                            <div className="grid gap-5 sm:grid-cols-2">
                                {/* Name */}
                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-sm font-bold text-slate-700">
                                        Full Name
                                        <span className="text-red-500">
                                            {" "}
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(event) =>
                                            updateForm(
                                                "name",
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter employee name"
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>

                                {/* Email */}
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
                                        value={form.email}
                                        onChange={(event) =>
                                            updateForm(
                                                "email",
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="employee@example.com"
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-700">
                                        Phone
                                    </label>

                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={(event) =>
                                            updateForm(
                                                "phone",
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter phone number"
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>

                                {/* Designation */}
                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-sm font-bold text-slate-700">
                                        Designation
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.designation
                                        }
                                        onChange={(event) =>
                                            updateForm(
                                                "designation",
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. Frontend Developer"
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>
                            </div>

                            {/* Password section */}
                            <div className="border-t border-slate-200 pt-6">
                                <div className="mb-5">
                                    <h3 className="text-base font-bold text-slate-950">
                                        Change Password
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Leave both password fields
                                        blank to keep the current
                                        password.
                                    </p>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    {/* New Password */}
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            New Password
                                        </label>

                                        <input
                                            type="password"
                                            value={form.password}
                                            onChange={(event) =>
                                                updateForm(
                                                    "password",
                                                    event.target
                                                        .value
                                                )
                                            }
                                            placeholder="Minimum 8 characters"
                                            autoComplete="new-password"
                                            className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                                                form.password &&
                                                form.password.length <
                                                    8
                                                    ? "border-amber-300 focus:border-amber-500 focus:ring-amber-500/10"
                                                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                                            }`}
                                        />

                                        <p className="mt-1.5 text-xs text-slate-400">
                                            Minimum 8 characters.
                                        </p>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Confirm New Password
                                        </label>

                                        <input
                                            type="password"
                                            value={
                                                form.password_confirmation
                                            }
                                            onChange={(event) =>
                                                updateForm(
                                                    "password_confirmation",
                                                    event.target
                                                        .value
                                                )
                                            }
                                            placeholder="Re-enter new password"
                                            autoComplete="new-password"
                                            className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                                                form.password_confirmation &&
                                                form.password !==
                                                    form.password_confirmation
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                                            }`}
                                        />

                                        {form.password_confirmation &&
                                            form.password !==
                                                form.password_confirmation && (
                                                <p className="mt-1.5 text-xs font-medium text-red-600">
                                                    Passwords do not
                                                    match.
                                                </p>
                                            )}
                                    </div>
                                </div>

                                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                                    <div className="flex gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
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
                                            <p className="text-sm font-bold text-blue-900">
                                                Password change is
                                                optional
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-blue-700">
                                                You do not need to enter a
                                                password when updating
                                                other employee details.
                                                If you enter a new
                                                password, confirmation
                                                must match exactly.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form footer */}
                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end sm:px-7">
                            <Link
                                href={`/manager/team/${employee.id}`}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                                    ? "Saving Changes..."
                                    : "Save Changes"}
                            </button>
                        </div>
                    </form>

                    {/* Account Summary */}
                    <aside className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-5">
                            <h2 className="text-base font-bold text-slate-950">
                                Account Summary
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Current account information
                            </p>
                        </div>

                        <div className="space-y-5 p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                                    {employee.name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "E"}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-900">
                                        {employee.name}
                                    </p>

                                    <p className="truncate text-xs text-slate-500">
                                        {employee.email}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-slate-500">
                                        Role
                                    </span>

                                    <span className="text-sm font-bold capitalize text-slate-900">
                                        {employee.role ||
                                            "employee"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-slate-500">
                                        Status
                                    </span>

                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                                            isActive
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-amber-50 text-amber-700"
                                        }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                isActive
                                                    ? "bg-emerald-500"
                                                    : "bg-amber-500"
                                            }`}
                                        />

                                        {isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-slate-500">
                                        Joined
                                    </span>

                                    <span className="text-right text-sm font-semibold text-slate-900">
                                        {formatDate(
                                            employee.created_at
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-slate-500">
                                        Last Updated
                                    </span>

                                    <span className="text-right text-sm font-semibold text-slate-900">
                                        {formatDate(
                                            employee.updated_at
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Security
                                </p>

                                <p className="mt-2 text-sm leading-5 text-slate-600">
                                    Passwords are securely handled by
                                    the Laravel backend. Existing
                                    passwords are never displayed.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}