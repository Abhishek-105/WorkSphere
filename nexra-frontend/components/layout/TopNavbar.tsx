"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

type TopNavbarProps = {
    onMenuClick?: () => void;
};

export default function TopNavbar({
    onMenuClick,
}: TopNavbarProps) {
    const router = useRouter();
    const { user, logout } = useAuth();

    async function handleLogout() {
        try {
            await logout();
        } finally {
            router.replace("/");
        }
    }

    function handleProfileClick() {
        if (!user) {
            return;
        }

        if (user.role === "manager") {
            router.push("/manager/profile");
            return;
        }

        router.push("/employee/profile");
    }

    function getInitials(name: string) {
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0))
            .join("")
            .toUpperCase();
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 md:hidden"
                    aria-label="Open navigation"
                >
                    <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>

                <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-slate-900">
                        Nexra Workspace
                    </p>

                    <p className="text-xs text-slate-500">
                        Daily Work & Project Management
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                {user && (
                    <>
                        <button
                            type="button"
                            onClick={handleProfileClick}
                            className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-50"
                            aria-label="Open profile"
                        >
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold text-slate-900 transition group-hover:text-slate-700">
                                    {user.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                    {user.designation ||
                                        (user.role ===
                                        "manager"
                                            ? "Manager"
                                            : "Employee")}
                                </p>
                            </div>

                            <div
                                className={[
                                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm transition",
                                    user.role ===
                                    "manager"
                                        ? "bg-blue-600 group-hover:bg-blue-700"
                                        : "bg-[#166534] group-hover:bg-[#14532D]",
                                ].join(" ")}
                            >
                                {getInitials(
                                    user.name ||
                                        "User"
                                )}
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 hover:text-red-700"
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}