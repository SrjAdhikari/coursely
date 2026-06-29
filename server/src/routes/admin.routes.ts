//* src/routes/admin.routes.ts

/**
 * Admin Routes — applies the admin gate, then composes the per-resource admin routers.
 * @module routes/admin
 */

import { Router } from "express";

import authenticate from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/authorize.middleware";

import adminCourseRouter from "./course.routes";
import adminSectionRouter from "./section.routes";
import adminLessonRouter from "./lesson.routes";
import adminStudentRouter from "./student.routes";

const adminRouter = Router();

// Gate every admin route: valid session + admin role.
adminRouter.use(authenticate, requireAdmin);

adminRouter.use(adminCourseRouter);
adminRouter.use(adminSectionRouter);
adminRouter.use(adminLessonRouter);
adminRouter.use(adminStudentRouter);

export default adminRouter;
