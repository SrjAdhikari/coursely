//* src/middlewares/authorize.middleware.ts

import type { RequestHandler } from "express";

import type { UserRole } from "../models/user.model";

import AppError from "../errors/AppError";

import httpStatus from "../constants/httpStatus";
import appErrorCode from "../constants/appErrorCode";

const { UNAUTHORIZED, FORBIDDEN } = httpStatus;
const { UNAUTHORIZED_ACCESS, INSUFFICIENT_ROLE } = appErrorCode;

/** Gate a route on the authenticated user's role. Runs after `authenticate`. */
const authorize =
	(...roles: UserRole[]): RequestHandler =>
	(req, _res, next) => {
		if (!req.user) {
			throw new AppError(
				"Authentication required",
				UNAUTHORIZED,
				UNAUTHORIZED_ACCESS,
			);
		}

		if (!roles.includes(req.user.role)) {
			throw new AppError(
				"You do not have permission to perform this action",
				FORBIDDEN,
				INSUFFICIENT_ROLE,
			);
		}

		next();
	};

const requireAdmin = authorize("admin");

export { authorize, requireAdmin };
