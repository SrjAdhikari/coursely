//* src/hooks/useEnrollments.ts

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getMyEnrollments, listEnrollments } from "@/api/enrollments.api";
import { MY_ENROLLMENTS_KEY, adminEnrollmentsKey } from "@/lib/queryKeys";

/** The current student's own enrollments (My Courses). */
const useMyEnrollments = (options?: { enabled?: boolean }) =>
	useQuery({
		queryKey: MY_ENROLLMENTS_KEY,
		queryFn: getMyEnrollments,
		enabled: options?.enabled ?? true,
	});

/** Admin enrollments list (paginated). Keeps the current page visible while the
 * next one loads, instead of flashing a full-page loader on every page change. 
 */
const useListEnrollments = (page: number, limit: number) =>
	useQuery({
		queryKey: adminEnrollmentsKey(page, limit),
		queryFn: () => listEnrollments({ page, limit }),
		placeholderData: keepPreviousData,
	});

export { useMyEnrollments, useListEnrollments };
