"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type User = {
    id: number;
    name?: string;
    email?: string;
    designation?: string;
};

type Project = {
    id: number;
    title?: string;
    name?: string;
};

type Task = {
    id: number;
    title?: string;
};

type DailyUpdate = {
    id: number;
    update_date?: string | null;
    work_description?: string | null;
    description?: string | null;
    hours_spent?: number | string | null;
    status?: string | null;
    blocker_details?: string | null;
    has_blocker?: boolean | number | null;
    plans_for_tomorrow?: string | null;
    manager_comment?: string | null;
    reviewed_at?: string | null;
    reviewed_by?: number | null;
    blocker_acknowledged_at?: string | null;
    blocker_acknowledged_by?: number | null;
    attached_file?: string | null;
    employee?: User | null;
    project?: Project | null;
    task?: Task | null;
};

type ApiResponse = {
    message?: string;
    daily_update?: DailyUpdate;
    update?: DailyUpdate;
    data?: DailyUpdate | { data?: DailyUpdate };
};

function getToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem("nexra_token");
}

function extractUpdate(response: ApiResponse): DailyUpdate | null {
    if (response.daily_update) {
        return response.daily_update;
    }

    if (response.update) {
        return response.update;
    }

    if (!response.data) {
        return null;
    }

    if (
        typeof response.data === "object" &&
        "data" in response.data &&
        response.data.data
    ) {
        return response.data.data;
    }

    return response.data as DailyUpdate;
}

function formatDate(value?: string | null): string {
    if (!value) {
        return "Not specified";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(value?: string | null): string {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getProjectName(project?: Project | null): string {
    return project?.title || project?.name || "General Project";
}

function getStatusLabel(status?: string | null): string {
    if (!status) {
        return "Pending";
    }

    return status
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isReviewed(update: DailyUpdate): boolean {
    return (
        Boolean(update.reviewed_at) ||
        String(update.status || "").toLowerCase() === "reviewed"
    );
}

function hasBlocker(update: DailyUpdate): boolean {
    if (update.has_blocker === true || update.has_blocker === 1) {
        return true;
    }

    return Boolean(update.blocker_details?.trim());
}

export default function ManagerDailyUpdateDetailsPage() {
    const params = useParams();

    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const [update, setUpdate] = useState<DailyUpdate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [reviewing, setReviewing] = useState(false);
    const [acknowledging, setAcknowledging] = useState(false);
    const [commenting, setCommenting] = useState(false);

    const [comment, setComment] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const [actionError, setActionError] = useState("");

    const loadUpdate = useCallback(async () => {
        if (!id) {
            setError("Daily update ID was not provided.");
            setLoading(false);
            return;
        }

        const token = getToken();

        if (!token) {
            setError(
                "Authentication session not found. Please log in again."
            );
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await apiFetch<ApiResponse>(
                `/manager/daily-updates/${id}`,
                {
                    token,
                }
            );

            const extractedUpdate = extractUpdate(response);

            if (!extractedUpdate) {
                throw new Error(
                    "Daily update data was not found in the API response."
                );
            }

            setUpdate(extractedUpdate);
            setComment(extractedUpdate.manager_comment || "");
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to load the daily update."
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadUpdate();
    }, [loadUpdate]);

    const handleReview = async () => {
        const token = getToken();

        if (!token || !id || !update) {
            return;
        }

        try {
            setReviewing(true);
            setActionMessage("");
            setActionError("");

            await apiFetch(`/manager/daily-updates/${id}/review`, {
                method: "PATCH",
                token,
                body: JSON.stringify({}),
            });

            setActionMessage("Daily update marked as reviewed.");
            await loadUpdate();
        } catch (requestError) {
            setActionError(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to review this update."
            );
        } finally {
            setReviewing(false);
        }
    };

    const handleAcknowledgeBlocker = async () => {
        const token = getToken();

        if (!token || !id || !update) {
            return;
        }

        try {
            setAcknowledging(true);
            setActionMessage("");
            setActionError("");

            await apiFetch(
                `/manager/daily-updates/${id}/acknowledge-blocker`,
                {
                    method: "PATCH",
                    token,
                    body: JSON.stringify({}),
                }
            );

            setActionMessage("Blocker acknowledged successfully.");
            await loadUpdate();
        } catch (requestError) {
            setActionError(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to acknowledge the blocker."
            );
        } finally {
            setAcknowledging(false);
        }
    };

    const handleComment = async () => {
        const token = getToken();

        if (!token || !id || !update) {
            return;
        }

        if (!comment.trim()) {
            setActionError("Please enter a manager comment.");
            return;
        }

        try {
            setCommenting(true);
            setActionMessage("");
            setActionError("");

            await apiFetch(`/manager/daily-updates/${id}/comment`, {
                method: "POST",
                token,
                body: JSON.stringify({
                    manager_comment: comment.trim(),
                }),
            });

            setActionMessage("Manager comment added successfully.");
            await loadUpdate();
        } catch (requestError) {
            setActionError(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to add the manager comment."
            );
        } finally {
            setCommenting(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl animate-pulse space-y-6">
                    <div className="h-5 w-44 rounded bg-slate-200" />

                    <div className="h-64 rounded-3xl bg-slate-200" />

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="h-72 rounded-3xl bg-white" />
                        <div className="h-72 rounded-3xl bg-white lg:col-span-2" />
                    </div>
                </div>
            </main>
        );
    }

    if (error || !update) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl">
                    <Link
                        href="/manager/daily-updates"
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950"
                    >
                        ← Back to Daily Updates
                    </Link>

                    <div className="mt-6 rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                            !
                        </div>

                        <h1 className="mt-5 text-xl font-black text-slate-950">
                            Unable to load daily update
                        </h1>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            {error ||
                                "The requested daily update could not be found."}
                        </p>

                        <button
                            type="button"
                            onClick={loadUpdate}
                            className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const reviewed = isReviewed(update);
    const blocker = hasBlocker(update);
    const projectName = getProjectName(update.project);
    const employeeName = update.employee?.name || "Unknown Employee";
    const workDescription =
        update.work_description || update.description || "";

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href="/manager/daily-updates"
                        className="inline-flex w-fit items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
                    >
                        ← Back to Daily Updates
                    </Link>

                    <div className="flex flex-wrap gap-2">
                        {!reviewed && (
                            <button
                                type="button"
                                onClick={handleReview}
                                disabled={reviewing}
                                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                            >
                                {reviewing ? "Reviewing..." : "Mark Reviewed"}
                            </button>
                        )}

                        {blocker && !update.blocker_acknowledged_at && (
                            <button
                                type="button"
                                onClick={handleAcknowledgeBlocker}
                                disabled={acknowledging}
                                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
                            >
                                {acknowledging
                                    ? "Acknowledging..."
                                    : "Acknowledge Blocker"}
                            </button>
                        )}
                    </div>
                </div>

                {actionMessage && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                        {actionMessage}
                    </div>
                )}

                {actionError && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
                        {actionError}
                    </div>
                )}

                <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
                    <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />
                    <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
                                        Team Daily Update
                                    </span>

                                    {reviewed ? (
                                        <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-bold text-emerald-300">
                                            ✓ Reviewed
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-amber-400/15 px-3 py-1.5 text-xs font-bold text-amber-300">
                                            Pending Review
                                        </span>
                                    )}

                                    {blocker && (
                                        <span className="rounded-full bg-rose-400/15 px-3 py-1.5 text-xs font-bold text-rose-300">
                                            Has Blocker
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                                    {employeeName}&apos;s Daily Update
                                </h1>

                                <p className="mt-3 text-sm text-slate-300">
                                    {formatDate(update.update_date)} ·{" "}
                                    {projectName}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                                <p className="text-xs font-semibold text-slate-400">
                                    Status
                                </p>
                                <p className="mt-1 text-lg font-black">
                                    {getStatusLabel(update.status)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs text-slate-400">
                                    Employee
                                </p>
                                <p className="mt-1 truncate text-sm font-bold">
                                    {employeeName}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs text-slate-400">
                                    Project
                                </p>
                                <p className="mt-1 truncate text-sm font-bold">
                                    {projectName}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs text-slate-400">
                                    Hours Logged
                                </p>
                                <p className="mt-1 text-sm font-bold">
                                    {update.hours_spent ?? 0} hours
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-3">
                    <section className="space-y-6 lg:col-span-2">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                            <h2 className="text-lg font-black text-slate-950">
                                Work Accomplished
                            </h2>

                            <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                                {workDescription ? (
                                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                        {workDescription}
                                    </p>
                                ) : (
                                    <p className="text-sm italic text-slate-400">
                                        No work description was provided.
                                    </p>
                                )}
                            </div>
                        </div>

                        {blocker && (
                            <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm sm:p-7">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-black text-slate-950">
                                            Blocker
                                        </h2>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Issue reported by the employee.
                                        </p>
                                    </div>

                                    {update.blocker_acknowledged_at ? (
                                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                                            Acknowledged
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
                                            Needs Attention
                                        </span>
                                    )}
                                </div>

                                <div className="mt-5 rounded-2xl bg-rose-50 p-5">
                                    <p className="whitespace-pre-wrap text-sm leading-7 text-rose-900">
                                        {update.blocker_details ||
                                            "Blocker reported without additional details."}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                            <h2 className="text-lg font-black text-slate-950">
                                Tomorrow&apos;s Plan
                            </h2>

                            <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                                {update.plans_for_tomorrow ? (
                                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                        {update.plans_for_tomorrow}
                                    </p>
                                ) : (
                                    <p className="text-sm italic text-slate-400">
                                        No plan was provided.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-indigo-200 bg-indigo-50/50 p-6 shadow-sm sm:p-7">
                            <h2 className="text-lg font-black text-slate-950">
                                Manager Feedback
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Add feedback or guidance for the employee.
                            </p>

                            <textarea
                                value={comment}
                                onChange={(event) =>
                                    setComment(event.target.value)
                                }
                                rows={5}
                                placeholder="Write a manager comment..."
                                className="mt-5 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                            />

                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleComment}
                                    disabled={commenting}
                                    className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    {commenting
                                        ? "Saving..."
                                        : "Save Manager Comment"}
                                </button>
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-black text-slate-950">
                                Update Information
                            </h2>

                            <div className="mt-5 space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400">
                                        Employee
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        {employeeName}
                                    </p>

                                    {update.employee?.email && (
                                        <p className="mt-1 text-xs text-slate-500">
                                            {update.employee.email}
                                        </p>
                                    )}
                                </div>

                                <div className="h-px bg-slate-100" />

                                <div>
                                    <p className="text-xs font-semibold text-slate-400">
                                        Project
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        {projectName}
                                    </p>
                                </div>

                                <div className="h-px bg-slate-100" />

                                <div>
                                    <p className="text-xs font-semibold text-slate-400">
                                        Task
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        {update.task?.title ||
                                            "No specific task"}
                                    </p>
                                </div>

                                <div className="h-px bg-slate-100" />

                                <div>
                                    <p className="text-xs font-semibold text-slate-400">
                                        Update Date
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        {formatDate(update.update_date)}
                                    </p>
                                </div>

                                <div className="h-px bg-slate-100" />

                                <div>
                                    <p className="text-xs font-semibold text-slate-400">
                                        Hours Spent
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        {update.hours_spent ?? 0} hours
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-black text-slate-950">
                                Review Timeline
                            </h2>

                            <div className="mt-5 space-y-5">
                                <div>
                                    <p className="text-sm font-bold text-slate-800">
                                        Update Submitted
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {formatDateTime(update.update_date)}
                                    </p>
                                </div>

                                <div className="border-l border-dashed border-slate-200 pl-4">
                                    <p className="text-sm font-bold text-slate-800">
                                        {reviewed
                                            ? "Reviewed"
                                            : "Pending Review"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {reviewed
                                            ? formatDateTime(
                                                  update.reviewed_at
                                              )
                                            : "Manager review is pending."}
                                    </p>
                                </div>

                                {blocker && (
                                    <div className="border-l border-dashed border-slate-200 pl-4">
                                        <p className="text-sm font-bold text-slate-800">
                                            {update.blocker_acknowledged_at
                                                ? "Blocker Acknowledged"
                                                : "Blocker Pending"}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {update.blocker_acknowledged_at
                                                ? formatDateTime(
                                                      update.blocker_acknowledged_at
                                                  )
                                                : "Awaiting manager acknowledgement."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {update.manager_comment && (
                            <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm">
                                <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                                    Current Manager Comment
                                </p>

                                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-indigo-950">
                                    {update.manager_comment}
                                </p>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </main>
    );
}