//* src/hooks/useCourses.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	listCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
} from "@/api/courses.api";
import { COURSES_KEY, courseKey } from "@/lib/queryKeys";

/** All courses (drafts + published) for the admin table. */
const useListCourses = () =>
	useQuery({ queryKey: COURSES_KEY, queryFn: listCourses });

/** One course with its full nested curriculum. */
const useGetCourse = (id: string) =>
	useQuery({
		queryKey: courseKey(id),
		queryFn: () => getCourse(id),
		enabled: !!id,
	});

/** Create a course. */
const useCreateCourse = () => useMutation({ mutationFn: createCourse });

/** Update a course. */
const useUpdateCourse = () => useMutation({ mutationFn: updateCourse });

/** Delete a course. */
const useDeleteCourse = () => useMutation({ mutationFn: deleteCourse });

export {
	useListCourses,
	useGetCourse,
	useCreateCourse,
	useUpdateCourse,
	useDeleteCourse,
};
