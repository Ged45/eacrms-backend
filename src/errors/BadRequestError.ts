import { AppError, AppErrorDetails } from "./AppError";

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", details?: AppErrorDetails) {
    super(400, message, details);
  }
}