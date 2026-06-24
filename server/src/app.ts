//* src/app.ts

import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import envConfig from "./constants/env";
import httpStatus from "./constants/httpStatus";
import appErrorCode from "./constants/appErrorCode";

import AppError from "./errors/AppError";
import globalErrorHandler from "./middlewares/error.middleware";

const { APP_ORIGIN, COOKIE_SECRET } = envConfig;
const { OK, NOT_FOUND } = httpStatus;
const { ROUTE_NOT_FOUND } = appErrorCode;

const app = express();
const allowedOrigins = [APP_ORIGIN];

// Trust the single proxy hop (Render / Cloudflare) so req.ip / req.protocol
// reflect the real client.
app.set("trust proxy", 1);

/**
 * Express Config Middlewares
 * - Security Headers (Helmet)
 * - CORS
 * - JSON Body Parser
 * - Cookie Parser
 * - Global Rate Limiter
 */
app.use(
	helmet({
		crossOriginResourcePolicy: { policy: "same-site" },
	}),
);

app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	}),
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser(COOKIE_SECRET));

// TODO: Replace this inline limiter with a dedicated tiered rate-limit
// middleware (clientKey by user id → CF-IP → req.ip, AppError-routing 429
// handler, per-route tiers exported as globalLimiter) once auth and the
// Cloudflare context exist.
app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000,
		limit: 300,
		standardHeaders: true,
		legacyHeaders: false,
	}),
);

/**
 * Health Check Endpoint
 * - GET /health
 */
app.get("/health", (_req, res) => {
	res.status(OK).json({ success: true, message: "Healthy 👍" });
});

/**
 * 404 + Global Error Handler
 * - This will catch all undefined routes and pass an AppError to the global error handler
 */
app.use("/{*splat}", (req, _res, next) => {
	next(
		new AppError(
			`Route ${req.method} ${req.originalUrl} not found`,
			NOT_FOUND,
			ROUTE_NOT_FOUND,
		),
	);
});

app.use(globalErrorHandler);

export default app;
