//* src/api/media.api.ts

import axios from "axios";

import axiosClient from "@/config/axiosClient";
import { VIDEO_MIME } from "@/lib/uploadLimits";

import type { ApiSuccessResponse } from "@/types/api.types";
import type { CoursePayload, LessonPayload } from "@/types/course.types";
import type {
	LessonUploadUrl,
	TrailerUploadUrl,
	PlaybackUrl,
} from "@/types/media.types";

/** Admin: mint a presigned PUT for a lesson video. */
const createLessonUploadUrl = async (lessonId: string) => {
	const { data } = await axiosClient.post<ApiSuccessResponse<LessonUploadUrl>>(
		`/admin/lessons/${lessonId}/upload-url`,
	);
	return data;
};

/** Admin: confirm a lesson video upload — stores the key + duration (int ≥ 1). */
const setLessonVideo = async (args: { id: string; duration: number }) => {
	const { data } = await axiosClient.patch<ApiSuccessResponse<LessonPayload>>(
		`/admin/lessons/${args.id}/video`,
		{ duration: args.duration },
	);
	return data;
};

/** Fetch a fresh signed playback URL for a lesson (gating handled server-side). */
const getLessonPlaybackUrl = async (lessonId: string) => {
	const { data } = await axiosClient.get<ApiSuccessResponse<PlaybackUrl>>(
		`/lessons/${lessonId}/playback-url`,
	);
	return data;
};

/** Admin: mint a presigned PUT for a course trailer. */
const createCourseTrailerUploadUrl = async (courseId: string) => {
	const { data } = await axiosClient.post<ApiSuccessResponse<TrailerUploadUrl>>(
		`/admin/courses/${courseId}/trailer-url`,
	);
	return data;
};

/** Admin: confirm a course trailer upload — stores the key (no body). */
const setCourseTrailer = async (courseId: string) => {
	const { data } = await axiosClient.patch<ApiSuccessResponse<CoursePayload>>(
		`/admin/courses/${courseId}/trailer`,
	);
	return data;
};

/**
 * PUT raw bytes straight to R2's presigned URL. Uses a BARE axios call (NOT the
 * shared axiosClient) so it carries no baseURL, no cookies, no JSON default, and
 * is not touched by the session-eviction interceptor. Content-Type is pinned to
 * match the server's presign or R2 rejects the signature.
 */
const uploadToR2 = async (
	uploadUrl: string,
	file: File,
	options: {
		onProgress?: (percent: number) => void;
		signal?: AbortSignal;
	} = {},
) => {
	await axios.put(uploadUrl, file, {
		headers: { "Content-Type": VIDEO_MIME },
		signal: options.signal,
		onUploadProgress: (event) => {
			if (event.total && options.onProgress) {
				options.onProgress(Math.round((event.loaded / event.total) * 100));
			}
		},
	});
};

export {
	createLessonUploadUrl,
	setLessonVideo,
	getLessonPlaybackUrl,
	createCourseTrailerUploadUrl,
	setCourseTrailer,
	uploadToR2,
};
