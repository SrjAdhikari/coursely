//* src/controllers/learning.controller.ts

import type { RequestHandler } from "express";

import getLearningOverview from "../services/learning.service";
import httpStatus from "../constants/httpStatus";

const { OK } = httpStatus;

const getLearningOverviewHandler: RequestHandler = async (req, res) => {
	const userId = req.user!.id;

	const overview = await getLearningOverview(userId);

	res.status(OK).json({
		success: true,
		message: "Learning overview fetched successfully",
		data: overview,
	});
};

export default getLearningOverviewHandler;
