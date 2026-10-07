"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

type AppLayoutProps = {
    children: ReactNode;
};

export default function AppLayout({
    children,
}: AppLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();

    const { user, loading } = useAuth();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isManagerRoute = pathname.startsWith("/manager");
    const isEmployeeRoute = pathname.startsWith("/employee");

    const isProtectedRoute =
        isManagerRoute || isEmployeeRoute;

    useEffect(() => {
        if (loading || !isProtectedRoute) {
            return;
        }

        if (!user) {
            router.replace("/");
            return;
        }

        if (
            isManagerRoute &&
            user.role !== "manager"
        ) {
            router.replace("/employee/dashboard");
            return;
        }

        if (
            isEmployeeRoute &&
            user.role !== "employee"
        ) {
            router.replace("/manager/dashboard");
        }
    }, [
        loading,
        user,
        pathname,
        router,
        isProtectedRoute,
        isManagerRoute,
        isEmployeeRoute,
    ]);

    /*
     * Public pages such as the login page
     * should not display the application sidebar/navbar.
     */
    if (!isProtectedRoute) {
        return <>{children}</>;
    }

    /*
     * Wait until authentication state is known.
     */
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-white" />

                    <p className="mt-4 text-sm text-slate-400">
                        Loading workspace...
                    </p>
                </div>
            </div>
        );
    }

    /*
     * Protected route but no authenticated user.
     */
    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <p className="text-sm text-slate-400">
                    Redirecting to login...
                </p>
            </div>
        );
    }

    /*
     * Prevent the wrong role from seeing another
     * role's protected area while redirect happens.
     */
    if (
        (isManagerRoute && user.role !== "manager") ||
        (isEmployeeRoute && user.role !== "employee")
    ) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <p className="text-sm text-slate-400">
                    Redirecting to your workspace...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F7F6]">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="min-h-screen md:pl-64">
                <TopNavbar
                    onMenuClick={() =>
                        setSidebarOpen(true)
                    }
                />

                <main className="min-h-[calc(100vh-4rem)] p-3 sm:p-4 lg:p-5">
                    {children}
                </main>
            </div>
        </div>
    );
}