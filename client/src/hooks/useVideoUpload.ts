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

/** File constraints the uploader enforces before minting — injectable so the same
 * state machine serves videos (default) and images (thumbnails). */
interface UploadConstraints {
	allowedTypes: readonly string[];
	maxBytes: number;
	typeErrorMessage: string;
	sizeErrorMessage: string;
}

// Default constraints keep every existing video/trailer caller unchanged.
const VIDEO_CONSTRAINTS: UploadConstraints = {
	allowedTypes: [VIDEO_MIME],
	maxBytes: MAX_VIDEO_BYTES,
	typeErrorMessage: "Please choose an MP4 video.",
	sizeErrorMessage: `That file is larger than ${MAX_VIDEO_LABEL}.`,
};

interface UseVideoUploadConfig {
	mint: (contentType: string) => Promise<{ uploadUrl: string }>;
	confirm: (duration?: number) => Promise<unknown>;
	probeDuration?: (file: File) => Promise<number>;
	accept?: UploadConstraints;
	onSuccess?: () => void;
	onError?: (message: string) => void;
}

const messageOf = (error: unknown, fallback: string) =>
	(error as { message?: string })?.message ?? fallback;

const validate = (file: File, constraints: UploadConstraints): string | null => {
	if (!constraints.allowedTypes.includes(file.type))
		return constraints.typeErrorMessage;
	if (file.size > constraints.maxBytes) return constraints.sizeErrorMessage;
	return null;
};

const useVideoUpload = ({
	mint,
	confirm,
	probeDuration,
	accept = VIDEO_CONSTRAINTS,
	onSuccess,
	onError,
}: UseVideoUploadConfig) => {
	const [status, setStatus] = useState<UploadStatus>("idle");
	const [error, setError] = useState<string | null>(null);

	const [progress, setProgress] = useState(0);
	const [fileName, setFileName] = useState("");
	const [totalBytes, setTotalBytes] = useState(0);

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

	// Back to a clean idle; also clears the file name so a cancelled upload never
	// lingers as the "uploaded" label.
	const resetToIdle = useCallback(() => {
		setStatus("idle");
		setProgress(0);
		setFileName("");
	}, []);

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
			const invalid = validate(file, accept);
			if (invalid) {
				fail(invalid);
				return;
			}

			setError(null);
			setFileName(file.name);
			setTotalBytes(file.size);
			setProgress(0);
			setStatus("uploading");

			const controller = new AbortController();
			abortRef.current = controller;

			// Only the PUT honors the signal; the probe and confirm steps don't —
			// so re-check after each await and stop before persisting a cancelled
			// upload (cancel() has already reset the UI to idle).
			const cancelled = () => controller.signal.aborted;

			try {
				const { uploadUrl } = await mint(file.type);
				await uploadToR2(uploadUrl, file, {
					contentType: file.type,
					onProgress: setProgress,
					signal: controller.signal,
				});

				if (cancelled()) return;

				if (probeDuration) {
					try {
						const seconds = await probeDuration(file);
						if (cancelled()) return;
						await finish(Math.max(1, Math.round(seconds)));
					} catch {
						if (cancelled()) return;
						// Bytes are already in R2 — keep them and ask for the length.
						setStatus("awaiting-duration");
					}
				} else {
					if (cancelled()) return;
					await finish();
				}
			} catch (err) {
				if (cancelled()) return;
				fail(messageOf(err, "Upload failed. Please try again."));
			}
		},
		[mint, probeDuration, accept, finish, fail],
	);

	const submitManualDuration = useCallback(
		(seconds: number) => {
			if (!Number.isFinite(seconds) || seconds <= 0) {
				fail("Enter a valid duration in seconds.");
				return;
			}
			return finish(Math.max(1, Math.round(seconds)));
		},
		[finish, fail],
	);

	// Abort the in-flight request and snap back to idle immediately.
	const cancel = useCallback(() => {
		abortRef.current?.abort();
		resetToIdle();
	}, [resetToIdle]);

	const reset = useCallback(() => {
		setStatus("idle");
		setProgress(0);
		setError(null);
		setFileName("");
		setTotalBytes(0);
	}, []);

	const isBusy =
		status === "uploading" ||
		status === "confirming" ||
		status === "awaiting-duration";

	return {
		status,
		isBusy,
		progress,
		fileName,
		totalBytes,
		error,
		start,
		submitManualDuration,
		cancel,
		reset,
	};
};

export { useVideoUpload };
export type { UseVideoUploadConfig, UploadStatus, UploadConstraints };
