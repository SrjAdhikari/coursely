//* src/controllers/section.controller.ts

import type { RequestHandler } from "express";

import {
	createSection,
	updateSection,
	deleteSection,
} from "../services/section.service";

import httpStatus from "../constants/httpStatus";

const { OK, CREATED } = httpStatus;

const createSectionHandler: RequestHandler<{ courseId: string }> = async (
	req,
	res,
) => {
	const { title, order } = req.body;
	const courseId = req.params.courseId;

	const section = await createSection(courseId, { title, order });

	res.status(CREATED).json({
		success: true,
		message: "Section created successfully",
		data: section,
	});
};

const updateSectionHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const { title, order } = req.body;
	const sectionId = req.params.id;

	const section = await updateSection(sectionId, { title, order });

	res.status(OK).json({
		success: true,
		message: "Section updated successfully",
		data: section,
	});
};

const deleteSectionHandler: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	const sectionId = req.params.id;
	await deleteSection(sectionId);

	res.status(OK).json({
		success: true,
		message: "Section deleted successfully",
	});
};

export { createSectionHandler, updateSectionHandler, deleteSectionHandler };
