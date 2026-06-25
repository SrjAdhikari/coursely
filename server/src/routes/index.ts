//* src/routes/index.ts

/**
 * Root router for all application endpoints.
 * @module routes
 */

import { Router } from "express";
import authRouter from "./auth.routes";

const router = Router();

/**
 * Authentication routes
 * @route /api/auth
 */
router.use("/auth", authRouter);

export default router;
