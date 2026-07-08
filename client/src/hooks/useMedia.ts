//* src/hooks/useMedia.ts

import { useQuery } from "@tanstack/react-query";

import { getLessonPlaybackUrl, getCourseTrailerUrl } from "@/api/media.api";
import { lessonPlaybackKey, courseTrailerKey } from "@/lib/queryKeys";

/** Fresh signed playback URL, minted per mount
 * and never cached (URLs are short-lived, ~1h).
 */
const useLessonPlaybackUrl = (lessonId: string) =>
	useQuery({
		queryKey: lessonPlaybackKey(lessonId),
		queryFn: () => getLessonPlaybackUrl(lessonId),
		enabled: !!lessonId,
		gcTime: 0,
		staleTime: 0,
		refetchOnMount: "always",
		refetchOnReconnect: false,
	});

/** Fresh signed trailer URL, gated by `enabled` so
 * it stays idle until the visitor opens the trailer.
 */
const useCourseTrailerUrl = (slug: string, enabled: boolean) =>
	useQuery({
		queryKey: courseTrailerKey(slug),
		queryFn: () => getCourseTrailerUrl(slug),
		enabled: enabled && !!slug,
		gcTime: 0,
		staleTime: 0,
		refetchOnMount: "always",
		refetchOnReconnect: false,
	});

export { useLessonPlaybackUrl, useCourseTrailerUrl };
