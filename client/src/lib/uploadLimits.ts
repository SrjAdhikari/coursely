//* src/lib/uploadLimits.ts

/** The only video MIME we accept — matches the server's pinned R2 presign. */
export const VIDEO_MIME = "video/mp4";

/** Client-side upload cap in bytes (decimal 1 GB = 1000³; tunable). */
export const MAX_VIDEO_BYTES = 1000 * 1000 * 1000;

/** Human-readable cap for messages, kept in sync with MAX_VIDEO_BYTES. */
export const MAX_VIDEO_LABEL = "1 GB";

/** Raster image formats accepted for a course thumbnail — matches the server's presign. */
export const IMAGE_MIME_TYPES = [
	"image/png",
	"image/jpeg",
	"image/webp",
] as const;

/** Client-side thumbnail cap in bytes (decimal 5 MB = 5 × 1000²; tunable). */
export const MAX_IMAGE_BYTES = 5 * 1000 * 1000;

/** Human-readable cap for messages, kept in sync with MAX_IMAGE_BYTES. */
export const MAX_IMAGE_LABEL = "5 MB";
