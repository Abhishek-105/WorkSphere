export type User = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    designation: string | null;
    profile_photo: string | null;
    role: "manager" | "employee";
    status: string;
};

export type LoginResponse = {
    message: string;
    token: string;
    token_type: "Bearer";
    user: User;
};

export type MeResponse = {
    user: User;
};