//* src/hooks/useCourseThumbnailUpload.ts

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useVideoUpload, type UploadConstraints } from "@/hooks/useVideoUpload";
import { courseKey } from "@/lib/queryKeys";
import {
	IMAGE_MIME_TYPES,
	MAX_IMAGE_BYTES,
	MAX_IMAGE_LABEL,
} from "@/lib/uploadLimits";
import {
	createCourseThumbnailUploadUrl,
	setCourseThumbnail,
} from "@/api/media.api";

// Hoisted so the uploader's `start` callback keeps a stable identity across renders.
const IMAGE_CONSTRAINTS: UploadConstraints = {
	allowedTypes: IMAGE_MIME_TYPES,
	maxBytes: MAX_IMAGE_BYTES,
	typeErrorMessage: "Please choose a PNG, JPEG, or WebP image.",
	sizeErrorMessage: `That image is larger than ${MAX_IMAGE_LABEL}.`,
};

/** Course-scoped thumbnail upload — wires the shared uploader to the thumbnail endpoints. */
const useCourseThumbnailUpload = (courseId: string) => {
	const queryClient = useQueryClient();

	const thumbnailUpload = useVideoUpload({
		accept: IMAGE_CONSTRAINTS,
		mint: (contentType) =>
			createCourseThumbnailUploadUrl(courseId, contentType).then(
				(res) => res.data,
			),
		confirm: () => setCourseThumbnail(courseId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: courseKey(courseId) });
			toast.success("Thumbnail uploaded");
		},
		onError: (message) => toast.error(message),
	});

	return thumbnailUpload;
};

export default useCourseThumbnailUpload;
