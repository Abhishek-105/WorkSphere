"use client";

import {
    ChangeEvent,
    FormEvent,
    useEffect,
    useRef,
    useState,
} from "react";

import Link from "next/link";

import { updateProfile } from "../../../lib/auth";
import { useAuth } from "../../../context/AuthContext";

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

function formatRole(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function getProfileImageUrl(
    profilePhoto: string | null | undefined
): string | null {
    if (!profilePhoto) {
        return null;
    }

    if (
        profilePhoto.startsWith("http://") ||
        profilePhoto.startsWith("https://")
    ) {
        return profilePhoto;
    }

    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://worksphere-api-qvnl.onrender.com/api";

    const backendUrl = apiUrl.replace(/\/api\/?$/, "");
    const cleanPath = profilePhoto.replace(/^\/+/, "");

    if (cleanPath.startsWith("storage/")) {
        return `${backendUrl}/${cleanPath}`;
    }

    return `${backendUrl}/storage/${cleanPath}`;
}

function ProfileIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 20.25a7.5 7.5 0 0 1 15 0"
            />
        </svg>
    );
}

function BriefcaseIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 6.75V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5v1.25"
            />
            <rect
                x="3.75"
                y="6.75"
                width="16.5"
                height="12.75"
                rx="2"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 11.25h16.5"
            />
        </svg>
    );
}

function EditIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20h9"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m5 12 4 4L19 6"
            />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m6 6 12 12M18 6 6 18"
            />
        </svg>
    );
}

function MailIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
        >
            <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4 7 8 6 8-6"
            />
        </svg>
    );
}

function PhoneIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.5 3.75h3l1.5 4-2 1.5a13.5 13.5 0 0 0 5.75 5.75l1.5-2 4 1.5v3A2.5 2.5 0 0 1 18 20C10.268 20 4 13.732 4 6a2.5 2.5 0 0 1 2.5-2.25Z"
            />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
        >
            <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="2"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10V7a4 4 0 0 1 8 0v3"
            />
        </svg>
    );
}

export default function ManagerProfilePage() {
    const {
        user,
        token,
        loading,
        updateUser,
    } = useAuth();

    const fileInputRef =
        useRef<HTMLInputElement | null>(null);

    const [editing, setEditing] =
        useState(false);

    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [phone, setPhone] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [selectedPhoto, setSelectedPhoto] =
        useState<File | null>(null);

    const [previewUrl, setPreviewUrl] =
        useState<string | null>(null);

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
        setEmail(user.email || "");
        setPhone(user.phone || "");
    }, [user]);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-6xl animate-pulse">
                    <div className="mb-6 h-5 w-32 rounded bg-slate-200" />
                    <div className="h-44 rounded-2xl bg-white shadow-sm" />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-sm text-slate-600">
                        Unable to load your profile.
                    </p>
                </div>
            </div>
        );
    }

    const isDemoAccount =
        user.is_demo === true;

    const existingPhotoUrl =
        getProfileImageUrl(
            user.profile_photo
        );

    const displayedPhoto =
        previewUrl || existingPhotoUrl;

    const handlePhotoChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        setError("");
        setMessage("");

        if (!file.type.startsWith("image/")) {
            setError(
                "Please select a valid image file."
            );

            event.target.value = "";
            return;
        }

        if (
            file.size >
            5 * 1024 * 1024
        ) {
            setError(
                "Profile image must be smaller than 5 MB."
            );

            event.target.value = "";
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        const newPreviewUrl =
            URL.createObjectURL(file);

        setSelectedPhoto(file);
        setPreviewUrl(newPreviewUrl);
    };

    const openPhotoPicker = () => {
        setError("");
        setMessage("");
        fileInputRef.current?.click();
    };

    const cancelEditing = () => {
        setEditing(false);

        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");

        setPassword("");
        setConfirmPassword("");

        setSelectedPhoto(null);

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(null);
        setError("");
        setMessage("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSave = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (!name.trim()) {
            setError(
                "Full name is required."
            );
            return;
        }

        if (!email.trim()) {
            setError(
                "Email is required."
            );
            return;
        }

        if (
            !isDemoAccount &&
            password &&
            password.length < 8
        ) {
            setError(
                "New password must be at least 8 characters."
            );
            return;
        }

        if (
            !isDemoAccount &&
            password !== confirmPassword
        ) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        if (!token) {
            setError(
                "Your session has expired. Please log in again."
            );
            return;
        }

        try {
            setSaving(true);

            const formData =
                new FormData();

            formData.append(
                "name",
                name.trim()
            );

            formData.append(
                "email",
                isDemoAccount
                    ? user.email
                    : email.trim()
            );

            formData.append(
                "phone",
                phone.trim()
            );

            if (
                !isDemoAccount &&
                password
            ) {
                formData.append(
                    "password",
                    password
                );

                formData.append(
                    "password_confirmation",
                    confirmPassword
                );
            }

            if (selectedPhoto) {
                formData.append(
                    "profile_photo",
                    selectedPhoto
                );
            }

            const response =
                await updateProfile(
                    token,
                    formData
                );

            updateUser(
                response.user
            );

            setPassword("");
            setConfirmPassword("");
            setSelectedPhoto(null);

            if (previewUrl) {
                URL.revokeObjectURL(
                    previewUrl
                );
            }

            setPreviewUrl(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setEditing(false);

            setMessage(
                response.message ||
                    "Profile updated successfully."
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to update your profile."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center gap-2 text-sm">
                    <Link
                        href="/manager/dashboard"
                        className="font-medium text-slate-500 transition hover:text-slate-900"
                    >
                        Workspace
                    </Link>

                    <span className="text-slate-300">
                        /
                    </span>

                    <span className="font-medium text-slate-900">
                        Profile
                    </span>
                </div>

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                            Profile
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage your personal account information and
                            profile image.
                        </p>
                    </div>

                    {!editing && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditing(true);
                                setMessage("");
                                setError("");
                            }}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            <EditIcon />
                            Edit profile
                        </button>
                    )}
                </div>

                {message && (
                    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSave}>
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-4">
                                    <div className="relative shrink-0">
                                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-xl font-semibold text-slate-700 ring-1 ring-slate-200">
                                            {displayedPhoto ? (
                                                <img
                                                    src={displayedPhoto}
                                                    alt={`${user.name} profile`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                getInitials(
                                                    user.name
                                                )
                                            )}
                                        </div>

                                        {editing && (
                                            <button
                                                type="button"
                                                onClick={
                                                    openPhotoPicker
                                                }
                                                title="Change profile photo"
                                                aria-label="Change profile photo"
                                                className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-950 text-white shadow-lg transition hover:bg-slate-800"
                                            >
                                                <EditIcon />
                                            </button>
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="truncate text-lg font-semibold text-slate-950">
                                            {user.name}
                                        </h2>

                                        <p className="mt-0.5 text-sm text-slate-500">
                                            {formatRole(
                                                user.role
                                            )}
                                        </p>

                                        <span className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                            {formatStatus(
                                                user.status
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {editing && (
                                    <div className="flex flex-col items-start gap-2 sm:items-end">
                                        <button
                                            type="button"
                                            onClick={
                                                openPhotoPicker
                                            }
                                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                        >
                                            <EditIcon />
                                            Change profile photo
                                        </button>

                                        <p className="text-xs text-slate-400">
                                            JPG, PNG or WebP · Max 5 MB
                                        </p>

                                        {selectedPhoto && (
                                            <p className="max-w-[260px] truncate text-xs font-medium text-slate-600">
                                                Selected:{" "}
                                                {
                                                    selectedPhoto.name
                                                }
                                            </p>
                                        )}

                                        <input
                                            ref={
                                                fileInputRef
                                            }
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={
                                                handlePhotoChange
                                            }
                                            className="hidden"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-6 px-5 py-6 sm:px-6 lg:grid-cols-[1.35fr_1fr]">
                            <div>
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                        <ProfileIcon />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-950">
                                            Personal information
                                        </h3>

                                        <p className="text-xs text-slate-500">
                                            Your account and contact details.
                                        </p>
                                    </div>
                                </div>

                                {isDemoAccount &&
                                    editing && (
                                        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                                            <LockIcon />

                                            <div>
                                                <p className="text-xs font-semibold text-amber-900">
                                                    Demo account
                                                </p>

                                                <p className="mt-0.5 text-xs leading-5 text-amber-800">
                                                    Email and password changes
                                                    are disabled for this demo
                                                    account.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="mb-1.5 block text-xs font-semibold text-slate-600"
                                        >
                                            Full name
                                        </label>

                                        {editing ? (
                                            <input
                                                id="name"
                                                type="text"
                                                value={name}
                                                onChange={(
                                                    event
                                                ) =>
                                                    setName(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                            />
                                        ) : (
                                            <div className="flex h-10 items-center rounded-xl bg-slate-50 px-3 text-sm font-medium text-slate-900">
                                                {user.name}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600"
                                        >
                                            Email

                                            {isDemoAccount &&
                                                editing && (
                                                    <span className="text-slate-400">
                                                        <LockIcon />
                                                    </span>
                                                )}
                                        </label>

                                        {editing ? (
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                disabled={
                                                    isDemoAccount
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setEmail(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className={`h-10 w-full rounded-xl border px-3 text-sm outline-none transition ${
                                                    isDemoAccount
                                                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                                                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                                }`}
                                            />
                                        ) : (
                                            <div className="flex h-10 items-center gap-2 rounded-xl bg-slate-50 px-3 text-sm font-medium text-slate-900">
                                                <MailIcon />

                                                <span className="truncate">
                                                    {user.email}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="phone"
                                            className="mb-1.5 block text-xs font-semibold text-slate-600"
                                        >
                                            Phone
                                        </label>

                                        {editing ? (
                                            <input
                                                id="phone"
                                                type="text"
                                                value={phone}
                                                onChange={(
                                                    event
                                                ) =>
                                                    setPhone(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="Enter phone number"
                                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                            />
                                        ) : (
                                            <div className="flex h-10 items-center gap-2 rounded-xl bg-slate-50 px-3 text-sm font-medium text-slate-900">
                                                <PhoneIcon />

                                                <span>
                                                    {user.phone ||
                                                        "Not provided"}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {editing && (
                                        <>
                                            <div>
                                                <label
                                                    htmlFor="password"
                                                    className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600"
                                                >
                                                    New password

                                                    {isDemoAccount && (
                                                        <span className="text-slate-400">
                                                            <LockIcon />
                                                        </span>
                                                    )}
                                                </label>

                                                <input
                                                    id="password"
                                                    type="password"
                                                    value={
                                                        password
                                                    }
                                                    disabled={
                                                        isDemoAccount
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setPassword(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder={
                                                        isDemoAccount
                                                            ? "Unavailable for demo"
                                                            : "Leave blank to keep current"
                                                    }
                                                    className={`h-10 w-full rounded-xl border px-3 text-sm outline-none transition ${
                                                        isDemoAccount
                                                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500 placeholder:text-slate-400"
                                                            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                                    }`}
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="confirmPassword"
                                                    className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600"
                                                >
                                                    Confirm new password

                                                    {isDemoAccount && (
                                                        <span className="text-slate-400">
                                                            <LockIcon />
                                                        </span>
                                                    )}
                                                </label>

                                                <input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={
                                                        confirmPassword
                                                    }
                                                    disabled={
                                                        isDemoAccount
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setConfirmPassword(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder={
                                                        isDemoAccount
                                                            ? "Unavailable for demo"
                                                            : "Confirm new password"
                                                    }
                                                    className={`h-10 w-full rounded-xl border px-3 text-sm outline-none transition ${
                                                        isDemoAccount
                                                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500 placeholder:text-slate-400"
                                                            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                                    }`}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                        <BriefcaseIcon />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-950">
                                            Work information
                                        </h3>

                                        <p className="text-xs text-slate-500">
                                            Your WorkSphere role and account
                                            status.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                                        <p className="text-xs font-semibold text-slate-500">
                                            Designation
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {user.designation ||
                                                "Not assigned"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                                        <p className="text-xs font-semibold text-slate-500">
                                            Role
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {formatRole(
                                                user.role
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                                        <p className="text-xs font-semibold text-slate-500">
                                            Account status
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-emerald-700">
                                            {formatStatus(
                                                user.status
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {editing && (
                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                                <button
                                    type="button"
                                    onClick={
                                        cancelEditing
                                    }
                                    disabled={saving}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <CloseIcon />
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <CheckIcon />

                                    {saving
                                        ? "Saving..."
                                        : "Save changes"}
                                </button>
                            </div>
                        )}
                    </section>
                </form>
            </main>
        </div>
    );
}