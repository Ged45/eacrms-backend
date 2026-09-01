import { AppError, AppErrorDetails } from "./AppError";

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: AppErrorDetails) {
    super(401, message, details);
  }
}