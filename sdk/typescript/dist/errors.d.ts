/**
 * Base class for all PromptDiff SDK errors.
 */
export declare class PromptDiffError extends Error {
    /** HTTP status code returned by the API, if applicable */
    readonly statusCode?: number;
    constructor(message: string, statusCode?: number);
}
/**
 * Thrown when the API key is missing, invalid, or revoked (HTTP 401).
 */
export declare class AuthenticationError extends PromptDiffError {
    constructor(message?: string);
}
/**
 * Thrown when the account has exhausted its quota or requires an upgrade (HTTP 402).
 */
export declare class QuotaExceededError extends PromptDiffError {
    constructor(message?: string);
}
/**
 * Thrown when the request payload fails API-side validation (HTTP 400 / 422).
 */
export declare class ValidationError extends PromptDiffError {
    constructor(message: string, statusCode?: 400 | 422);
}
/**
 * Thrown for all other non-2xx responses.
 */
export declare class APIError extends PromptDiffError {
    constructor(message: string, statusCode?: number);
}
/** @internal */
export declare function createErrorFromStatus(statusCode: number, message: string): PromptDiffError;
//# sourceMappingURL=errors.d.ts.map