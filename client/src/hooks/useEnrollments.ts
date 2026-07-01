//* src/hooks/useEnrollments.ts

import { useQuery } from "@tanstack/react-query";
import { getMyEnrollments, listEnrollments } from "@/api/enrollments.api";
import { MY_ENROLLMENTS_KEY, adminEnrollmentsKey } from "@/lib/queryKeys";

/** The current student's own enrollments (My Courses). */
const useMyEnrollments = (options?: { enabled?: boolean }) =>
	useQuery({
		queryKey: MY_ENROLLMENTS_KEY,
		queryFn: getMyEnrollments,
		enabled: options?.enabled ?? true,
	});

/** Admin enrollments list (paginated). */
const useListEnrollments = (page: number, limit: number) =>
	useQuery({
		queryKey: adminEnrollmentsKey(page, limit),
		queryFn: () => listEnrollments({ page, limit }),
	});

export { useMyEnrollments, useListEnrollments };
