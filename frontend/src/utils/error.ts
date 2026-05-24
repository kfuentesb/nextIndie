import { isAxiosError } from 'axios';

type ErrorPayload = {
    message?: unknown;
};

export function getErrorMessage(error: unknown, fallback: string): string {
    if (isAxiosError(error)) {
        const data = error.response?.data;
        if (typeof data === 'string' && data.trim()) {
            return data;
        }
        if (data && typeof data === 'object' && 'message' in data) {
            const message = (data as ErrorPayload).message;
            if (typeof message === 'string' && message.trim()) {
                return message;
            }
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}
