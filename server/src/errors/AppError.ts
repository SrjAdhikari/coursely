//* src/errors/AppError.ts

/**
 * Custom error class for handling operational application errors.
 * @extends Error
 */
class AppError extends Error {
	public readonly statusCode: number;
	public readonly errorCode: string;
	public readonly isOperational: boolean;

	constructor(message: string, statusCode = 500, errorCode = "INTERNAL_ERROR") {
		super(message);

		this.name = this.constructor.name;
		this.statusCode = statusCode;
		this.errorCode = errorCode;
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

export default AppError;
