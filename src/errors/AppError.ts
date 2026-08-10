export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(statusCode: number, message: string, isOperational = true) {
        super(message);

        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = this.constructor.name;

        // Restore prototype chain for correct `instanceof` checks across JS targets
        Object.setPrototypeOf(this, new.target.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Custom Helper Error Classes

export class BadRequestError extends AppError {
    constructor(message = "Bad request.") {
        super(400, message);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized access.") {
        super(401, message);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "Access forbidden.") {
        super(403, message);
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found.") {
        super(404, message);
    }
}

export class InternalServerError extends AppError {
    constructor(message = "Internal server error.") {
        super(500, message, false); // Not operational (unexpected server issue)
    }
}