/**
 * API Error class for structured error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}
