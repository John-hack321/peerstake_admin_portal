// ─── A typed error we can throw and catch meaningfully ───────────────────────
//
// Instead of every API function returning `null` on failure (losing all info
// about what went wrong), we throw this. The component that calls the API
// can then catch it and know the exact status code + a human-readable message.

export class ApiError extends Error {
    constructor(
    public statusCode: number,
    message: string
    ) {
    super(message)
    this.name = "ApiError"
    }
}