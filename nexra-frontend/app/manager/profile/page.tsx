"use client";

import {
    useEffect,
    useState,
    type FormEvent,
} from "react";

import Link from "next/link";

import { useAuth } from "../../../context/AuthContext";

function getInitials(name?: string) {
    if (!name) {
        return "M";
    }

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0).toUpperCase()
        )
        .join("");
}

function formatRole(role?: string) {
    if (!role) {
        return "Manager";
    }

    return (
        role.charAt(0).toUpperCase() +
        role.slice(1)
    );
}

function formatStatus(status?: string) {
    if (!status) {
        return "Active";
    }

    return (
        status.charAt(0).toUpperCase() +
        status.slice(1)
    );
}

function ProfileIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
        </svg>
    );
}

function BriefcaseIcon() {
    return (
        <svg
            width="19"
            height="19"
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
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M3 12h18" />
            <path d="M10 12v2h4v-2" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <rect
                x="4"
                y="10"
                width="16"
                height="11"
                rx="2"
            />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
    );
}

function EditIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="m5 12 4 4L19 6" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M6 6l12 12" />
            <path d="M18 6 6 18" />
        </svg>
    );
}

function MailIcon() {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
            />
            <path d="m3 7 9 6 9-6" />
        </svg>
    );
}

function PhoneIcon() {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M6.5 3.5h3l1.5 4-2 1.5a15 15 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2C11.5 19.5 4.5 12.5 4.5 5.5a2 2 0 0 1 2-2Z" />
        </svg>
    );
}

export default function ManagerProfilePage() {
    const { user, loading } = useAuth();

    const [editing, setEditing] =
        useState(false);

    const [name, setName] =
        useState("");

    const [phone, setPhone] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (!user) {
            return;
        }

        setName(user.name || "");
        setPhone(user.phone || "");
        setEmail(user.email || "");
    }, [user]);

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading manager profile...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Profile unavailable
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Please log in again to view
                        your manager profile.
                    </p>

                    <Link
                        href="/"
                        className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    const currentUser = user;

    const initials = getInitials(
        editing
            ? name
            : currentUser.name
    );

    function handleEdit() {
        setName(
            currentUser.name || ""
        );

        setPhone(
            currentUser.phone || ""
        );

        setEmail(
            currentUser.email || ""
        );

        setPassword("");
        setConfirmPassword("");

        setMessage("");
        setError("");
        setEditing(true);
    }

    function handleCancel() {
        setName(
            currentUser.name || ""
        );

        setPhone(
            currentUser.phone || ""
        );

        setEmail(
            currentUser.email || ""
        );

        setPassword("");
        setConfirmPassword("");

        setMessage("");
        setError("");
        setEditing(false);
    }

    async function handleSave(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setMessage("");
        setError("");

        const trimmedName =
            name.trim();

        const trimmedPhone =
            phone.trim();

        const trimmedEmail =
            email.trim();

        if (!trimmedName) {
            setError(
                "Full name is required."
            );
            return;
        }

        if (trimmedName.length < 2) {
            setError(
                "Full name must contain at least 2 characters."
            );
            return;
        }

        if (!trimmedEmail) {
            setError(
                "Email address is required."
            );
            return;
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(trimmedEmail)) {
            setError(
                "Please enter a valid email address."
            );
            return;
        }

        if (
            password.length > 0 &&
            password.length < 8
        ) {
            setError(
                "Password must contain at least 8 characters."
            );
            return;
        }

        if (
            password.length > 0 &&
            password !== confirmPassword
        ) {
            setError(
                "Password and confirm password do not match."
            );
            return;
        }

        setSaving(true);

        /*
         * Profile API will be connected
         * in the next backend step.
         *
         * Fields prepared for API:
         * name
         * phone
         * email
         * password
         * password_confirmation
         */

        await new Promise((resolve) =>
            setTimeout(resolve, 500)
        );

        setSaving(false);

        setMessage(
            "Profile changes are ready. The save API will be connected next."
        );
    }

    return (
        <div className="space-y-5">
            {/* Page Header */}
            <section className="overflow-hidden rounded-2xl bg-[#172554] shadow-sm">
                <div className="relative px-5 py-6 sm:px-6">
                    <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl" />

                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-blue-200/70">
                                <Link
                                    href="/manager/dashboard"
                                    className="transition hover:text-white"
                                >
                                    Workspace
                                </Link>

                                <span>/</span>

                                <span className="text-blue-100">
                                    Manager Profile
                                </span>
                            </div>

                            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                                Manager Profile
                            </h1>

                            <p className="mt-1 text-sm text-blue-100/65">
                                Manage your personal and
                                account information.
                            </p>
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-black/20">
                            {initials}
                        </div>
                    </div>
                </div>
            </section>

            {/* Profile Overview */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">
                            Profile Overview
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Your manager identity and
                            workspace account.
                        </p>
                    </div>

                    {!editing && (
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                            <EditIcon />
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-bold text-blue-700 ring-1 ring-blue-100">
                            {initials}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="truncate text-xl font-bold text-slate-900">
                                        {currentUser.name ||
                                            "Manager"}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {currentUser.designation ||
                                            "Manager"}
                                    </p>
                                </div>

                                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                    {formatStatus(
                                        currentUser.status
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                    {formatRole(
                                        currentUser.role
                                    )}
                                </span>

                                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                                    Workspace Administrator
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Messages */}
            {(message || error) && (
                <div
                    className={[
                        "rounded-xl border px-4 py-3 text-sm",
                        error
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-blue-200 bg-blue-50 text-blue-700",
                    ].join(" ")}
                >
                    <div className="flex items-center gap-2">
                        {!error && <CheckIcon />}

                        <span>
                            {error || message}
                        </span>
                    </div>
                </div>
            )}

            {/* Personal Information */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">
                                Personal Information
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Manage your name, phone and
                                email address.
                            </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <ProfileIcon />
                        </div>
                    </div>
                </div>

                {editing ? (
                    <form
                        onSubmit={handleSave}
                        className="p-5 sm:p-6"
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="manager-profile-name"
                                    className="mb-2 block text-xs font-semibold text-slate-800"
                                >
                                    Full Name
                                </label>

                                <input
                                    id="manager-profile-name"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your full name"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label
                                    htmlFor="manager-profile-phone"
                                    className="mb-2 block text-xs font-semibold text-slate-800"
                                >
                                    Phone Number
                                </label>

                                <input
                                    id="manager-profile-phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(event) =>
                                        setPhone(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your phone number"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                />
                            </div>

                            {/* Email */}
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="manager-profile-email"
                                    className="mb-2 block text-xs font-semibold text-slate-800"
                                >
                                    Email Address
                                </label>

                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                        <MailIcon />
                                    </div>

                                    <input
                                        id="manager-profile-email"
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your email address"
                                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="mt-7 border-t border-slate-200 pt-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                    <LockIcon />
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Change Password
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Leave these fields empty
                                        if you do not want to
                                        change your password.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                {/* Password */}
                                <div>
                                    <label
                                        htmlFor="manager-profile-password"
                                        className="mb-2 block text-xs font-semibold text-slate-800"
                                    >
                                        New Password
                                    </label>

                                    <input
                                        id="manager-profile-password"
                                        type="password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter new password"
                                        autoComplete="new-password"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label
                                        htmlFor="manager-profile-confirm-password"
                                        className="mb-2 block text-xs font-semibold text-slate-800"
                                    >
                                        Confirm Password
                                    </label>

                                    <input
                                        id="manager-profile-confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(event) =>
                                            setConfirmPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Confirm new password"
                                        autoComplete="new-password"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
                                <p className="text-[11px] leading-5 text-slate-500">
                                    Password must contain at
                                    least 8 characters. For
                                    security, never share your
                                    password with other users.
                                </p>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="mt-6 flex flex-col gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <CloseIcon />
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <>
                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckIcon />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid gap-px overflow-hidden bg-slate-200 sm:grid-cols-2">
                        {/* Name */}
                        <div className="bg-white px-5 py-5 sm:px-6">
                            <p className="text-xs font-medium text-slate-500">
                                Full Name
                            </p>

                            <p className="mt-1.5 text-sm font-semibold text-slate-900">
                                {currentUser.name ||
                                    "Not provided"}
                            </p>
                        </div>

                        {/* Email */}
                        <div className="bg-white px-5 py-5 sm:px-6">
                            <div className="flex items-center gap-2">
                                <MailIcon />

                                <p className="text-xs font-medium text-slate-500">
                                    Email Address
                                </p>
                            </div>

                            <p className="mt-1.5 break-all text-sm font-semibold text-slate-900">
                                {currentUser.email ||
                                    "Not provided"}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                                Your workspace login email.
                            </p>
                        </div>

                        {/* Phone */}
                        <div className="bg-white px-5 py-5 sm:px-6">
                            <div className="flex items-center gap-2">
                                <PhoneIcon />

                                <p className="text-xs font-medium text-slate-500">
                                    Phone Number
                                </p>
                            </div>

                            <p className="mt-1.5 text-sm font-semibold text-slate-900">
                                {currentUser.phone ||
                                    "Not provided"}
                            </p>
                        </div>
                    </div>
                )}
            </section>

            {/* Work Information */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <BriefcaseIcon />
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-slate-900">
                                Work Information
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Organization-managed workspace
                                information.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-px overflow-hidden bg-slate-200 sm:grid-cols-2">
                    {/* Designation */}
                    <div className="bg-white px-5 py-5 sm:px-6">
                        <p className="text-xs font-medium text-slate-500">
                            Designation
                        </p>

                        <p className="mt-1.5 text-sm font-semibold text-slate-900">
                            {currentUser.designation ||
                                "Manager"}
                        </p>
                    </div>

                    {/* Role */}
                    <div className="bg-white px-5 py-5 sm:px-6">
                        <p className="text-xs font-medium text-slate-500">
                            Workspace Role
                        </p>

                        <p className="mt-1.5 text-sm font-semibold text-slate-900">
                            {formatRole(
                                currentUser.role
                            )}
                        </p>
                    </div>

                    {/* Status */}
                    <div className="bg-white px-5 py-5 sm:px-6">
                        <p className="text-xs font-medium text-slate-500">
                            Account Status
                        </p>

                        <div className="mt-1.5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />

                            {formatStatus(
                                currentUser.status
                            )}
                        </div>
                    </div>

                    {/* Manager ID */}
                    <div className="bg-white px-5 py-5 sm:px-6">
                        <p className="text-xs font-medium text-slate-500">
                            Manager ID
                        </p>

                        <p className="mt-1.5 text-sm font-semibold text-slate-900">
                            {currentUser.id
                                ? `MGR-${String(
                                      currentUser.id
                                  ).padStart(
                                      4,
                                      "0"
                                  )}`
                                : "Not available"}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}