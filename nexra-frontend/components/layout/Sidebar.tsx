"use client";

import {
    usePathname,
    useRouter,
} from "next/navigation";

import type { ReactNode } from "react";

import { useAuth } from "../../context/AuthContext";

type SidebarProps = {
    isOpen?: boolean;
    onClose?: () => void;
};

type NavigationItem = {
    label: string;
    href: string;
    icon: ReactNode;
};

function DashboardIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}

function ProjectsIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h4l2 2h5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
            <path d="M4 9h16" />
        </svg>
    );
}

function TasksIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="m8 9 1.5 1.5L12 8" />
            <path d="M13.5 9H17" />
            <path d="m8 14 1.5 1.5L12 13" />
            <path d="M13.5 14H17" />
        </svg>
    );
}

function TeamIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <circle cx="9" cy="8" r="3" />
            <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
            <path d="M16 5.5a3 3 0 0 1 0 5.8" />
            <path d="M17 14.5a5 5 0 0 1 4 4.5" />
        </svg>
    );
}

function UpdatesIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
            <path d="M8 8h8" />
            <path d="M8 12h8" />
            <path d="M8 16h5" />
        </svg>
    );
}

function ProfileIcon() {
    return (
        <svg
            width="18"
            height="18"
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

function LogoutIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10" />
            <path d="M14 8l4 4-4 4" />
            <path d="M9 12h9" />
        </svg>
    );
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

    const backendUrl = apiUrl.replace(
        /\/api\/?$/,
        ""
    );

    const cleanPath =
        profilePhoto.replace(/^\/+/, "");

    if (cleanPath.startsWith("storage/")) {
        return `${backendUrl}/${cleanPath}`;
    }

    return `${backendUrl}/storage/${cleanPath}`;
}

export default function Sidebar({
    isOpen = false,
    onClose,
}: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const { user, logout } = useAuth();

    if (!user) {
        return null;
    }

    const managerItems: NavigationItem[] = [
        {
            label: "Dashboard",
            href: "/manager/dashboard",
            icon: <DashboardIcon />,
        },
        {
            label: "Projects",
            href: "/manager/projects",
            icon: <ProjectsIcon />,
        },
        {
            label: "Tasks",
            href: "/manager/tasks",
            icon: <TasksIcon />,
        },
        {
            label: "Team",
            href: "/manager/team",
            icon: <TeamIcon />,
        },
        {
            label: "Daily Updates",
            href: "/manager/daily-updates",
            icon: <UpdatesIcon />,
        },
        {
            label: "Profile",
            href: "/manager/profile",
            icon: <ProfileIcon />,
        },
    ];

    const employeeItems: NavigationItem[] = [
        {
            label: "Dashboard",
            href: "/employee/dashboard",
            icon: <DashboardIcon />,
        },
        {
            label: "My Projects",
            href: "/employee/projects",
            icon: <ProjectsIcon />,
        },
        {
            label: "My Tasks",
            href: "/employee/tasks",
            icon: <TasksIcon />,
        },
        {
            label: "Daily Updates",
            href: "/employee/daily-updates",
            icon: <UpdatesIcon />,
        },
        {
            label: "Profile",
            href: "/employee/profile",
            icon: <ProfileIcon />,
        },
    ];

    const userRole =
        user.role === "manager"
            ? "manager"
            : "employee";

    const navigation =
        userRole === "manager"
            ? managerItems
            : employeeItems;

    const profileImageUrl =
        getProfileImageUrl(
            user.profile_photo
        );

    const initials =
        user.name
            ?.trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) =>
                part.charAt(0).toUpperCase()
            )
            .join("") || "U";

    function navigateTo(href: string) {
        if (pathname === href) {
            onClose?.();
            return;
        }

        onClose?.();
        router.push(href);
    }

    async function handleLogout() {
        await logout();
        router.replace("/");
    }

    return (
        <>
            {isOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/40 md:hidden"
                />
            )}

            <aside
                className={[
                    "fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-200 md:translate-x-0",
                    isOpen
                        ? "translate-x-0"
                        : "-translate-x-full",
                    userRole === "manager"
                        ? "bg-[#172554]"
                        : "bg-[#171A19]",
                ].join(" ")}
            >
                {/* Brand */}
                <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-5">
                    <div className="flex items-center gap-3">
                        <div
                            className={[
                                "flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white",
                                userRole === "manager"
                                    ? "bg-blue-600"
                                    : "bg-[#166534]",
                            ].join(" ")}
                        >
                            N
                        </div>

                        <div>
                            <p className="text-sm font-bold tracking-tight text-white">
                                Nexra
                            </p>

                            <p className="text-[10px] font-medium text-white/45">
                                WORKSPACE
                            </p>
                        </div>
                    </div>
                </div>

                {/* User */}
                <div className="border-b border-white/10 px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={[
                                "h-10 w-10 shrink-0 overflow-hidden rounded-xl",
                                userRole === "manager"
                                    ? "bg-blue-600/80"
                                    : "bg-[#166534]",
                            ].join(" ")}
                        >
                            {profileImageUrl ? (
                                <img
                                    src={profileImageUrl}
                                    alt={`${user.name || "User"} profile`}
                                    className="h-full w-full object-cover"
                                    onError={(event) => {
                                        event.currentTarget.style.display =
                                            "none";
                                    }}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                                    {initials}
                                </div>
                            )}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                                {user.name || "User"}
                            </p>

                            <p className="truncate text-xs text-white/45">
                                {user.designation ||
                                    (userRole === "manager"
                                        ? "Manager"
                                        : "Employee")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-5">
                    <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                        Workspace
                    </p>

                    <div className="space-y-1">
                        {navigation.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                pathname.startsWith(
                                    `${item.href}/`
                                );

                            return (
                                <button
                                    key={item.href}
                                    type="button"
                                    onClick={() =>
                                        navigateTo(
                                            item.href
                                        )
                                    }
                                    className={[
                                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                                        isActive
                                            ? userRole ===
                                              "manager"
                                                ? "bg-white/10 text-white shadow-sm"
                                                : "bg-[#166534] text-white shadow-sm"
                                            : "text-white/55 hover:bg-white/[0.06] hover:text-white",
                                    ].join(" ")}
                                >
                                    <span
                                        className={
                                            isActive
                                                ? "text-white"
                                                : "text-white/45"
                                        }
                                    >
                                        {item.icon}
                                    </span>

                                    <span>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Logout */}
                <div className="shrink-0 border-t border-white/10 p-3">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl bg-red-500/10 px-3 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
                    >
                        <LogoutIcon />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}