import { AppError, AppErrorDetails } from "./AppError";

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: AppErrorDetails) {
    super(403, message, details);
  }
}