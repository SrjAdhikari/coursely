//* src/controllers/enrollment.controller.ts

import type { RequestHandler } from "express";

import {
	listMyEnrollments,
	listAllEnrollments,
} from "../services/enrollment.service";

import httpStatus from "../constants/httpStatus";

const { OK } = httpStatus;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/** Student: the caller's own enrollments (My Courses). */
const getMyEnrollmentsHandler: RequestHandler = async (req, res) => {
	const userId = req.user!.id;
	const enrollments = await listMyEnrollments(userId);

	res.status(OK).json({
		success: true,
		message: "Enrollments fetched successfully",
		data: enrollments,
	});
};

/** Admin: every enrollment, paginated. */
const listEnrollmentsHandler: RequestHandler = async (req, res) => {
	// Floor + bound so a float or huge value can't reach Mongo's skip/limit.
	const requestedPage = Math.floor(Number(req.query.page));
	const requestedLimit = Math.floor(Number(req.query.limit));

	const page = requestedPage > 0 ? requestedPage : DEFAULT_PAGE;
	const limit =
		requestedLimit > 0 ? Math.min(requestedLimit, MAX_LIMIT) : DEFAULT_LIMIT;

	const result = await listAllEnrollments(page, limit);

	res.status(OK).json({
		success: true,
		message: "Enrollments fetched successfully",
		data: result,
	});
};

export { getMyEnrollmentsHandler, listEnrollmentsHandler };
