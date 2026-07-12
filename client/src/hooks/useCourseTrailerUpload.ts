//* src/hooks/useCourseTrailerUpload.ts

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useVideoUpload } from "@/hooks/useVideoUpload";
import { courseKey } from "@/lib/queryKeys";
import {
	createCourseTrailerUploadUrl,
	setCourseTrailer,
} from "@/api/media.api";

/** Course-scoped trailer upload — wires the shared uploader to the trailer endpoints. */
const useCourseTrailerUpload = (courseId: string) => {
	const queryClient = useQueryClient();

	const trailerUpload = useVideoUpload({
		mint: () => createCourseTrailerUploadUrl(courseId).then((res) => res.data),
		confirm: () => setCourseTrailer(courseId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: courseKey(courseId) });
			toast.success("Trailer uploaded");
		},
		onError: (message) => toast.error(message),
	});

	return trailerUpload;
};

export default useCourseTrailerUpload;
