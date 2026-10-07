"use client";

import {
    FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Employee = {
    id: number;
    name?: string;
    email?: string;
    designation?: string | null;
};

type Project = {
    id: number;
    title?: string;
    name?: string;
    status?: string;
};

type Task = {
    id: number;
    title?: string;
    status?: string;
};

type DailyUpdate = {
    id: number;
    employee_id?: number;
    project_id?: number;
    task_id?: number | null;

    update_date?: string | null;
    work_description?: string | null;
    hours_spent?: number | string | null;
    status?: string | null;

    blocker_details?: string | null;
    plans_for_tomorrow?: string | null;
    attached_file?: string | null;

    reviewed_by?: number | null;
    reviewed_at?: string | null;

    blocker_acknowledged_by?: number | null;
    blocker_acknowledged_at?: string | null;

    manager_comment?: string | null;

    employee?: Employee | null;
    user?: Employee | null;
    project?: Project | null;
    task?: Task | null;
};

type ApiResponse = {
    message?: string;
    daily_update?: DailyUpdate;
    update?: DailyUpdate;
    data?: DailyUpdate | { data?: DailyUpdate };
};

const getToken = () => {
    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem("nexra_token");
};

const getUpdateFromResponse = (
    response: ApiResponse
): DailyUpdate | null => {
    if (response.daily_update) {
        return response.daily_update;
    }

    if (response.update) {
        return response.update;
    }

    if (response.data && "id" in response.data) {
        return response.data as DailyUpdate;
    }

    if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data &&
        response.data.data
    ) {
        return response.data.data;
    }

    return null;
};

const formatDate = (value?: string | null) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (value?: string | null) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getProjectName = (project?: Project | null) => {
    return project?.title || project?.name || "No project";
};

const getEmployeeName = (update: DailyUpdate) => {
    return (
        update.employee?.name ||
        update.user?.name ||
        "Unknown employee"
    );
};

const getEmployeeEmail = (update: DailyUpdate) => {
    return (
        update.employee?.email ||
        update.user?.email ||
        "No email available"
    );
};

const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return (
        `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`
    ).toUpperCase();
};

const normalizeStatus = (status?: string | null) => {
    if (!status) {
        return "Pending";
    }

    const normalized = status.toLowerCase().replace(/[_-]/g, " ");

    if (
        normalized === "reviewed" ||
        normalized === "approved" ||
        normalized === "complete" ||
        normalized === "completed"
    ) {
        return "Reviewed";
    }

    return status
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const hasBlocker = (update: DailyUpdate) => {
    return Boolean(update.blocker_details?.trim());
};

export default function ManagerDailyUpdateDetailPage() {
    const params = useParams();
    const router = useRouter();

    const updateId = Array.isArray(params.id)
        ? params.id[0]
        : params.id;

    const [update, setUpdate] = useState<DailyUpdate | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<
        "review" | "blocker" | "comment" | null
    >(null);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [comment, setComment] = useState("");

    const loadUpdate = useCallback(async () => {
        if (!updateId) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = getToken();

            if (!token) {
                throw new Error(
                    "Authentication session not found. Please log in again."
                );
            }

            const response = await apiFetch<ApiResponse>(
                `/manager/daily-updates/${updateId}`,
                {
                    token,
                }
            );

            const dailyUpdate = getUpdateFromResponse(response);

            if (!dailyUpdate) {
                throw new Error(
                    "Daily update data was not found in the API response."
                );
            }

            setUpdate(dailyUpdate);

            if (dailyUpdate.manager_comment) {
                setComment(dailyUpdate.manager_comment);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load the daily update."
            );
        } finally {
            setLoading(false);
        }
    }, [updateId]);

    useEffect(() => {
        loadUpdate();
    }, [loadUpdate]);

    const employeeName = useMemo(() => {
        if (!update) {
            return "Employee";
        }

        return getEmployeeName(update);
    }, [update]);

    const reviewed = Boolean(
        update?.reviewed_at || update?.reviewed_by
    );

    const blocker = Boolean(update && hasBlocker(update));

    const blockerAcknowledged = Boolean(
        update?.blocker_acknowledged_at ||
        update?.blocker_acknowledged_by
    );

    const handleReview = async () => {
        if (!updateId || reviewed) {
            return;
        }

        setActionLoading("review");
        setActionError("");
        setSuccessMessage("");

        try {
            const token = getToken();

            if (!token) {
                throw new Error(
                    "Authentication session not found. Please log in again."
                );
            }

            const response = await apiFetch<ApiResponse>(
                `/manager/daily-updates/${updateId}/review`,
                {
                    method: "PATCH",
                    token,
                    body: JSON.stringify({}),
                }
            );

            const updated = getUpdateFromResponse(response);

            if (updated) {
                setUpdate(updated);
            } else {
                await loadUpdate();
            }

            setSuccessMessage(
                response.message ||
                    "Daily update marked as reviewed successfully."
            );
        } catch (err) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "Unable to review this daily update."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleAcknowledgeBlocker = async () => {
        if (!updateId || !blocker || blockerAcknowledged) {
            return;
        }

        setActionLoading("blocker");
        setActionError("");
        setSuccessMessage("");

        try {
            const token = getToken();

            if (!token) {
                throw new Error(
                    "Authentication session not found. Please log in again."
                );
            }

            const response = await apiFetch<ApiResponse>(
                `/manager/daily-updates/${updateId}/acknowledge-blocker`,
                {
                    method: "PATCH",
                    token,
                    body: JSON.stringify({}),
                }
            );

            const updated = getUpdateFromResponse(response);

            if (updated) {
                setUpdate(updated);
            } else {
                await loadUpdate();
            }

            setSuccessMessage(
                response.message ||
                    "Blocker acknowledged successfully."
            );
        } catch (err) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "Unable to acknowledge the blocker."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleCommentSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!updateId) {
            return;
        }

        const trimmedComment = comment.trim();

        if (!trimmedComment) {
            setActionError("Please enter a manager comment.");
            return;
        }

        setActionLoading("comment");
        setActionError("");
        setSuccessMessage("");

        try {
            const token = getToken();

            if (!token) {
                throw new Error(
                    "Authentication session not found. Please log in again."
                );
            }

            const response = await apiFetch<ApiResponse>(
                `/manager/daily-updates/${updateId}/comment`,
                {
                    method: "POST",
                    token,
                    body: JSON.stringify({
                        manager_comment: trimmedComment,
                    }),
                }
            );

            const updated = getUpdateFromResponse(response);

            if (updated) {
                setUpdate(updated);
                setComment(updated.manager_comment || trimmedComment);
            } else {
                setUpdate((current) =>
                    current
                        ? {
                              ...current,
                              manager_comment: trimmedComment,
                          }
                        : current
                );
            }

            setSuccessMessage(
                response.message ||
                    "Manager comment saved successfully."
            );
        } catch (err) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "Unable to save the manager comment."
            );
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl animate-pulse space-y-6">
                    <div className="h-10 w-64 rounded-lg bg-slate-200" />
                    <div className="h-40 rounded-3xl bg-slate-200" />

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="h-96 rounded-2xl bg-white" />
                        <div className="h-96 rounded-2xl bg-white lg:col-span-2" />
                    </div>
                </div>
            </main>
        );
    }

    if (error || !update) {
        return (
            <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/manager/daily-updates"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                    >
                        <span aria-hidden="true">←</span>
                        Back to Daily Updates
                    </Link>

                    <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                            !
                        </div>

                        <h1 className="text-xl font-bold text-slate-950">
                            Unable to load daily update
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {error ||
                                "The requested daily update could not be found."}
                        </p>

                        <button
                            type="button"
                            onClick={loadUpdate}
                            className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <Link
                            href="/manager/daily-updates"
                            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
                        >
                            <span aria-hidden="true">←</span>
                            Daily Updates
                        </Link>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                            Daily Update Details
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Review work progress, blockers and manager feedback.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/manager/daily-updates"
                                )
                            }
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            Back
                        </button>

                        <span
                            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold ${
                                reviewed
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                            }`}
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    reviewed
                                        ? "bg-emerald-500"
                                        : "bg-amber-500"
                                }`}
                            />
                            {reviewed ? "Reviewed" : "Pending Review"}
                        </span>
                    </div>
                </div>

                {/* Success / Error */}
                {successMessage && (
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        <span className="mt-0.5 font-bold">✓</span>
                        <span>{successMessage}</span>
                    </div>
                )}

                {actionError && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <span className="mt-0.5 font-bold">!</span>
                        <span>{actionError}</span>
                    </div>
                )}

                {/* Employee Hero */}
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="bg-slate-950 px-5 py-6 sm:px-7">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold text-white ring-1 ring-white/10">
                                    {getInitials(employeeName)}
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Submitted by
                                    </p>

                                    <h2 className="mt-1 truncate text-xl font-bold text-white">
                                        {employeeName}
                                    </h2>

                                    <p className="mt-1 truncate text-sm text-slate-400">
                                        {getEmployeeEmail(update)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:flex">
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Update Date
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-white">
                                        {formatDate(update.update_date)}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Hours
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-white">
                                        {update.hours_spent ?? "0"} hrs
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 border-t border-slate-100 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Project
                            </p>
                            <p className="mt-1.5 text-sm font-bold text-slate-900">
                                {getProjectName(update.project)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Task
                            </p>
                            <p className="mt-1.5 text-sm font-bold text-slate-900">
                                {update.task?.title || "No specific task"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Update Status
                            </p>
                            <p className="mt-1.5 text-sm font-bold text-slate-900">
                                {normalizeStatus(update.status)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Submitted
                            </p>
                            <p className="mt-1.5 text-sm font-bold text-slate-900">
                                {formatDateTime(update.update_date)}
                            </p>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Work accomplished */}
                        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-950">
                                            Work Accomplished
                                        </h2>
                                        <p className="mt-1 text-xs text-slate-500">
                                            What the employee worked on today.
                                        </p>
                                    </div>

                                    <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
                                        {update.hours_spent ?? 0} hrs
                                    </span>
                                </div>
                            </div>

                            <div className="px-5 py-5 sm:px-6">
                                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                    {update.work_description?.trim() ||
                                        "No work description was provided."}
                                </p>
                            </div>
                        </section>

                        {/* Blocker */}
                        <section
                            className={`rounded-2xl border bg-white shadow-sm ${
                                blocker
                                    ? "border-red-200"
                                    : "border-slate-200"
                            }`}
                        >
                            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-950">
                                            Blockers
                                        </h2>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Issues that may be affecting progress.
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                                            blocker
                                                ? blockerAcknowledged
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "bg-red-50 text-red-700"
                                                : "bg-emerald-50 text-emerald-700"
                                        }`}
                                    >
                                        {blocker
                                            ? blockerAcknowledged
                                                ? "Acknowledged"
                                                : "Has Blocker"
                                            : "No Blocker"}
                                    </span>
                                </div>
                            </div>

                            <div className="px-5 py-5 sm:px-6">
                                {blocker ? (
                                    <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
                                        <p className="whitespace-pre-wrap text-sm leading-7 text-red-800">
                                            {update.blocker_details}
                                        </p>

                                        {blockerAcknowledged &&
                                            update.blocker_acknowledged_at && (
                                                <p className="mt-4 border-t border-red-100 pt-3 text-xs font-medium text-red-600">
                                                    Acknowledged on{" "}
                                                    {formatDateTime(
                                                        update.blocker_acknowledged_at
                                                    )}
                                                </p>
                                            )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 font-bold text-emerald-700">
                                            ✓
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-emerald-800">
                                                No blocker reported
                                            </p>
                                            <p className="mt-0.5 text-xs text-emerald-600">
                                                The employee did not report any
                                                blockers for this update.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Tomorrow plan */}
                        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                                <h2 className="text-base font-bold text-slate-950">
                                    Plan for Tomorrow
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Planned work for the next working day.
                                </p>
                            </div>

                            <div className="px-5 py-5 sm:px-6">
                                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                    {update.plans_for_tomorrow?.trim() ||
                                        "No plan for tomorrow was provided."}
                                </p>
                            </div>
                        </section>

                        {/* Manager comment */}
                        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                                <h2 className="text-base font-bold text-slate-950">
                                    Manager Comment
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Add feedback or instructions for the employee.
                                </p>
                            </div>

                            <form
                                onSubmit={handleCommentSubmit}
                                className="p-5 sm:p-6"
                            >
                                <textarea
                                    value={comment}
                                    onChange={(event) =>
                                        setComment(event.target.value)
                                    }
                                    rows={5}
                                    placeholder="Write your feedback or follow-up instructions..."
                                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                                />

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    {update.manager_comment &&
                                        update.reviewed_at && (
                                            <p className="text-xs text-slate-400">
                                                Last reviewed{" "}
                                                {formatDateTime(
                                                    update.reviewed_at
                                                )}
                                            </p>
                                        )}

                                    <button
                                        type="submit"
                                        disabled={
                                            actionLoading === "comment"
                                        }
                                        className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto"
                                    >
                                        {actionLoading === "comment"
                                            ? "Saving..."
                                            : update.manager_comment
                                              ? "Update Comment"
                                              : "Add Comment"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        {/* Review actions */}
                        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-5 py-4">
                                <h2 className="text-base font-bold text-slate-950">
                                    Review Actions
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Manage the status of this daily update.
                                </p>
                            </div>

                            <div className="space-y-3 p-5">
                                <button
                                    type="button"
                                    onClick={handleReview}
                                    disabled={
                                        reviewed ||
                                        actionLoading !== null
                                    }
                                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                                        reviewed
                                            ? "cursor-default bg-emerald-50 text-emerald-700"
                                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                                    } disabled:opacity-70`}
                                >
                                    <span>
                                        {reviewed ? "✓" : "✓"}
                                    </span>

                                    {actionLoading === "review"
                                        ? "Reviewing..."
                                        : reviewed
                                          ? "Update Reviewed"
                                          : "Mark as Reviewed"}
                                </button>

                                {blocker && (
                                    <button
                                        type="button"
                                        onClick={
                                            handleAcknowledgeBlocker
                                        }
                                        disabled={
                                            blockerAcknowledged ||
                                            actionLoading !== null
                                        }
                                        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                                            blockerAcknowledged
                                                ? "cursor-default bg-blue-50 text-blue-700"
                                                : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                        } disabled:opacity-70`}
                                    >
                                        <span>!</span>

                                        {actionLoading === "blocker"
                                            ? "Acknowledging..."
                                            : blockerAcknowledged
                                              ? "Blocker Acknowledged"
                                              : "Acknowledge Blocker"}
                                    </button>
                                )}
                            </div>
                        </section>

                        {/* Update summary */}
                        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-5 py-4">
                                <h2 className="text-base font-bold text-slate-950">
                                    Update Summary
                                </h2>
                            </div>

                            <div className="divide-y divide-slate-100">
                                <div className="flex items-center justify-between gap-4 px-5 py-4">
                                    <span className="text-sm text-slate-500">
                                        Update ID
                                    </span>
                                    <span className="text-sm font-bold text-slate-900">
                                        #{update.id}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4 px-5 py-4">
                                    <span className="text-sm text-slate-500">
                                        Date
                                    </span>
                                    <span className="text-right text-sm font-bold text-slate-900">
                                        {formatDate(update.update_date)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4 px-5 py-4">
                                    <span className="text-sm text-slate-500">
                                        Hours
                                    </span>
                                    <span className="text-sm font-bold text-slate-900">
                                        {update.hours_spent ?? 0} hrs
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4 px-5 py-4">
                                    <span className="text-sm text-slate-500">
                                        Review
                                    </span>
                                    <span
                                        className={`text-sm font-bold ${
                                            reviewed
                                                ? "text-emerald-600"
                                                : "text-amber-600"
                                        }`}
                                    >
                                        {reviewed
                                            ? "Reviewed"
                                            : "Pending"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4 px-5 py-4">
                                    <span className="text-sm text-slate-500">
                                        Blocker
                                    </span>
                                    <span
                                        className={`text-sm font-bold ${
                                            blocker
                                                ? "text-red-600"
                                                : "text-emerald-600"
                                        }`}
                                    >
                                        {blocker ? "Yes" : "None"}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Review information */}
                        {(reviewed || blockerAcknowledged) && (
                            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-5 py-4">
                                    <h2 className="text-base font-bold text-slate-950">
                                        Activity
                                    </h2>
                                </div>

                                <div className="space-y-4 p-5">
                                    {reviewed && (
                                        <div className="flex gap-3">
                                            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-600">
                                                ✓
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                    Update reviewed
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                                    {formatDateTime(
                                                        update.reviewed_at
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {blockerAcknowledged && (
                                        <div className="flex gap-3">
                                            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                                                !
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                    Blocker acknowledged
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                                    {formatDateTime(
                                                        update.blocker_acknowledged_at
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </aside>
                </div>
            </div>
        </main>
    );
}