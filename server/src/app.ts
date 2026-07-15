//* src/app.ts

import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import envConfig from "./constants/env";
import httpStatus from "./constants/httpStatus";
import appErrorCode from "./constants/appErrorCode";

import AppError from "./errors/AppError";
import globalErrorHandler from "./middlewares/error.middleware";
import { globalLimiter, webhookLimiter } from "./middlewares/rateLimit.middleware";
import verifyRequestOrigin from "./middlewares/csrf.middleware";

import routes from "./routes/index";
import { stripeWebhookRouter } from "./routes/payment.routes";

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

// Stripe webhook needs the UNPARSED body for signature verification, so it is
// mounted with a raw parser ABOVE express.json() (which would otherwise consume
// the stream). It is server-to-server, authenticated by signature — no session.
app.use(
	"/api/webhooks/stripe",
	webhookLimiter,
	express.raw({ type: "application/json" }),
	stripeWebhookRouter,
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser(COOKIE_SECRET));
app.use(globalLimiter);

/**
 * Health Check Endpoint
 * - GET /health
 */
app.get("/health", (_req, res) => {
	res.status(OK).json({ success: true, message: "Healthy 👍" });
});

/**
 * API Routes
 * - All routes are prefixed with /api
 * - verifyRequestOrigin guards cookie-authed mutations against CSRF attacks.
 */
app.use("/api", verifyRequestOrigin, routes);

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
