//* src/hooks/useVideoUpload.ts

import { useCallback, useEffect, useRef, useState } from "react";

import { uploadToR2 } from "@/api/media.api";
import { VIDEO_MIME, MAX_VIDEO_BYTES, MAX_VIDEO_LABEL } from "@/lib/uploadLimits";

type UploadStatus =
	| "idle"
	| "uploading"
	| "awaiting-duration"
	| "confirming"
	| "done"
	| "error";

interface UseVideoUploadConfig {
	/** Mint the presigned PUT (resolves the absolute R2 upload URL). */
	mint: () => Promise<{ uploadUrl: string }>;
	/** Persist the upload. `duration` is set only when a probe is configured. */
	confirm: (duration?: number) => Promise<unknown>;
	/** Read the video length; when present, drives auto-detect + manual fallback. */
	probeDuration?: (file: File) => Promise<number>;
	onSuccess?: () => void;
	onError?: (message: string) => void;
}

const messageOf = (error: unknown, fallback: string) =>
	(error as { message?: string })?.message ?? fallback;

const validate = (file: File): string | null => {
	if (file.type !== VIDEO_MIME) return "Please choose an MP4 video.";
	if (file.size > MAX_VIDEO_BYTES)
		return `That file is larger than ${MAX_VIDEO_LABEL}.`;
	return null;
};

const useVideoUpload = ({
	mint,
	confirm,
	probeDuration,
	onSuccess,
	onError,
}: UseVideoUploadConfig) => {
	const [status, setStatus] = useState<UploadStatus>("idle");
	const [error, setError] = useState<string | null>(null);
	
	const [progress, setProgress] = useState(0);
	const [fileName, setFileName] = useState("");

	const abortRef = useRef<AbortController | null>(null);

	// Abort any in-flight upload if the widget unmounts (e.g. the dialog closes).
	useEffect(() => () => abortRef.current?.abort(), []);

	const fail = useCallback(
		(message: string) => {
			setStatus("error");
			setError(message);
			onError?.(message);
		},
		[onError],
	);

	const finish = useCallback(
		async (duration?: number) => {
			setStatus("confirming");
			try {
				await confirm(duration);
			} catch (err) {
				fail(messageOf(err, "Couldn't save the upload."));
				return;
			}
			// Run onSuccess outside the try so a throwing call-site handler can't
			// mislabel a successful upload as an error.
			setStatus("done");
			setProgress(0);
			onSuccess?.();
		},
		[confirm, onSuccess, fail],
	);

	const start = useCallback(
		async (file: File) => {
			const invalid = validate(file);
			if (invalid) {
				fail(invalid);
				return;
			}

			setError(null);
			setFileName(file.name);
			setProgress(0);
			setStatus("uploading");

			const controller = new AbortController();
			abortRef.current = controller;

			try {
				const { uploadUrl } = await mint();
				await uploadToR2(uploadUrl, file, {
					onProgress: setProgress,
					signal: controller.signal,
				});

				if (probeDuration) {
					try {
						const seconds = await probeDuration(file);
						await finish(Math.max(1, Math.round(seconds)));
					} catch {
						// Bytes are already in R2 — keep them and ask for the length.
						setStatus("awaiting-duration");
					}
				} else {
					await finish();
				}
			} catch (err) {
				if (controller.signal.aborted) {
					setStatus("idle");
					setProgress(0);
					return;
				}
				fail(messageOf(err, "Upload failed. Please try again."));
			}
		},
		[mint, probeDuration, finish, fail],
	);

	const submitManualDuration = useCallback(
		(seconds: number) => finish(Math.max(1, Math.round(seconds))),
		[finish],
	);

	const cancel = useCallback(() => abortRef.current?.abort(), []);

	const reset = useCallback(() => {
		setStatus("idle");
		setProgress(0);
		setError(null);
		setFileName("");
	}, []);

	return {
		status,
		progress,
		fileName,
		error,
		start,
		submitManualDuration,
		cancel,
		reset,
	};
};

export { useVideoUpload };
export type { UseVideoUploadConfig, UploadStatus };
