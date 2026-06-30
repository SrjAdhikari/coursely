//* src/lib/videoDuration.ts

/**
 * Read a video's duration (raw seconds) by loading its metadata into a detached
 * <video> element. Resolves with a positive, finite number. Rejects if the
 * browser can't read it — bad/unsupported codec (fires `error`), a NaN/Infinity
 * duration, or a timeout. The caller rounds/clamps before sending to the API.
 */
const METADATA_TIMEOUT_MS = 15_000;

const readVideoDuration = (file: File): Promise<number> =>
	new Promise((resolve, reject) => {
		const objectUrl = URL.createObjectURL(file);
		const video = document.createElement("video");
		video.preload = "metadata";

		const cleanup = () => {
			clearTimeout(timer);
			URL.revokeObjectURL(objectUrl);
			video.removeAttribute("src");
			video.load();
		};

		const timer = setTimeout(() => {
			cleanup();
			reject(new Error("Timed out reading the video length"));
		}, METADATA_TIMEOUT_MS);

		video.onloadedmetadata = () => {
			const seconds = video.duration;
			cleanup();
			if (!Number.isFinite(seconds) || seconds <= 0) {
				reject(new Error("Could not read the video length"));
				return;
			}
			resolve(seconds);
		};

		video.onerror = () => {
			cleanup();
			reject(new Error("Could not read the video file"));
		};

		video.src = objectUrl;
	});

export { readVideoDuration };
