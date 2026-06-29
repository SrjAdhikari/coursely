//* src/lib/r2.ts

import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import envConfig from "../constants/env";

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } =
	envConfig;

// R2 is S3-compatible: the AWS SDK is pointed at the R2 endpoint with R2 creds.
// region "auto" is R2's required placeholder; no AWS account is involved.
const r2Client = new S3Client({
	region: "auto",
	endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID,
		secretAccessKey: R2_SECRET_ACCESS_KEY,
	},
});

// Short PUT window (admin upload); ~1h GET window (per-request playback).
const UPLOAD_URL_TTL_SECONDS = 5 * 60;
const PLAYBACK_URL_TTL_SECONDS = 60 * 60;

/** Canonical, deterministic object keys — derived server-side, never client-supplied. */
const lessonVideoKey = (lessonId: string) => `lessons/${lessonId}/source.mp4`;
const courseTrailerKey = (courseId: string) =>
	`courses/${courseId}/trailer.mp4`;

/** Mint a presigned PUT for a video object (pins Content-Type; short TTL). */
const presignPut = (key: string, contentType = "video/mp4") =>
	getSignedUrl(
		r2Client,
		new PutObjectCommand({
			Bucket: R2_BUCKET,
			Key: key,
			ContentType: contentType,
		}),
		{ expiresIn: UPLOAD_URL_TTL_SECONDS },
	);

/** Mint a presigned GET for a video object (~1h TTL). */
const presignGet = (key: string) =>
	getSignedUrl(
		r2Client,
		new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }),
		{ expiresIn: PLAYBACK_URL_TTL_SECONDS },
	);

export {
	r2Client,
	lessonVideoKey,
	courseTrailerKey,
	presignPut,
	presignGet,
	UPLOAD_URL_TTL_SECONDS,
	PLAYBACK_URL_TTL_SECONDS,
};
