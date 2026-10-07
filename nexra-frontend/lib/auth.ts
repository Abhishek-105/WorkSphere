import { apiFetch } from "./api";
import type { LoginResponse, MeResponse } from "../types/auth";

export async function login(
    email: string,
    password: string
): Promise<LoginResponse> {
    return apiFetch<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify({
            email,
            password,
        }),
    });
}

export async function getCurrentUser(
    token: string
): Promise<MeResponse> {
    return apiFetch<MeResponse>("/user", {
        method: "GET",
        token,
    });
}

export async function logout(
    token: string
): Promise<{ message: string }> {
    return apiFetch<{ message: string }>("/logout", {
        method: "POST",
        token,
    });
}