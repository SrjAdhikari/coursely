//* src/types/media.types.ts

/** Response of the lesson upload-URL mint. */
export interface LessonUploadUrl {
	uploadUrl: string;
	videoKey: string;
}

/** Response of the course-trailer upload-URL mint. */
export interface TrailerUploadUrl {
	uploadUrl: string;
	trailerKey: string;
}

/** Response of the course-thumbnail upload-URL mint. */
export interface ThumbnailUploadUrl {
	uploadUrl: string;
	thumbnailKey: string;
}

/** Response of a playback-URL mint. */
export interface PlaybackUrl {
	url: string;
}
