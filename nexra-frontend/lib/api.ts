const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost/nexra/public/api";

type ApiOptions = RequestInit & {
    token?: string | null;
};

export async function apiFetch<T>(
    endpoint: string,
    options: ApiOptions = {}
): Promise<T> {
    const { token, headers, ...fetchOptions } = options;

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...fetchOptions,
            headers: {
                Accept: "application/json",
                ...(fetchOptions.body &&
                    !(fetchOptions.body instanceof FormData)
                    ? {
                        "Content-Type": "application/json",
                    }
                    : {}),
                ...(token
                    ? {
                        Authorization: `Bearer ${token}`,
                    }
                    : {}),
                ...headers,
            },
        }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.message ||
            "Something went wrong while communicating with the API."
        );
    }

    return data as T;
}

export { API_URL };