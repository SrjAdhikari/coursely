//* src/api/media.api.ts

import axios from "axios";

import axiosClient from "@/config/axiosClient";
import { VIDEO_MIME } from "@/lib/uploadLimits";

import type { ApiSuccessResponse } from "@/types/api.types";
import type { CoursePayload, LessonPayload } from "@/types/course.types";
import type {
	LessonUploadUrl,
	TrailerUploadUrl,
	ThumbnailUploadUrl,
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

/** Fetch a fresh signed URL for a published course's promo trailer. */
const getCourseTrailerUrl = async (slug: string) => {
	const { data } = await axiosClient.get<ApiSuccessResponse<PlaybackUrl>>(
		`/courses/${slug}/trailer-url`,
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

/** Admin: mint a presigned PUT for a course thumbnail image (pins the content type). */
const createCourseThumbnailUploadUrl = async (
	courseId: string,
	contentType: string,
) => {
	const { data } = await axiosClient.post<
		ApiSuccessResponse<ThumbnailUploadUrl>
	>(`/admin/courses/${courseId}/thumbnail-url`, { contentType });
	return data;
};

/** Admin: confirm a course thumbnail upload — stores the key (no body). */
const setCourseThumbnail = async (courseId: string) => {
	const { data } = await axiosClient.patch<ApiSuccessResponse<CoursePayload>>(
		`/admin/courses/${courseId}/thumbnail`,
	);
	return data;
};

// Raw PUT to R2's presigned URL via bare axios (no baseURL/cookies/interceptor).
// Content-Type must match the presign or R2 rejects the signature.
const uploadToR2 = async (
	uploadUrl: string,
	file: File,
	options: {
		contentType?: string;
		onProgress?: (percent: number) => void;
		signal?: AbortSignal;
	} = {},
) => {
	await axios.put(uploadUrl, file, {
		headers: { "Content-Type": options.contentType ?? VIDEO_MIME },
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
	getCourseTrailerUrl,
	createCourseTrailerUploadUrl,
	setCourseTrailer,
	createCourseThumbnailUploadUrl,
	setCourseThumbnail,
	uploadToR2,
};
