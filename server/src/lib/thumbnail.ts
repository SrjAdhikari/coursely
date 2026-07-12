//* src/lib/thumbnail.ts

import { presignGet, THUMBNAIL_URL_TTL_SECONDS } from "./r2";

/** Minimal course fields needed to resolve a viewable thumbnail. */
interface ThumbnailSource {
	thumbnailKey?: string;
	thumbnailUrl?: string;
}

/**
 * Resolve a viewable thumbnail URL: an uploaded thumbnail (private storage object)
 * is signed into a long-TTL GET; otherwise the stored external URL is returned
 * as-is. The raw thumbnailKey must never reach the client.
 */
const resolveThumbnailUrl = (course: ThumbnailSource) =>
	course.thumbnailKey
		? presignGet(course.thumbnailKey, THUMBNAIL_URL_TTL_SECONDS)
		: Promise.resolve(course.thumbnailUrl);

export default resolveThumbnailUrl;
export type { ThumbnailSource };
