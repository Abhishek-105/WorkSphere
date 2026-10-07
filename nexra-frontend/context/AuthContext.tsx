"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import {
    getCurrentUser,
    login as loginRequest,
    logout as logoutRequest,
} from "../lib/auth";

import type { User } from "../types/auth";

type AuthContextType = {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (
        email: string,
        password: string
    ) => Promise<User>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<
    AuthContextType | undefined
>(undefined);

const TOKEN_KEY = "nexra_token";

function normalizeUser(user: User): User {
    const normalizedRole =
        typeof user.role === "string"
            ? user.role.trim().toLowerCase()
            : "";

    if (
        normalizedRole !== "manager" &&
        normalizedRole !== "employee"
    ) {
        throw new Error(
            `Invalid user role: ${user.role}`
        );
    }

    return {
        ...user,
        role: normalizedRole,
    };
}

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [user, setUser] =
        useState<User | null>(null);

    const [token, setToken] =
        useState<string | null>(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        let mounted = true;

        async function restoreAuthentication() {
            try {
                const storedToken =
                    localStorage.getItem(TOKEN_KEY);

                if (!storedToken) {
                    if (mounted) {
                        setLoading(false);
                    }

                    return;
                }

                if (mounted) {
                    setToken(storedToken);
                }

                const response =
                    await getCurrentUser(storedToken);

                if (!mounted) {
                    return;
                }

                if (!response?.user) {
                    throw new Error(
                        "Authenticated user was not returned."
                    );
                }

                const normalizedUser =
                    normalizeUser(response.user);

                setUser(normalizedUser);
            } catch {
                if (!mounted) {
                    return;
                }

                localStorage.removeItem(TOKEN_KEY);

                setToken(null);
                setUser(null);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        restoreAuthentication();

        return () => {
            mounted = false;
        };
    }, []);

    async function login(
        email: string,
        password: string
    ): Promise<User> {
        const response =
            await loginRequest(
                email,
                password
            );

        if (!response?.token) {
            throw new Error(
                "Login succeeded but no authentication token was returned."
            );
        }

        if (!response?.user) {
            throw new Error(
                "Login succeeded but user information was not returned."
            );
        }

        const normalizedUser =
            normalizeUser(response.user);

        localStorage.setItem(
            TOKEN_KEY,
            response.token
        );

        setToken(response.token);
        setUser(normalizedUser);

        return normalizedUser;
    }

    async function logout(): Promise<void> {
        const currentToken = token;

        try {
            if (currentToken) {
                await logoutRequest(
                    currentToken
                );
            }
        } catch {
            // Clear local authentication even if API logout fails.
        } finally {
            localStorage.removeItem(
                TOKEN_KEY
            );

            setToken(null);
            setUser(null);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider."
        );
    }

    return context;
}