//* src/hooks/useMedia.ts

import { useQuery } from "@tanstack/react-query";

import { getLessonPlaybackUrl } from "@/api/media.api";
import { lessonPlaybackKey } from "@/lib/queryKeys";

/**
 * Fetch a fresh signed playback URL for a lesson. The signed URL is short-lived
 * (~1h) and meant per-open, so we never cache it (gcTime 0) and always refetch
 * on mount — a stale cached URL would 403 once it expires. Reconnect refetch is
 * off so a network blip can't swap the URL and restart playback mid-watch
 * (window-focus refetch is already disabled globally in the query client).
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

export { useLessonPlaybackUrl };
