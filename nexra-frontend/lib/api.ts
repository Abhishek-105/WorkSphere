const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://worksphere-api-qvnl.onrender.com/api";

type ApiOptions = RequestInit & {
    token?: string | null;
};

export async function apiFetch<T>(
    endpoint: string,
    options: ApiOptions = {}
): Promise<T> {
    const { token, headers, ...fetchOptions } = options;

    const isFormData =
        typeof FormData !== "undefined" &&
        fetchOptions.body instanceof FormData;

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...fetchOptions,
            headers: {
                Accept: "application/json",

                ...(isFormData
                    ? {}
                    : {
                        "Content-Type": "application/json",
                    }),

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
        const validationErrors = data?.errors
            ? Object.values(data.errors)
                .flat()
                .join(" ")
            : "";

        throw new Error(
            validationErrors ||
            data?.message ||
            "Something went wrong while communicating with the API."
        );
    }

    return data as T;
}

export { API_URL };