"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { API_URL, apiFetch } from "@/lib/api";

type Project = {
    id: number;
    title?: string;
    description?: string | null;
    status?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    created_at?: string | null;
    creator?: {
        id?: number;
        name?: string | null;
        email?: string | null;
    } | null;
    tasks?: Task[] | { data?: Task[] };
    employees?: Employee[] | { data?: Employee[] };
    files?: ProjectFile[] | { data?: ProjectFile[] };
};

type Employee = {
    id: number;
    name?: string | null;
    email?: string | null;
    designation?: string | null;
};

type Task = {
    id: number;
    title?: string | null;
    description?: string | null;
    status?: string | null;
    priority?: string | null;
    deadline?: string | null;
    assigned_to?: number | null;
    assignee?: Employee | null;
    assignees?: Employee[] | { data?: Employee[] };
};

type ProjectFile = {
    id: number;
    file_name?: string | null;
    original_name?: string | null;
    name?: string | null;
    file_path?: string | null;
    path?: string | null;
    file_type?: string | null;
    mime_type?: string | null;
    file_size?: number | null;
    size?: number | null;
    created_at?: string | null;
    uploader?: {
        id?: number;
        name?: string | null;
    } | null;
};

type ProjectResponse = {
    project?: Project;
    data?: Project | { project?: Project };
    message?: string;
};

function getToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem("nexra_token");
}

function extractProject(response: ProjectResponse): Project | null {
    if (response.project) {
        return response.project;
    }

    if (response.data && !Array.isArray(response.data)) {
        if ("project" in response.data) {
            return response.data.project ?? null;
        }

        if ("id" in response.data) {
            return response.data;
        }
    }

    return null;
}

function extractArray<T>(
    value: T[] | { data?: T[] } | undefined | null
): T[] {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    return Array.isArray(value.data) ? value.data : [];
}

function formatDate(date?: string | null): string {
    if (!date) {
        return "Not set";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(date?: string | null): string {
    if (!date) {
        return "Unknown";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatFileSize(size?: number | null): string {
    if (!size || size <= 0) {
        return "Unknown size";
    }

    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    if (size < 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getFileName(file: ProjectFile): string {
    return (
        file.original_name ||
        file.file_name ||
        file.name ||
        file.file_path?.split("/").pop() ||
        file.path?.split("/").pop() ||
        "Project file"
    );
}

function getFileExtension(file: ProjectFile): string {
    const name = getFileName(file);
    const extension = name.split(".").pop();

    return extension ? extension.toUpperCase() : "FILE";
}

function getTaskStatus(status?: string | null): string {
    const value = (status || "").toLowerCase();

    if (
        value === "done" ||
        value === "completed" ||
        value === "complete"
    ) {
        return "completed";
    }

    if (
        value === "in progress" ||
        value === "in-progress" ||
        value === "in_progress"
    ) {
        return "in-progress";
    }

    return "pending";
}

function getTaskStatusLabel(status?: string | null): string {
    const normalized = getTaskStatus(status);

    if (normalized === "completed") {
        return "Completed";
    }

    if (normalized === "in-progress") {
        return "In Progress";
    }

    return "Pending";
}

function getPriorityClass(priority?: string | null): string {
    const value = (priority || "").toLowerCase();

    if (value === "high" || value === "urgent") {
        return "priority-high";
    }

    if (value === "medium") {
        return "priority-medium";
    }

    return "priority-low";
}

function getStatusClass(status?: string | null): string {
    const value = (status || "").toLowerCase();

    if (value === "completed") {
        return "status-completed";
    }

    if (value === "on-hold" || value === "on hold") {
        return "status-hold";
    }

    return "status-active";
}

function getInitials(name?: string | null): string {
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

export default function EmployeeProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const projectId = String(params.id);

    const [project, setProject] = useState<Project | null>(null);
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [downloadingFileId, setDownloadingFileId] = useState<number | null>(
        null
    );
    const [filesError, setFilesError] = useState("");

    const loadProject = useCallback(async () => {
        const token = getToken();

        if (!token) {
            router.push("/login");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setFilesError("");

            const response = await apiFetch<ProjectResponse>(
                `/employee/projects/${projectId}`,
                {
                    token,
                }
            );

            const extractedProject = extractProject(response);

            if (!extractedProject) {
                throw new Error("Project details could not be loaded.");
            }

            setProject(extractedProject);

            /*
             * Employee ProjectController@show already loads:
             * creator, employees, files.uploader and employee tasks.
             *
             * Therefore we do not call a separate /files endpoint.
             */
            setFiles(extractArray(extractedProject.files));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load project details."
            );
        } finally {
            setLoading(false);
        }
    }, [projectId, router]);

    useEffect(() => {
        loadProject();
    }, [loadProject]);

    const tasks = useMemo(
        () => extractArray(project?.tasks),
        [project?.tasks]
    );

    const employees = useMemo(
        () => extractArray(project?.employees),
        [project?.employees]
    );

    const completedTasks = useMemo(
        () =>
            tasks.filter(
                (task) => getTaskStatus(task.status) === "completed"
            ).length,
        [tasks]
    );

    const progress = useMemo(() => {
        if (tasks.length === 0) {
            return 0;
        }

        return Math.round((completedTasks / tasks.length) * 100);
    }, [completedTasks, tasks.length]);

    const handleDownload = async (file: ProjectFile) => {
        const token = getToken();

        if (!token) {
            router.push("/login");
            return;
        }

        setDownloadingFileId(file.id);
        setFilesError("");

        try {
            const response = await fetch(
                `${API_URL}/employee/projects/${projectId}/files/${file.id}/download`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/octet-stream",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                throw new Error(
                    data?.message || "Unable to download this file."
                );
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const anchor = document.createElement("a");

            anchor.href = url;
            anchor.download = getFileName(file);

            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            setFilesError(
                err instanceof Error
                    ? err.message
                    : "Unable to download this file."
            );
        } finally {
            setDownloadingFileId(null);
        }
    };

    if (loading) {
        return (
            <main className="page-shell">
                <div className="loading-card">
                    <div className="loading-spinner" />

                    <p>Loading project...</p>
                </div>

                <style jsx>{`
                    .page-shell {
                        min-height: 100vh;
                        background: #f5f7fb;
                        padding: 32px;
                    }

                    .loading-card {
                        min-height: 420px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 14px;
                        background: #ffffff;
                        border: 1px solid #e5e7eb;
                        border-radius: 24px;
                        color: #64748b;
                    }

                    .loading-spinner {
                        width: 34px;
                        height: 34px;
                        border: 3px solid #e2e8f0;
                        border-top-color: #111827;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                    }

                    @keyframes spin {
                        to {
                            transform: rotate(360deg);
                        }
                    }

                    @media (max-width: 640px) {
                        .page-shell {
                            padding: 18px;
                        }
                    }
                `}</style>
            </main>
        );
    }

    if (error || !project) {
        return (
            <main className="page-shell">
                <div className="error-card">
                    <div className="error-icon">!</div>

                    <h1>Project unavailable</h1>

                    <p>{error || "This project could not be found."}</p>

                    <Link href="/employee/projects" className="back-button">
                        Back to Projects
                    </Link>
                </div>

                <style jsx>{`
                    .page-shell {
                        min-height: 100vh;
                        background: #f5f7fb;
                        padding: 32px;
                    }

                    .error-card {
                        max-width: 560px;
                        margin: 80px auto;
                        padding: 42px;
                        text-align: center;
                        background: #ffffff;
                        border: 1px solid #e5e7eb;
                        border-radius: 24px;
                        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
                    }

                    .error-icon {
                        width: 48px;
                        height: 48px;
                        margin: 0 auto 18px;
                        display: grid;
                        place-items: center;
                        border-radius: 14px;
                        background: #fef2f2;
                        color: #dc2626;
                        font-weight: 800;
                        font-size: 22px;
                    }

                    .error-card h1 {
                        margin: 0 0 8px;
                        font-size: 24px;
                        color: #0f172a;
                    }

                    .error-card p {
                        margin: 0 0 24px;
                        color: #64748b;
                    }

                    .back-button {
                        display: inline-flex;
                        padding: 11px 18px;
                        border-radius: 10px;
                        background: #111827;
                        color: #ffffff;
                        text-decoration: none;
                        font-weight: 700;
                    }

                    @media (max-width: 640px) {
                        .page-shell {
                            padding: 18px;
                        }
                    }
                `}</style>
            </main>
        );
    }

    return (
        <main className="page-shell">
            <div className="page-container">
                <div className="topbar">
                    <div>
                        <Link href="/employee/projects" className="back-link">
                            ← Back to Projects
                        </Link>

                        <div className="eyebrow">PROJECT DETAILS</div>

                        <h1>{project.title || "Untitled Project"}</h1>

                        <p>
                            View your project information, assigned work,
                            team members and shared files.
                        </p>
                    </div>

                    <Link
                        href="/employee/daily-updates/create"
                        className="primary-button"
                    >
                        + Submit Daily Update
                    </Link>
                </div>

                <section className="hero-card">
                    <div className="hero-content">
                        <div className="hero-heading">
                            <div>
                                <span
                                    className={`status-badge ${getStatusClass(
                                        project.status
                                    )}`}
                                >
                                    {project.status || "Active"}
                                </span>

                                <h2>{project.title || "Untitled Project"}</h2>

                                <p>
                                    {project.description ||
                                        "No project description has been added yet."}
                                </p>
                            </div>
                        </div>

                        <div className="hero-meta">
                            <div>
                                <span>Start Date</span>

                                <strong>
                                    {formatDate(project.start_date)}
                                </strong>
                            </div>

                            <div>
                                <span>End Date</span>

                                <strong>
                                    {formatDate(project.end_date)}
                                </strong>
                            </div>

                            <div>
                                <span>Project Manager</span>

                                <strong>
                                    {project.creator?.name || "Not assigned"}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="progress-panel">
                        <div className="progress-header">
                            <span>Task Progress</span>

                            <strong>{progress}%</strong>
                        </div>

                        <div className="progress-track">
                            <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="progress-caption">
                            {completedTasks} of {tasks.length} tasks completed
                        </div>
                    </div>
                </section>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">T</div>

                        <div>
                            <span>Total Tasks</span>

                            <strong>{tasks.length}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon completed">✓</div>

                        <div>
                            <span>Completed</span>

                            <strong>{completedTasks}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon team">U</div>

                        <div>
                            <span>Team Members</span>

                            <strong>{employees.length}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon files">F</div>

                        <div>
                            <span>Shared Files</span>

                            <strong>{files.length}</strong>
                        </div>
                    </div>
                </div>

                <div className="content-grid">
                    <section className="content-card">
                        <div className="section-header">
                            <div>
                                <span className="section-label">
                                    WORK ITEMS
                                </span>

                                <h3>Project Tasks</h3>
                            </div>

                            <span className="count-badge">
                                {tasks.length}
                            </span>
                        </div>

                        {tasks.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">✓</div>

                                <h4>No tasks assigned</h4>

                                <p>
                                    There are currently no tasks available for
                                    this project.
                                </p>
                            </div>
                        ) : (
                            <div className="task-list">
                                {tasks.map((task) => {
                                    const status = getTaskStatus(task.status);

                                    return (
                                        <Link
                                            href={`/employee/tasks/${task.id}`}
                                            className="task-row"
                                            key={task.id}
                                        >
                                            <div className="task-main">
                                                <div className="task-title-row">
                                                    <h4>
                                                        {task.title ||
                                                            "Untitled Task"}
                                                    </h4>

                                                    <span
                                                        className={`priority-badge ${getPriorityClass(
                                                            task.priority
                                                        )}`}
                                                    >
                                                        {task.priority ||
                                                            "Normal"}
                                                    </span>
                                                </div>

                                                <p>
                                                    {task.description ||
                                                        "No task description."}
                                                </p>

                                                <div className="task-meta">
                                                    <span>
                                                        Deadline:{" "}
                                                        <strong>
                                                            {formatDate(
                                                                task.deadline
                                                            )}
                                                        </strong>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="task-status-area">
                                                <span
                                                    className={`task-status ${status}`}
                                                >
                                                    {getTaskStatusLabel(
                                                        task.status
                                                    )}
                                                </span>

                                                <span className="task-arrow">
                                                    →
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section className="content-card">
                        <div className="section-header">
                            <div>
                                <span className="section-label">TEAM</span>

                                <h3>Project Members</h3>
                            </div>

                            <span className="count-badge">
                                {employees.length}
                            </span>
                        </div>

                        {employees.length === 0 ? (
                            <div className="empty-state compact">
                                <div className="empty-icon">U</div>

                                <h4>No team members</h4>

                                <p>No employees are currently assigned.</p>
                            </div>
                        ) : (
                            <div className="member-list">
                                {employees.map((employee) => (
                                    <div
                                        className="member-row"
                                        key={employee.id}
                                    >
                                        <div className="avatar">
                                            {getInitials(employee.name)}
                                        </div>

                                        <div className="member-info">
                                            <strong>
                                                {employee.name || "Employee"}
                                            </strong>

                                            <span>
                                                {employee.designation ||
                                                    "Team Member"}
                                            </span>
                                        </div>

                                        <span className="member-dot" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <section className="content-card files-card">
                    <div className="section-header files-header">
                        <div>
                            <span className="section-label">RESOURCES</span>

                            <h3>Project Files</h3>

                            <p>
                                Files shared with you by the project manager.
                            </p>
                        </div>

                        <span className="count-badge">
                            {files.length}
                        </span>
                    </div>

                    {filesError ? (
                        <div className="files-error">
                            <span>{filesError}</span>

                            <button
                                type="button"
                                onClick={() => {
                                    setFilesError("");
                                    loadProject();
                                }}
                                className="retry-button"
                            >
                                Retry
                            </button>
                        </div>
                    ) : files.length === 0 ? (
                        <div className="empty-state file-empty">
                            <div className="empty-icon">F</div>

                            <h4>No files shared yet</h4>

                            <p>
                                Project documents and resources shared by the
                                manager will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="file-list">
                            {files.map((file) => (
                                <div className="file-row" key={file.id}>
                                    <div className="file-icon">
                                        {getFileExtension(file).slice(0, 4)}
                                    </div>

                                    <div className="file-info">
                                        <strong title={getFileName(file)}>
                                            {getFileName(file)}
                                        </strong>

                                        <div className="file-meta">
                                            <span>
                                                {getFileExtension(file)}
                                            </span>

                                            <span>•</span>

                                            <span>
                                                {formatFileSize(
                                                    file.file_size ??
                                                        file.size
                                                )}
                                            </span>

                                            <span>•</span>

                                            <span>
                                                {formatDateTime(
                                                    file.created_at
                                                )}
                                            </span>
                                        </div>

                                        {file.uploader?.name && (
                                            <small>
                                                Shared by{" "}
                                                {file.uploader.name}
                                            </small>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className="download-button"
                                        onClick={() =>
                                            handleDownload(file)
                                        }
                                        disabled={
                                            downloadingFileId === file.id
                                        }
                                    >
                                        {downloadingFileId === file.id
                                            ? "Downloading..."
                                            : "↓ Download"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <style jsx>{`
                .page-shell {
                    min-height: 100vh;
                    background:
                        radial-gradient(
                            circle at top right,
                            rgba(99, 102, 241, 0.07),
                            transparent 28%
                        ),
                        #f5f7fb;
                    padding: 30px;
                }

                .page-container {
                    max-width: 1450px;
                    margin: 0 auto;
                }

                .topbar {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    gap: 24px;
                    margin-bottom: 26px;
                }

                .back-link {
                    display: inline-block;
                    margin-bottom: 18px;
                    color: #64748b;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 700;
                }

                .back-link:hover {
                    color: #111827;
                }

                .eyebrow,
                .section-label {
                    color: #6366f1;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.12em;
                }

                .topbar h1 {
                    margin: 7px 0 7px;
                    color: #0f172a;
                    font-size: 32px;
                    line-height: 1.15;
                    letter-spacing: -0.03em;
                }

                .topbar p {
                    max-width: 680px;
                    margin: 0;
                    color: #64748b;
                    font-size: 15px;
                }

                .primary-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 44px;
                    padding: 0 17px;
                    border-radius: 11px;
                    background: #111827;
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 800;
                    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
                    white-space: nowrap;
                }

                .primary-button:hover {
                    background: #1f2937;
                }

                .hero-card {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 300px;
                    gap: 30px;
                    padding: 30px;
                    border: 1px solid #e2e8f0;
                    border-radius: 24px;
                    background: linear-gradient(
                        135deg,
                        #111827 0%,
                        #1e293b 100%
                    );
                    color: #ffffff;
                    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
                }

                .status-badge {
                    display: inline-flex;
                    padding: 6px 10px;
                    border-radius: 999px;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: capitalize;
                }

                .status-active {
                    background: rgba(34, 197, 94, 0.15);
                    color: #86efac;
                }

                .status-completed {
                    background: rgba(96, 165, 250, 0.15);
                    color: #93c5fd;
                }

                .status-hold {
                    background: rgba(251, 191, 36, 0.15);
                    color: #fde68a;
                }

                .hero-heading h2 {
                    margin: 14px 0 9px;
                    font-size: 29px;
                    letter-spacing: -0.025em;
                }

                .hero-heading p {
                    max-width: 760px;
                    margin: 0;
                    color: #cbd5e1;
                    line-height: 1.65;
                    font-size: 14px;
                }

                .hero-meta {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 20px;
                    margin-top: 30px;
                    padding-top: 22px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .hero-meta span {
                    display: block;
                    margin-bottom: 6px;
                    color: #94a3b8;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .hero-meta strong {
                    color: #f8fafc;
                    font-size: 14px;
                }

                .progress-panel {
                    align-self: center;
                    padding: 22px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 18px;
                    background: rgba(255, 255, 255, 0.06);
                }

                .progress-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 12px;
                    color: #cbd5e1;
                    font-size: 13px;
                    font-weight: 700;
                }

                .progress-header strong {
                    color: #ffffff;
                    font-size: 22px;
                }

                .progress-track {
                    height: 8px;
                    overflow: hidden;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.1);
                }

                .progress-fill {
                    height: 100%;
                    border-radius: inherit;
                    background: #818cf8;
                }

                .progress-caption {
                    margin-top: 11px;
                    color: #94a3b8;
                    font-size: 12px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 16px;
                    margin: 20px 0;
                }

                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 13px;
                    min-height: 92px;
                    padding: 18px;
                    border: 1px solid #e5e7eb;
                    border-radius: 17px;
                    background: #ffffff;
                    box-shadow: 0 8px 25px rgba(15, 23, 42, 0.04);
                }

                .stat-icon {
                    width: 42px;
                    height: 42px;
                    flex: 0 0 42px;
                    display: grid;
                    place-items: center;
                    border-radius: 12px;
                    background: #eef2ff;
                    color: #4f46e5;
                    font-size: 14px;
                    font-weight: 900;
                }

                .stat-icon.completed {
                    background: #ecfdf5;
                    color: #059669;
                }

                .stat-icon.team {
                    background: #eff6ff;
                    color: #2563eb;
                }

                .stat-icon.files {
                    background: #fff7ed;
                    color: #ea580c;
                }

                .stat-card span {
                    display: block;
                    margin-bottom: 4px;
                    color: #64748b;
                    font-size: 12px;
                    font-weight: 700;
                }

                .stat-card strong {
                    color: #0f172a;
                    font-size: 23px;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.75fr);
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .content-card {
                    border: 1px solid #e5e7eb;
                    border-radius: 20px;
                    background: #ffffff;
                    box-shadow: 0 8px 28px rgba(15, 23, 42, 0.04);
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 22px 22px 18px;
                    border-bottom: 1px solid #eef2f7;
                }

                .section-header h3 {
                    margin: 5px 0 0;
                    color: #0f172a;
                    font-size: 19px;
                    letter-spacing: -0.02em;
                }

                .count-badge {
                    min-width: 31px;
                    height: 31px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 9px;
                    border-radius: 10px;
                    background: #f1f5f9;
                    color: #475569;
                    font-size: 12px;
                    font-weight: 800;
                }

                .task-list {
                    padding: 5px 0;
                }

                .task-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    padding: 18px 22px;
                    border-bottom: 1px solid #f1f5f9;
                    color: inherit;
                    text-decoration: none;
                }

                .task-row:last-child {
                    border-bottom: 0;
                }

                .task-row:hover {
                    background: #f8fafc;
                }

                .task-main {
                    min-width: 0;
                }

                .task-title-row {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    flex-wrap: wrap;
                }

                .task-title-row h4 {
                    margin: 0;
                    color: #0f172a;
                    font-size: 14px;
                }

                .task-main p {
                    margin: 6px 0;
                    overflow: hidden;
                    color: #64748b;
                    font-size: 12px;
                    line-height: 1.5;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .priority-badge,
                .task-status {
                    display: inline-flex;
                    align-items: center;
                    padding: 5px 8px;
                    border-radius: 7px;
                    font-size: 10px;
                    font-weight: 800;
                }

                .priority-high {
                    background: #fef2f2;
                    color: #dc2626;
                }

                .priority-medium {
                    background: #fff7ed;
                    color: #ea580c;
                }

                .priority-low {
                    background: #f0fdf4;
                    color: #16a34a;
                }

                .task-meta {
                    color: #94a3b8;
                    font-size: 11px;
                }

                .task-meta strong {
                    color: #64748b;
                }

                .task-status-area {
                    display: flex;
                    align-items: center;
                    gap: 13px;
                    flex: 0 0 auto;
                }

                .task-status.completed {
                    background: #ecfdf5;
                    color: #059669;
                }

                .task-status.in-progress {
                    background: #eff6ff;
                    color: #2563eb;
                }

                .task-status.pending {
                    background: #f8fafc;
                    color: #64748b;
                }

                .task-arrow {
                    color: #94a3b8;
                    font-size: 18px;
                }

                .member-list {
                    padding: 8px 0;
                }

                .member-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 13px 20px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .member-row:last-child {
                    border-bottom: 0;
                }

                .avatar {
                    width: 38px;
                    height: 38px;
                    flex: 0 0 38px;
                    display: grid;
                    place-items: center;
                    border-radius: 11px;
                    background: #eef2ff;
                    color: #4f46e5;
                    font-size: 12px;
                    font-weight: 900;
                }

                .member-info {
                    min-width: 0;
                    flex: 1;
                }

                .member-info strong {
                    display: block;
                    overflow: hidden;
                    color: #0f172a;
                    font-size: 13px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .member-info span {
                    display: block;
                    margin-top: 3px;
                    overflow: hidden;
                    color: #94a3b8;
                    font-size: 11px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .member-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #22c55e;
                    box-shadow: 0 0 0 3px #dcfce7;
                }

                .empty-state {
                    padding: 48px 24px;
                    text-align: center;
                }

                .empty-state.compact {
                    padding: 44px 20px;
                }

                .empty-icon {
                    width: 45px;
                    height: 45px;
                    margin: 0 auto 13px;
                    display: grid;
                    place-items: center;
                    border-radius: 13px;
                    background: #f1f5f9;
                    color: #64748b;
                    font-size: 14px;
                    font-weight: 900;
                }

                .empty-state h4 {
                    margin: 0 0 6px;
                    color: #0f172a;
                    font-size: 14px;
                }

                .empty-state p {
                    max-width: 430px;
                    margin: 0 auto;
                    color: #94a3b8;
                    font-size: 12px;
                    line-height: 1.6;
                }

                .files-card {
                    margin-bottom: 20px;
                }

                .files-header {
                    align-items: flex-start;
                }

                .files-header p {
                    margin: 6px 0 0;
                    color: #94a3b8;
                    font-size: 12px;
                }

                .file-list {
                    padding: 5px 0;
                }

                .file-row {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 16px 22px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .file-row:last-child {
                    border-bottom: 0;
                }

                .file-icon {
                    width: 46px;
                    height: 46px;
                    flex: 0 0 46px;
                    display: grid;
                    place-items: center;
                    border: 1px solid #e0e7ff;
                    border-radius: 12px;
                    background: #eef2ff;
                    color: #4f46e5;
                    font-size: 9px;
                    font-weight: 900;
                    letter-spacing: 0.04em;
                }

                .file-info {
                    min-width: 0;
                    flex: 1;
                }

                .file-info strong {
                    display: block;
                    max-width: 650px;
                    overflow: hidden;
                    color: #0f172a;
                    font-size: 13px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .file-meta {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 7px;
                    margin-top: 5px;
                    color: #94a3b8;
                    font-size: 10px;
                }

                .file-info small {
                    display: block;
                    margin-top: 5px;
                    color: #64748b;
                    font-size: 10px;
                }

                .download-button {
                    min-height: 37px;
                    padding: 0 13px;
                    border: 1px solid #dbe2ea;
                    border-radius: 9px;
                    background: #ffffff;
                    color: #334155;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 800;
                    white-space: nowrap;
                }

                .download-button:hover:not(:disabled) {
                    border-color: #c7d2fe;
                    background: #eef2ff;
                    color: #4338ca;
                }

                .download-button:disabled {
                    cursor: not-allowed;
                    opacity: 0.55;
                }

                .files-error {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 14px;
                    padding: 28px;
                    color: #dc2626;
                    font-size: 13px;
                }

                .retry-button {
                    min-height: 34px;
                    padding: 0 12px;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    background: #ffffff;
                    color: #dc2626;
                    cursor: pointer;
                    font-weight: 800;
                }

                .file-empty {
                    min-height: 200px;
                }

                @media (max-width: 1050px) {
                    .hero-card {
                        grid-template-columns: 1fr;
                    }

                    .content-grid {
                        grid-template-columns: 1fr;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 700px) {
                    .page-shell {
                        padding: 18px;
                    }

                    .topbar {
                        align-items: stretch;
                        flex-direction: column;
                    }

                    .topbar h1 {
                        font-size: 27px;
                    }

                    .primary-button {
                        width: 100%;
                    }

                    .hero-card {
                        padding: 22px;
                        border-radius: 19px;
                    }

                    .hero-heading h2 {
                        font-size: 24px;
                    }

                    .hero-meta {
                        grid-template-columns: 1fr;
                        gap: 15px;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                    }

                    .stat-card {
                        min-height: 82px;
                        padding: 14px;
                    }

                    .stat-icon {
                        width: 36px;
                        height: 36px;
                        flex-basis: 36px;
                    }

                    .stat-card strong {
                        font-size: 19px;
                    }

                    .task-row {
                        align-items: flex-start;
                        padding: 16px;
                    }

                    .task-status-area {
                        flex-direction: column;
                        gap: 7px;
                    }

                    .task-main p {
                        white-space: normal;
                    }

                    .section-header {
                        padding: 18px 16px;
                    }

                    .file-row {
                        align-items: flex-start;
                        flex-wrap: wrap;
                        padding: 16px;
                    }

                    .file-info {
                        width: calc(100% - 60px);
                    }

                    .download-button {
                        width: 100%;
                    }
                }

                @media (max-width: 450px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </main>
    );
}