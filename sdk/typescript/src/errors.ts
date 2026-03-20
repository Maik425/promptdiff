/**
 * Base class for all PromptDiff SDK errors.
 */
export class PromptDiffError extends Error {
  /** HTTP status code returned by the API, if applicable */
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'PromptDiffError';
    if (statusCode !== undefined) {
      this.statusCode = statusCode;
    }

    // Maintain a proper prototype chain when targeting ES5/CommonJS
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the API key is missing, invalid, or revoked (HTTP 401).
 */
export class AuthenticationError extends PromptDiffError {
  constructor(message = 'Invalid or missing API key') {
    super(message, 401);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the account has exhausted its quota or requires an upgrade (HTTP 402).
 */
export class QuotaExceededError extends PromptDiffError {
  constructor(message = 'Quota exceeded — upgrade your plan to continue') {
    super(message, 402);
    this.name = 'QuotaExceededError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the request payload fails API-side validation (HTTP 400 / 422).
 */
export class ValidationError extends PromptDiffError {
  constructor(message: string, statusCode: 400 | 422 = 422) {
    super(message, statusCode);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown for all other non-2xx responses.
 */
export class APIError extends PromptDiffError {
  constructor(message: string, statusCode?: number) {
    super(message, statusCode);
    this.name = 'APIError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

/** @internal */
export function createErrorFromStatus(
  statusCode: number,
  message: string,
): PromptDiffError {
  switch (statusCode) {
    case 401:
      return new AuthenticationError(message);
    case 402:
      return new QuotaExceededError(message);
    case 400:
      return new ValidationError(message, 400);
    case 422:
      return new ValidationError(message, 422);
    default:
      return new APIError(message, statusCode);
  }
}
