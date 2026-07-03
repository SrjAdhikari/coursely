//* src/routes/learning.routes.ts

/**
 * Learning Routes — the learner's aggregated overview (stats + course progress + recent).
 * @module routes/learning
 */

import { Router } from "express";
import getLearningOverviewHandler from "../controllers/learning.controller";
import authenticate from "../middlewares/auth.middleware";

/** Authenticated learner overview router — mounted at /api/learning */
const learningRouter = Router();

/**
 * The caller's own learning overview
 * @route GET /api/learning/overview
 */
learningRouter.get("/overview", authenticate, getLearningOverviewHandler);

export default learningRouter;
