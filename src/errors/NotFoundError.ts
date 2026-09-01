import { AppError, AppErrorDetails } from "./AppError";

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: AppErrorDetails) {
    super(404, message, details);
  }
}