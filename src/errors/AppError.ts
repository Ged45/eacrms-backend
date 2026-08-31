export interface AppErrorDetails {
  /** Machine-readable error code, e.g. "USER_NOT_FOUND", "EMAIL_CONFLICT" */
  code: string;
  /** The entity this error relates to, e.g. "User", "Athlete", "Club" */
  entity?: string;
  /** The field that caused the error, e.g. "email", "registrationNumber" */
  field?: string;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly entity?: string;
  public readonly field?: string;

  constructor(
    public statusCode: number,
    message: string,
    details?: AppErrorDetails
  ) {
    super(message);

    this.name = this.constructor.name;
    this.code = details?.code ?? this.name.toUpperCase();
    this.entity = details?.entity;
    this.field = details?.field;

    Error.captureStackTrace(this, this.constructor);
  }
}