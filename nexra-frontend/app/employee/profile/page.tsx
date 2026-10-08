"use client";

import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";

import Link from "next/link";

import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../lib/api";

function getInitials(name?: string) {
    if (!name) {
        return "U";
    }

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

function formatRole(role?: string) {
    if (!role) {
        return "Employee";
    }

    return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatStatus(status?: string) {
    if (!status) {
        return "Active";
    }

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
        "http://127.0.0.1:8000/api";

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
    const { user, loading, updateUser } = useAuth();

    const fileInputRef =
        useRef<HTMLInputElement | null>(null);

    const [editing, setEditing] =
        useState(false);

    const [name, setName] =
        useState("");

    const [phone, setPhone] =
        useState("");

    const [selectedImage, setSelectedImage] =
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

    const currentUser = user;

    const currentProfileImage =
        getProfileImageUrl(
            currentUser.profile_photo
        );

    const displayedImage =
        previewUrl || currentProfileImage;

    const initials = getInitials(
        editing
            ? name
            : currentUser.name
    );

    function handleEdit() {
        setName(currentUser.name || "");
        setPhone(currentUser.phone || "");
        setSelectedImage(null);
        setPreviewUrl(null);
        setMessage("");
        setError("");
        setEditing(true);
    }

    function handleCancel() {
        setName(currentUser.name || "");
        setPhone(currentUser.phone || "");
        setSelectedImage(null);

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(null);
        setMessage("");
        setError("");
        setEditing(false);
    }

    function handleImageChange(
        event: ChangeEvent<HTMLInputElement>
    ) {
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

        if (file.size > 2 * 1024 * 1024) {
            setError(
                "Profile image must be 2 MB or smaller."
            );

            event.target.value = "";
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        const nextPreviewUrl =
            URL.createObjectURL(file);

        setSelectedImage(file);
        setPreviewUrl(nextPreviewUrl);
    }

    function openImagePicker() {
        fileInputRef.current?.click();
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

        const currentEmail =
            currentUser.email?.trim();

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

        if (!currentEmail) {
            setError(
                "Your account email is unavailable. Please log in again."
            );

            return;
        }

        const token =
            typeof window !== "undefined"
                ? localStorage.getItem(
                      "nexra_token"
                  )
                : null;

        if (!token) {
            setError(
                "Your session has expired. Please log in again."
            );

            return;
        }

        setSaving(true);

        try {
            const formData =
                new FormData();

            formData.append(
                "name",
                trimmedName
            );

            formData.append(
                "email",
                currentEmail
            );

            formData.append(
                "phone",
                trimmedPhone
            );

            if (selectedImage) {
                formData.append(
                    "profile_photo",
                    selectedImage
                );
            }

            const response =
                (await apiFetch(
                    "/profile",
                    {
                        method: "POST",
                        token,
                        body: formData,
                    }
                )) as {
                    message?: string;
                    user?: typeof currentUser;
                };

            if (!response.user) {
                throw new Error(
                    response.message ||
                        "Profile update failed."
                );
            }

            updateUser(response.user);

            setSelectedImage(null);

            if (previewUrl) {
                URL.revokeObjectURL(
                    previewUrl
                );
            }

            setPreviewUrl(null);

            setMessage(
                response.message ||
                    "Profile updated successfully."
            );

            setEditing(false);
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to update your profile."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-5">
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

                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#166534] shadow-lg shadow-black/20">
                            {displayedImage ? (
                                <img
                                    src={displayedImage}
                                    alt={`${currentUser.name || "Employee"} profile`}
                                    className="h-full w-full object-cover"
                                    onError={(event) => {
                                        event.currentTarget.style.display =
                                            "none";
                                    }}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-base font-bold text-white">
                                    {initials}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

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
                        <div className="relative h-20 w-20 shrink-0">
                            <div className="h-20 w-20 overflow-hidden rounded-2xl bg-[#ECFDF3] text-2xl font-bold text-[#166534] ring-1 ring-[#BBF7D0]">
                                {displayedImage ? (
                                    <img
                                        src={displayedImage}
                                        alt={`${currentUser.name || "Employee"} profile`}
                                        className="h-full w-full object-cover"
                                        onError={(event) => {
                                            event.currentTarget.style.display =
                                                "none";
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        {initials}
                                    </div>
                                )}
                            </div>

                            {editing && (
                                <>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        onChange={
                                            handleImageChange
                                        }
                                        className="hidden"
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            openImagePicker
                                        }
                                        className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#166534] text-white shadow-md transition hover:bg-[#14532D]"
                                        aria-label="Change profile picture"
                                        title="Change profile picture"
                                    >
                                        <EditIcon />
                                    </button>
                                </>
                            )}
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

                            {editing && (
                                <p className="mt-3 text-xs text-[#8A958F]">
                                    Click the pencil icon
                                    to choose a new
                                    profile picture.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

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
                        {!error && <CheckIcon />}

                        <span>
                            {error || message}
                        </span>
                    </div>
                </div>
            )}

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
                                            event.target
                                                .value
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
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="Enter your phone number"
                                    className="w-full rounded-xl border border-[#D8E0DB] bg-white px-3.5 py-2.5 text-sm text-[#18201C] outline-none transition placeholder:text-[#9AA59F] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/10"
                                />
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-[#8A958F]">
                            Profile pictures must be PNG,
                            JPG, JPEG, or WEBP and no larger
                            than 2 MB.
                        </p>

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