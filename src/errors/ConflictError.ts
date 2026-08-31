import { AppError, AppErrorDetails } from "./AppError";

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: AppErrorDetails) {
    super(409, message, details);
  }
}