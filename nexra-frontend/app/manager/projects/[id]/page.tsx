"use client";

import Link from "next/link";

import { useParams } from "next/navigation";

import {
    ChangeEvent,
    FormEvent,
    useCallback,
    useEffect,
    useState,
} from "react";

import { apiFetch, API_URL } from "@/lib/api";

type Employee = {
    id: number;
    name?: string;
    email?: string;
    designation?: string | null;
};

type ProjectFile = {
    id: number;
    file_name?: string;
    file_path?: string;
    file_type?: string | null;
    uploaded_at?: string | null;
    created_at?: string | null;
    uploaded_by?: Employee | null;
};

type Task = {
    id: number;
    title?: string;
    description?: string | null;
    status?: string | null;
    priority?: string | null;
    deadline?: string | null;
    project?: {
        id?: number;
        title?: string;
    } | null;
    assignees?: Employee[];
    assigned_to?: Employee | null;
};

type Project = {
    id: number;
    title?: string;
    description?: string | null;
    status?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    created_at?: string | null;
    creator?: Employee | null;
    employees?: Employee[];
    tasks?: Task[];
    files?: ProjectFile[];
};

type ProjectResponse = {
    message?: string;
    project?: Project;
    data?: Project | { data?: Project };
};

type FileResponse = {
    message?: string;
    file?: ProjectFile;
    data?: ProjectFile | { data?: ProjectFile };
};

function extractProject(response: ProjectResponse): Project | null {
    if (response.project) {
        return response.project;
    }

    if (response.data && "data" in response.data) {
        return response.data.data ?? null;
    }

    if (response.data && "id" in response.data) {
        return response.data;
    }

    return null;
}

function extractFile(response: FileResponse): ProjectFile | null {
    if (response.file) {
        return response.file;
    }

    if (response.data && "data" in response.data) {
        return response.data.data ?? null;
    }

    if (response.data && "id" in response.data) {
        return response.data;
    }

    return null;
}

function getToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem("nexra_token");
}

function formatDate(value?: string | null): string {
    if (!value) {
        return "Not set";
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
}

function formatDateTime(value?: string | null): string {
    if (!value) {
        return "Unknown";
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
}

function normalizeStatus(status?: string | null): string {
    if (!status) {
        return "unknown";
    }

    return status.toLowerCase().replace(/[_-]/g, " ");
}

function statusClasses(status?: string | null): string {
    const normalized = normalizeStatus(status);

    if (normalized === "active") {
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    }

    if (normalized === "completed") {
        return "bg-blue-50 text-blue-700 ring-blue-600/20";
    }

    if (
        normalized === "on hold" ||
        normalized === "on-hold"
    ) {
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
    }

    return "bg-slate-100 text-slate-600 ring-slate-500/20";
}

function taskStatusClasses(status?: string | null): string {
    const normalized = normalizeStatus(status);

    if (
        normalized === "completed" ||
        normalized === "done"
    ) {
        return "bg-emerald-50 text-emerald-700";
    }

    if (
        normalized === "in progress" ||
        normalized === "in_progress"
    ) {
        return "bg-blue-50 text-blue-700";
    }

    return "bg-slate-100 text-slate-600";
}

function priorityClasses(priority?: string | null): string {
    const normalized = normalizeStatus(priority);

    if (normalized === "high") {
        return "bg-red-50 text-red-700";
    }

    if (normalized === "medium") {
        return "bg-amber-50 text-amber-700";
    }

    if (normalized === "low") {
        return "bg-emerald-50 text-emerald-700";
    }

    return "bg-slate-100 text-slate-600";
}

function fileIcon(
    fileType?: string | null,
    fileName?: string
): string {
    const type = (fileType || "").toLowerCase();
    const name = (fileName || "").toLowerCase();

    if (
        type.includes("pdf") ||
        name.endsWith(".pdf")
    ) {
        return "PDF";
    }

    if (
        type.includes("word") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx")
    ) {
        return "DOC";
    }

    if (
        type.includes("sheet") ||
        type.includes("excel") ||
        name.endsWith(".xls") ||
        name.endsWith(".xlsx")
    ) {
        return "XLS";
    }

    if (
        type.includes("zip") ||
        name.endsWith(".zip")
    ) {
        return "ZIP";
    }

    if (
        type.includes("image") ||
        /\.(png|jpg|jpeg)$/i.test(name)
    ) {
        return "IMG";
    }

    return "FILE";
}

function fileIconClasses(
    fileType?: string | null,
    fileName?: string
): string {
    const label = fileIcon(fileType, fileName);

    if (label === "PDF") {
        return "bg-red-50 text-red-600";
    }

    if (label === "DOC") {
        return "bg-blue-50 text-blue-600";
    }

    if (label === "XLS") {
        return "bg-emerald-50 text-emerald-600";
    }

    if (label === "ZIP") {
        return "bg-violet-50 text-violet-600";
    }

    if (label === "IMG") {
        return "bg-amber-50 text-amber-600";
    }

    return "bg-slate-100 text-slate-600";
}

export default function ManagerProjectDetailsPage() {
    const params = useParams();

    const projectId = Array.isArray(params.id)
        ? params.id[0]
        : params.id;

    const [project, setProject] =
        useState<Project | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedFile, setSelectedFile] =
        useState<File | null>(null);

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState("");

    const [deletingFileId, setDeletingFileId] =
        useState<number | null>(null);

    const [deleteError, setDeleteError] = useState("");

    const loadProject = useCallback(async () => {
        if (!projectId) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = getToken();

            const response =
                await apiFetch<ProjectResponse>(
                    `/manager/projects/${projectId}`,
                    {
                        token,
                    }
                );

            const nextProject = extractProject(response);

            if (!nextProject) {
                throw new Error(
                    "Project information could not be loaded."
                );
            }

            setProject(nextProject);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load project."
            );
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        void loadProject();
    }, [loadProject]);

    const employees = project?.employees ?? [];
    const tasks = project?.tasks ?? [];
    const files = project?.files ?? [];

    const handleFileChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setUploadError("");
        setUploadSuccess("");

        const file =
            event.target.files?.[0] ?? null;

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setSelectedFile(null);

            setUploadError(
                "File size must not exceed 10 MB."
            );

            event.target.value = "";
            return;
        }

        const allowedExtensions = [
            ".pdf",
            ".doc",
            ".docx",
            ".xlsx",
            ".png",
            ".jpg",
            ".jpeg",
            ".zip",
        ];

        const lowerName =
            file.name.toLowerCase();

        const isAllowed =
            allowedExtensions.some(
                (extension) =>
                    lowerName.endsWith(extension)
            );

        if (!isAllowed) {
            setSelectedFile(null);

            setUploadError(
                "Allowed files: PDF, DOC, DOCX, XLSX, PNG, JPG, JPEG and ZIP."
            );

            event.target.value = "";
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!selectedFile) {
            setUploadError(
                "Please select a file to upload."
            );

            return;
        }

        setUploading(true);
        setUploadError("");
        setUploadSuccess("");

        try {
            const token = getToken();

            const formData = new FormData();

            formData.append(
                "file",
                selectedFile
            );

            const response =
                await apiFetch<FileResponse>(
                    `/manager/projects/${projectId}/files`,
                    {
                        method: "POST",
                        token,
                        body: formData,
                    }
                );

            const uploadedFile =
                extractFile(response);

            if (uploadedFile) {
                setProject((current) => {
                    if (!current) {
                        return current;
                    }

                    return {
                        ...current,
                        files: [
                            uploadedFile,
                            ...(current.files ?? []),
                        ],
                    };
                });
            } else {
                await loadProject();
            }

            setSelectedFile(null);

            setUploadSuccess(
                response.message ||
                    "File uploaded successfully."
            );

            const input =
                document.getElementById(
                    "project-file"
                ) as HTMLInputElement | null;

            if (input) {
                input.value = "";
            }
        } catch (err) {
            setUploadError(
                err instanceof Error
                    ? err.message
                    : "Unable to upload the file."
            );
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (
        file: ProjectFile
    ) => {
        const token = getToken();

        if (!token) {
            setError(
                "Your session has expired. Please log in again."
            );

            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/manager/projects/${projectId}/files/${file.id}/download`,
                {
                    method: "GET",
                    headers: {
                        Accept:
                            "application/octet-stream",
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const data =
                    await response
                        .json()
                        .catch(() => null);

                throw new Error(
                    data?.message ||
                        "Unable to download the file."
                );
            }

            const blob =
                await response.blob();

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const anchor =
                document.createElement("a");

            anchor.href = url;

            anchor.download =
                file.file_name ||
                "project-file";

            document.body.appendChild(anchor);

            anchor.click();

            anchor.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to download the file."
            );
        }
    };

    const handleDeleteFile = async (
        file: ProjectFile
    ) => {
        const confirmed =
            window.confirm(
                `Delete "${file.file_name || "this file"}"? This action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        setDeletingFileId(file.id);
        setDeleteError("");
        setError("");

        try {
            const token = getToken();

            const response =
                await apiFetch<{
                    message?: string;
                }>(
                    `/manager/projects/${projectId}/files/${file.id}`,
                    {
                        method: "DELETE",
                        token,
                    }
                );

            setProject((current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    files: (
                        current.files ?? []
                    ).filter(
                        (item) =>
                            item.id !== file.id
                    ),
                };
            });

            setUploadSuccess(
                response.message ||
                    "File deleted successfully."
            );
        } catch (err) {
            setDeleteError(
                err instanceof Error
                    ? err.message
                    : "Unable to delete the file."
            );
        } finally {
            setDeletingFileId(null);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50">
                <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 w-72 rounded-lg bg-slate-200" />

                        <div className="h-40 rounded-3xl bg-white shadow-sm" />

                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="h-64 rounded-3xl bg-white shadow-sm lg:col-span-2" />

                            <div className="h-64 rounded-3xl bg-white shadow-sm" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (error && !project) {
        return (
            <main className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-8">
                    <div className="w-full rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <svg
                                className="h-7 w-7"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m0 3.75h.01M10.3 3.7l-8.1 14A2 2 0 003.93 20.7h16.14a2 2 0 001.73-3l-8.1-14a2 2 0 00-3.4 0z"
                                />
                            </svg>
                        </div>

                        <h1 className="mt-5 text-xl font-bold text-slate-900">
                            Unable to load project
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {error}
                        </p>

                        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() =>
                                    void loadProject()
                                }
                                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Try Again
                            </button>

                            <Link
                                href="/manager/projects"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Back to Projects
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!project) {
        return null;
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <Link
                            href="/manager/projects"
                            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                            aria-label="Back to projects"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </Link>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                                Project Details
                            </p>

                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                {project.title ||
                                    "Untitled Project"}
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage project information,
                                team, tasks and files.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={`/manager/projects/${project.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.463l-4.5 1.125 1.125-4.5L16.862 3.487z"
                                />
                            </svg>

                            Edit Project
                        </Link>

                        <Link
                            href={`/manager/tasks/create?project_id=${project.id}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 5v14m-7-7h14"
                                />
                            </svg>

                            New Task
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {uploadSuccess && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        <svg
                            className="h-5 w-5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>

                        {uploadSuccess}
                    </div>
                )}

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-7 text-white sm:px-8">
                        <div className="flex flex-col gap-6">
                            <div className="max-w-3xl">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ring-inset ${statusClasses(
                                            project.status
                                        )}`}
                                    >
                                        {normalizeStatus(
                                            project.status
                                        )}
                                    </span>

                                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                                        Project #{project.id}
                                    </span>
                                </div>

                                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                                    {project.title ||
                                        "Untitled Project"}
                                </h2>

                                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                                    {project.description ||
                                        "No project description has been added yet."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid border-t border-slate-200 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="border-b border-slate-200 p-5 sm:border-r">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Start Date
                            </p>

                            <p className="mt-2 text-sm font-semibold text-slate-900">
                                {formatDate(
                                    project.start_date
                                )}
                            </p>
                        </div>

                        <div className="border-b border-slate-200 p-5 lg:border-r">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                End Date
                            </p>

                            <p className="mt-2 text-sm font-semibold text-slate-900">
                                {formatDate(
                                    project.end_date
                                )}
                            </p>
                        </div>

                        <div className="border-b border-slate-200 p-5 sm:border-r">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Team Members
                            </p>

                            <p className="mt-2 text-sm font-semibold text-slate-900">
                                {employees.length}{" "}
                                {employees.length === 1
                                    ? "employee"
                                    : "employees"}
                            </p>
                        </div>

                        <div className="p-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Created By
                            </p>

                            <p className="mt-2 truncate text-sm font-semibold text-slate-900">
                                {project.creator?.name ||
                                    "Unknown"}
                            </p>
                        </div>
                    </div>
                </section>

                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
                        <div className="border-b border-slate-200 px-6 py-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Project Tasks
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Tasks currently associated
                                        with this project.
                                    </p>
                                </div>

                                <Link
                                    href={`/manager/tasks/create?project_id=${project.id}`}
                                    className="hidden rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 sm:inline-flex"
                                >
                                    Add Task
                                </Link>
                            </div>
                        </div>

                        {tasks.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {tasks.map((task) => (
                                    <Link
                                        key={task.id}
                                        href={`/manager/tasks/${task.id}`}
                                        className="block px-6 py-5 transition hover:bg-slate-50"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="truncate text-sm font-bold text-slate-900">
                                                        {task.title ||
                                                            "Untitled Task"}
                                                    </h3>

                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${taskStatusClasses(
                                                            task.status
                                                        )}`}
                                                    >
                                                        {normalizeStatus(
                                                            task.status
                                                        )}
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    Deadline:{" "}
                                                    {formatDate(
                                                        task.deadline
                                                    )}
                                                </p>
                                            </div>

                                            <div className="flex shrink-0 items-center gap-3">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${priorityClasses(
                                                        task.priority
                                                    )}`}
                                                >
                                                    {task.priority ||
                                                        "No priority"}
                                                </span>

                                                <svg
                                                    className="h-4 w-4 text-slate-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 5h6m-7 4h8m-9 4h10m-8 4h6M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"
                                        />
                                    </svg>
                                </div>

                                <h3 className="mt-4 text-sm font-bold text-slate-900">
                                    No tasks yet
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Create the first task for
                                    this project.
                                </p>

                                <Link
                                    href={`/manager/tasks/create?project_id=${project.id}`}
                                    className="mt-5 inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                    Create Task
                                </Link>
                            </div>
                        )}
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-5">
                            <h2 className="text-lg font-bold text-slate-900">
                                Project Team
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Employees assigned to this project.
                            </p>
                        </div>

                        {employees.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {employees.map(
                                    (employee) => (
                                        <div
                                            key={
                                                employee.id
                                            }
                                            className="flex items-center gap-3 px-6 py-4"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700">
                                                {(
                                                    employee.name ||
                                                    "E"
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold text-slate-900">
                                                    {employee.name ||
                                                        "Unknown Employee"}
                                                </p>

                                                <p className="truncate text-xs text-slate-500">
                                                    {employee.designation ||
                                                        employee.email ||
                                                        "Employee"}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="px-6 py-10 text-center">
                                <p className="text-sm font-semibold text-slate-700">
                                    No employees assigned
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Edit the project to assign
                                    team members.
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-5 sm:px-7">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828a4 4 0 00-5.657-5.657l-7.07 7.071a6 6 0 108.485 8.485L20 13.485"
                                            />
                                        </svg>
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">
                                            Project Files
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Upload and manage project
                                            documents and assets.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                                {files.length}{" "}
                                {files.length === 1
                                    ? "file"
                                    : "files"}
                            </span>
                        </div>
                    </div>

                    <div className="border-b border-slate-200 bg-slate-50/70 p-6 sm:p-7">
                        <form
                            onSubmit={handleUpload}
                            className="flex flex-col gap-4 lg:flex-row lg:items-end"
                        >
                            <div className="min-w-0 flex-1">
                                <label
                                    htmlFor="project-file"
                                    className="mb-2 block text-sm font-bold text-slate-700"
                                >
                                    Upload a project file
                                </label>

                                <input
                                    id="project-file"
                                    type="file"
                                    onChange={
                                        handleFileChange
                                    }
                                    accept=".pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg,.zip"
                                    className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-900 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                                />

                                <p className="mt-2 text-xs text-slate-500">
                                    PDF, DOC, DOCX, XLSX, PNG,
                                    JPG, JPEG or ZIP. Maximum
                                    size: 10 MB.
                                </p>

                                {selectedFile && (
                                    <p className="mt-2 text-xs font-semibold text-indigo-600">
                                        Selected:{" "}
                                        {selectedFile.name}
                                    </p>
                                )}

                                {uploadError && (
                                    <p className="mt-2 text-sm font-medium text-red-600">
                                        {uploadError}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    uploading ||
                                    !selectedFile
                                }
                                className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {uploading ? (
                                    <>
                                        <svg
                                            className="h-4 w-4 animate-spin"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />

                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            />
                                        </svg>

                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 16V4m0 0L8 8m4-4l4 4M5 20h14"
                                            />
                                        </svg>

                                        Upload File
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {deleteError && (
                        <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm font-medium text-red-700 sm:px-7">
                            {deleteError}
                        </div>
                    )}

                    {files.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-7"
                                >
                                    <div className="flex min-w-0 items-center gap-4">
                                        <div
                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[10px] font-black ${fileIconClasses(
                                                file.file_type,
                                                file.file_name
                                            )}`}
                                        >
                                            {fileIcon(
                                                file.file_type,
                                                file.file_name
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p
                                                className="truncate text-sm font-bold text-slate-900"
                                                title={
                                                    file.file_name ||
                                                    ""
                                                }
                                            >
                                                {file.file_name ||
                                                    "Unnamed file"}
                                            </p>

                                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                                                <span>
                                                    Uploaded{" "}
                                                    {formatDateTime(
                                                        file.uploaded_at ||
                                                            file.created_at
                                                    )}
                                                </span>

                                                {file.uploaded_by
                                                    ?.name && (
                                                    <>
                                                        <span>
                                                            •
                                                        </span>

                                                        <span>
                                                            by{" "}
                                                            {
                                                                file
                                                                    .uploaded_by
                                                                    .name
                                                            }
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleDownload(
                                                    file
                                                )
                                            }
                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14"
                                                />
                                            </svg>

                                            Download
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleDeleteFile(
                                                    file
                                                )
                                            }
                                            disabled={
                                                deletingFileId ===
                                                file.id
                                            }
                                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {deletingFileId ===
                                            file.id ? (
                                                <svg
                                                    className="h-4 w-4 animate-spin"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />

                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6 7h12m-9 0V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7m-7 0v12.5A1.5 1.5 0 009.5 21h5a1.5 1.5 0 001.5-1.5V7M10 11v6m4-6v6"
                                                    />
                                                </svg>
                                            )}

                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-6 py-14 text-center sm:px-7">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                <svg
                                    className="h-7 w-7"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M7 3h7l5 5v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M14 3v6h6"
                                    />
                                </svg>
                            </div>

                            <h3 className="mt-4 text-sm font-bold text-slate-900">
                                No project files
                            </h3>

                            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                                Upload project documents,
                                spreadsheets, designs or other
                                supported files so the team can
                                access them from one place.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}