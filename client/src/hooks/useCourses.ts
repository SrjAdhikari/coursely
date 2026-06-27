//* src/hooks/useCourses.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

/** Create a course, then refresh the list. */
const useCreateCourse = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createCourse,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: COURSES_KEY }),
	});
};

/** Update a course, then refresh the list and that course's detail. */
const useUpdateCourse = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateCourse,
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({ queryKey: COURSES_KEY });
			queryClient.invalidateQueries({ queryKey: courseKey(vars.id) });
		},
	});
};

/** Delete a course, then refresh the list. */
const useDeleteCourse = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteCourse,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: COURSES_KEY }),
	});
};

export {
	useListCourses,
	useGetCourse,
	useCreateCourse,
	useUpdateCourse,
	useDeleteCourse,
};
