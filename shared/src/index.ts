const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 20;
const MIN_PW_LENGTH = 3;
const MAX_PW_LENGTH = 70;

export const BACKEND_PORT = 3001;

// returns error message or "" if no error
export function verifyUsername(name: string): string {
    if (!(name.length >= MIN_NAME_LENGTH))
        return `Username must be at least ${MIN_NAME_LENGTH} characters long`;
    if (!(name.length <= MAX_NAME_LENGTH))
        return `Username cannot be longer than ${MAX_NAME_LENGTH} characters`;
    if (!/^[a-zA-Z0-9_]+$/.test(name))
        return "Username can only consist of alphanumerical characters (a-Z,0-9) and an underscore (_)";
    // possible username profanity check here
    return "";
}

// returns error message or "" if no error
export function verifyPassword(password: string): string {
    if (!(password.length >= MIN_PW_LENGTH))
        return `Password must be at least ${MIN_PW_LENGTH} characters long`;
    if (!(password.length <= MAX_PW_LENGTH))
        return `Password must be no longer than ${MAX_PW_LENGTH} characters`;
    if (/\s/.test(password)) return `Password cannot include whitespace`;
    // possible strongness or other dumb checks here
    return "";
}

export type LoginRequest = {
    username: string;
    password: string;
};

export type RegisterRequest = {
    username: string;
    password: string;
};

export enum ErrorCode {
    INVALID_USERNAME,
    INVALID_PASSWORD,
    INVALID_PASSWORD_OR_USERNAME,
    USERNAME_TAKEN,
}

export type Response = {
    errCode?: ErrorCode;
    msg?: string;
    token?: string;
    loggedIn?: boolean;
    username?: string;
};
