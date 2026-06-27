//* src/hooks/useStudents.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import { listStudents, getStudent, updateStudent } from "@/api/students.api";
import { STUDENTS_KEY, studentKey } from "@/lib/queryKeys";

/** Fetch all students for the admin table. */
const useListStudents = () =>
	useQuery({ queryKey: STUDENTS_KEY, queryFn: listStudents });

/** Fetch a single student by their ID. */
const useGetStudent = (id: string) =>
	useQuery({
		queryKey: studentKey(id),
		queryFn: () => getStudent(id),
		enabled: !!id,
	});

/** Update a student's role and/or account status. */
const useUpdateStudent = () => useMutation({ mutationFn: updateStudent });

export { useListStudents, useGetStudent, useUpdateStudent };
