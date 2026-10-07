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
        return "U";
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
        return "Employee";
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

export default function EmployeeProfilePage() {
    const { user, loading } = useAuth();

    const [editing, setEditing] =
        useState(false);

    const [name, setName] =
        useState("");

    const [phone, setPhone] =
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
    }, [user]);

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#166534]" />

                    <p className="mt-4 text-sm text-[#6B7770]">
                        Loading profile...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="rounded-2xl border border-[#E1E7E3] bg-white px-8 py-7 text-center shadow-sm">
                    <h2 className="text-lg font-semibold text-[#18201C]">
                        Profile unavailable
                    </h2>

                    <p className="mt-2 text-sm text-[#6B7770]">
                        Please log in again to view
                        your profile.
                    </p>

                    <Link
                        href="/"
                        className="mt-5 inline-flex rounded-xl bg-[#166534] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#14532D]"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    /*
     * From this point onward TypeScript knows
     * that currentUser cannot be null.
     */
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

        setSaving(true);

        /*
         * Profile update API will be connected
         * in the next backend/API step.
         *
         * We intentionally do not fake a database
         * update here.
         */

        await new Promise((resolve) =>
            setTimeout(resolve, 500)
        );

        setSaving(false);

        setMessage(
            "Profile editing is ready. The save API will be connected next."
        );
    }

    return (
        <div className="space-y-5">
            {/* Page Header */}
            <section className="overflow-hidden rounded-2xl bg-[#171A19] shadow-sm">
                <div className="px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#A7B3AC]">
                                <Link
                                    href="/employee/dashboard"
                                    className="transition hover:text-white"
                                >
                                    Workspace
                                </Link>

                                <span>/</span>

                                <span className="text-[#D6DED9]">
                                    Profile
                                </span>
                            </div>

                            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                                My Profile
                            </h1>

                            <p className="mt-1 text-sm text-[#A7B3AC]">
                                Manage your personal
                                workspace information.
                            </p>
                        </div>

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#166534] text-base font-bold text-white shadow-lg shadow-black/20">
                            {initials}
                        </div>
                    </div>
                </div>
            </section>

            {/* Profile Overview */}
            <section className="rounded-2xl border border-[#E1E7E3] bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-[#E1E7E3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <h2 className="text-sm font-bold text-[#18201C]">
                            Profile Overview
                        </h2>

                        <p className="mt-1 text-xs text-[#6B7770]">
                            Your identity and workspace
                            account.
                        </p>
                    </div>

                    {!editing && (
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#14532D]"
                        >
                            <EditIcon />
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#ECFDF3] text-2xl font-bold text-[#166534] ring-1 ring-[#BBF7D0]">
                            {initials}
                        </div>

                        <div className="min-w-0">
                            <h2 className="truncate text-xl font-bold text-[#18201C]">
                                {currentUser.name ||
                                    "Employee"}
                            </h2>

                            <p className="mt-1 text-sm text-[#6B7770]">
                                {currentUser.designation ||
                                    "Employee"}
                            </p>

                            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#ECFDF3] px-3 py-1 text-xs font-semibold text-[#166534]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />

                                {formatStatus(
                                    currentUser.status
                                )}
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
                            : "border-[#BBF7D0] bg-[#ECFDF3] text-[#166534]",
                    ].join(" ")}
                >
                    <div className="flex items-center gap-2">
                        {!error && (
                            <CheckIcon />
                        )}

                        <span>
                            {error || message}
                        </span>
                    </div>
                </div>
            )}

            {/* Personal Information */}
            <section className="rounded-2xl border border-[#E1E7E3] bg-white shadow-sm">
                <div className="border-b border-[#E1E7E3] px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-[#18201C]">
                                Personal Information
                            </h2>

                            <p className="mt-1 text-xs text-[#6B7770]">
                                Information you can
                                maintain yourself.
                            </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ECFDF3] text-[#166534]">
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
                            <div>
                                <label
                                    htmlFor="profile-name"
                                    className="mb-2 block text-xs font-semibold text-[#18201C]"
                                >
                                    Full Name
                                </label>

                                <input
                                    id="profile-name"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your full name"
                                    className="w-full rounded-xl border border-[#D8E0DB] bg-white px-3.5 py-2.5 text-sm text-[#18201C] outline-none transition placeholder:text-[#9AA59F] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/10"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="profile-phone"
                                    className="mb-2 block text-xs font-semibold text-[#18201C]"
                                >
                                    Phone Number
                                </label>

                                <input
                                    id="profile-phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(event) =>
                                        setPhone(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your phone number"
                                    className="w-full rounded-xl border border-[#D8E0DB] bg-white px-3.5 py-2.5 text-sm text-[#18201C] outline-none transition placeholder:text-[#9AA59F] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/10"
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-2 border-t border-[#E1E7E3] pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8E0DB] px-4 py-2.5 text-xs font-semibold text-[#18201C] transition hover:bg-[#F5F7F6] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <CloseIcon />
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#14532D] disabled:cursor-not-allowed disabled:opacity-60"
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
                    <div className="grid gap-px overflow-hidden bg-[#E1E7E3] sm:grid-cols-2">
                        <div className="bg-white px-5 py-5 sm:px-6">
                            <p className="text-xs font-medium text-[#6B7770]">
                                Full Name
                            </p>

                            <p className="mt-1.5 text-sm font-semibold text-[#18201C]">
                                {currentUser.name ||
                                    "Not provided"}
                            </p>
                        </div>

                        <div className="bg-white px-5 py-5 sm:px-6">
                            <p className="text-xs font-medium text-[#6B7770]">
                                Email Address
                            </p>

                            <p className="mt-1.5 break-all text-sm font-semibold text-[#18201C]">
                                {currentUser.email ||
                                    "Not provided"}
                            </p>

                            <p className="mt-1 text-[11px] text-[#8A958F]">
                                Managed by your
                                workspace.
                            </p>
                        </div>

                        <div className="bg-white px-5 py-5 sm:px-6">
                            <p className="text-xs font-medium text-[#6B7770]">
                                Phone Number
                            </p>

                            <p className="mt-1.5 text-sm font-semibold text-[#18201C]">
                                {currentUser.phone ||
                                    "Not provided"}
                            </p>
                        </div>
                    </div>
                )}
            </section>

            {/* Work Information */}
            <section className="rounded-2xl border border-[#E1E7E3] bg-white shadow-sm">
                <div className="border-b border-[#E1E7E3] px-5 py-4 sm:px-6">
                    <h2 className="text-sm font-bold text-[#18201C]">
                        Work Information
                    </h2>

                    <p className="mt-1 text-xs text-[#6B7770]">
                        Organization-managed workspace
                        information.
                    </p>
                </div>

                <div className="grid gap-px overflow-hidden bg-[#E1E7E3] sm:grid-cols-2">
                    <div className="bg-white px-5 py-5 sm:px-6">
                        <p className="text-xs font-medium text-[#6B7770]">
                            Designation
                        </p>

                        <p className="mt-1.5 text-sm font-semibold text-[#18201C]">
                            {currentUser.designation ||
                                "Not assigned"}
                        </p>
                    </div>

                    <div className="bg-white px-5 py-5 sm:px-6">
                        <p className="text-xs font-medium text-[#6B7770]">
                            Workspace Role
                        </p>

                        <p className="mt-1.5 text-sm font-semibold text-[#18201C]">
                            {formatRole(
                                currentUser.role
                            )}
                        </p>

                        <p className="mt-1 text-[11px] text-[#8A958F]">
                            Managed by your
                            workspace.
                        </p>
                    </div>

                    <div className="bg-white px-5 py-5 sm:px-6">
                        <p className="text-xs font-medium text-[#6B7770]">
                            Account Status
                        </p>

                        <div className="mt-1.5 inline-flex items-center gap-2 text-sm font-semibold text-[#166534]">
                            <span className="h-2 w-2 rounded-full bg-[#22C55E]" />

                            {formatStatus(
                                currentUser.status
                            )}
                        </div>
                    </div>

                    <div className="bg-white px-5 py-5 sm:px-6">
                        <p className="text-xs font-medium text-[#6B7770]">
                            Employee ID
                        </p>

                        <p className="mt-1.5 text-sm font-semibold text-[#18201C]">
                            {currentUser.id
                                ? `EMP-${String(
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