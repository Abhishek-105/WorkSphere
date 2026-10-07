"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Home() {
    const router = useRouter();
    const { user, login, loading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            if (user.role === "manager") {
                router.replace("/manager/dashboard");
            } else {
                router.replace("/employee/dashboard");
            }
        }
    }, [loading, user, router]);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setSubmitting(true);

        try {
            const loggedInUser = await login(
                email,
                password
            );

            if (loggedInUser.role === "manager") {
                router.replace("/manager/dashboard");
            } else {
                router.replace("/employee/dashboard");
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Login failed. Please check your credentials."
            );
        } finally {
            setSubmitting(false);
        }
    }

    if (loading || user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#0B0D12]">
                <div className="text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-indigo-400/20">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-300/20 border-t-indigo-400" />
                    </div>

                    <p className="mt-3 text-sm font-medium text-slate-400">
                        Loading Nexra...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B0D12] px-4 py-5 sm:px-6">
            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-[-220px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

                <div className="absolute bottom-[-220px] left-[-120px] h-[360px] w-[360px] rounded-full bg-violet-500/5 blur-3xl" />

                <div className="absolute right-[-120px] top-[20%] h-[300px] w-[300px] rounded-full bg-indigo-400/5 blur-3xl" />

                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]" />
            </div>

            <div className="relative z-10 w-full max-w-[400px]">
                {/* Brand */}
                <div className="mb-5 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[15px] bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-xl shadow-indigo-500/20 ring-1 ring-white/10">
                        N
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[27px]">
                        Welcome to Nexra
                    </h1>

                    <p className="mt-1.5 text-sm text-slate-400">
                        Sign in to your workspace
                    </p>
                </div>

                {/* Login Card */}
                <div className="rounded-2xl border border-white/10 bg-[#11141B]/95 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
                    {/* Card heading */}
                    <div className="mb-5">
                        <h2 className="text-base font-semibold text-white">
                            Sign in
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Enter your credentials to continue
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-xs font-medium text-slate-300"
                            >
                                Email address
                            </label>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                                    <svg
                                        className="h-[17px] w-[17px]"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-9Z"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m4 7 7.04 5.28a1.6 1.6 0 0 0 1.92 0L20 7"
                                        />
                                    </svg>
                                </div>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    required
                                    autoComplete="email"
                                    placeholder="you@company.com"
                                    className="h-11 w-full rounded-lg border border-white/10 bg-[#0B0D12] pl-10.5 pr-3.5 text-sm text-white outline-none transition duration-200 placeholder:text-slate-600 hover:border-white/15 focus:border-indigo-400/70 focus:bg-[#0D1017] focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-xs font-medium text-slate-300"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                                    <svg
                                        className="h-[17px] w-[17px]"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    >
                                        <rect
                                            width="14"
                                            height="11"
                                            x="5"
                                            y="10"
                                            rx="2"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M8 10V7a4 4 0 0 1 8 0v3"
                                        />
                                    </svg>
                                </div>

                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    required
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    className="h-11 w-full rounded-lg border border-white/10 bg-[#0B0D12] pl-10.5 pr-3.5 text-sm text-white outline-none transition duration-200 placeholder:text-slate-600 hover:border-white/15 focus:border-indigo-400/70 focus:bg-[#0D1017] focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-2.5">
                                <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                                    <svg
                                        className="h-3 w-3"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 8v4m0 4h.01M10.3 3.84 2.58 17a2 2 0 0 0 1.73 3h15.38a2 2 0 0 0 1.73-3L13.7 3.84a2 2 0 0 0-3.4 0Z"
                                        />
                                    </svg>
                                </div>

                                <p className="text-xs leading-4.5 text-red-300">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="group relative flex h-11 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition duration-200 hover:from-indigo-400 hover:to-violet-500 hover:shadow-indigo-500/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <span className="absolute inset-0 bg-white/0 transition group-hover:bg-white/5" />

                            {submitting ? (
                                <span className="relative flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Signing in...
                                </span>
                            ) : (
                                <span className="relative flex items-center gap-2">
                                    Sign in

                                    <svg
                                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 12h14m-6-6 6 6-6 6"
                                        />
                                    </svg>
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Workspace indicator */}
                    <div className="mt-5 flex items-center justify-center gap-2 border-t border-white/5 pt-4">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                        <p className="text-[11px] text-slate-500">
                            Secure internal workspace
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 text-center">
                    <p className="text-[11px] text-slate-600">
                        Nexra Workspace
                        <span className="mx-2 text-slate-700">
                            ·
                        </span>
                        Internal Project Management
                    </p>
                </div>
            </div>
        </main>
    );
}