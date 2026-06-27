//* src/hooks/useCurriculum.ts

import { useMutation } from "@tanstack/react-query";
import {
	createSection,
	updateSection,
	deleteSection,
} from "@/api/sections.api";
import { createLesson, updateLesson, deleteLesson } from "@/api/lessons.api";

/** Create a section under a course. */
const useCreateSection = () => useMutation({ mutationFn: createSection });

/** Update a section. */
const useUpdateSection = () => useMutation({ mutationFn: updateSection });

/** Delete a section (cascades its lessons server-side). */
const useDeleteSection = () => useMutation({ mutationFn: deleteSection });

/** Create a lesson under a section. */
const useCreateLesson = () => useMutation({ mutationFn: createLesson });

/** Update a lesson. */
const useUpdateLesson = () => useMutation({ mutationFn: updateLesson });

/** Delete a lesson. */
const useDeleteLesson = () => useMutation({ mutationFn: deleteLesson });

export {
	useCreateSection,
	useUpdateSection,
	useDeleteSection,
	useCreateLesson,
	useUpdateLesson,
	useDeleteLesson,
};
