//* test/hooks/useVideoUpload.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.mock("@/api/media.api", () => ({ uploadToR2: vi.fn() }));

import { uploadToR2 } from "@/api/media.api";
import { useVideoUpload } from "@/hooks/useVideoUpload";

const mp4 = (size = 10) =>
	new File([new Uint8Array(size)], "v.mp4", { type: "video/mp4" });

beforeEach(() => vi.clearAllMocks());

describe("useVideoUpload", () => {
	it("rejects a non-mp4 file before any upload", async () => {
		const onError = vi.fn();
		const mint = vi.fn();
		const { result } = renderHook(() =>
			useVideoUpload({ mint, confirm: vi.fn(), onError }),
		);
		const txt = new File(["x"], "a.txt", { type: "text/plain" });
		await act(async () => result.current.start(txt));
		expect(result.current.status).toBe("error");
		expect(onError).toHaveBeenCalled();
		expect(mint).not.toHaveBeenCalled();
	});

	it("runs mint → PUT → probe → confirm and lands on done", async () => {
		vi.mocked(uploadToR2).mockResolvedValue(undefined);
		const mint = vi.fn().mockResolvedValue({ uploadUrl: "https://r2/put" });
		const confirm = vi.fn().mockResolvedValue({});
		const probeDuration = vi.fn().mockResolvedValue(251.6);
		const onSuccess = vi.fn();

		const { result } = renderHook(() =>
			useVideoUpload({ mint, confirm, probeDuration, onSuccess }),
		);
		await act(async () => result.current.start(mp4()));
		await waitFor(() => expect(result.current.status).toBe("done"));

		expect(mint).toHaveBeenCalled();
		expect(uploadToR2).toHaveBeenCalled();
		expect(confirm).toHaveBeenCalledWith(252); // Math.max(1, round(251.6))
		expect(onSuccess).toHaveBeenCalled();
	});

	it("falls back to manual duration when the probe fails", async () => {
		vi.mocked(uploadToR2).mockResolvedValue(undefined);
		const mint = vi.fn().mockResolvedValue({ uploadUrl: "u" });
		const confirm = vi.fn().mockResolvedValue({});
		const probeDuration = vi.fn().mockRejectedValue(new Error("no metadata"));

		const { result } = renderHook(() =>
			useVideoUpload({ mint, confirm, probeDuration }),
		);
		await act(async () => result.current.start(mp4()));
		await waitFor(() =>
			expect(result.current.status).toBe("awaiting-duration"),
		);
		expect(confirm).not.toHaveBeenCalled();

		await act(async () => result.current.submitManualDuration(90));
		await waitFor(() => expect(result.current.status).toBe("done"));
		expect(confirm).toHaveBeenCalledWith(90);
	});

	it("rejects a non-finite manual duration instead of confirming", async () => {
		vi.mocked(uploadToR2).mockResolvedValue(undefined);
		const mint = vi.fn().mockResolvedValue({ uploadUrl: "u" });
		const confirm = vi.fn().mockResolvedValue({});
		const probeDuration = vi.fn().mockRejectedValue(new Error("no metadata"));
		const onError = vi.fn();

		const { result } = renderHook(() =>
			useVideoUpload({ mint, confirm, probeDuration, onError }),
		);
		await act(async () => result.current.start(mp4()));
		await waitFor(() =>
			expect(result.current.status).toBe("awaiting-duration"),
		);

		await act(async () => result.current.submitManualDuration(NaN));
		expect(result.current.status).toBe("error");
		expect(onError).toHaveBeenCalled();
		expect(confirm).not.toHaveBeenCalled();
	});

	it("confirms without a duration when no probe is configured (trailer)", async () => {
		vi.mocked(uploadToR2).mockResolvedValue(undefined);
		const mint = vi.fn().mockResolvedValue({ uploadUrl: "u" });
		const confirm = vi.fn().mockResolvedValue({});

		const { result } = renderHook(() => useVideoUpload({ mint, confirm }));
		await act(async () => result.current.start(mp4()));
		await waitFor(() => expect(result.current.status).toBe("done"));
		expect(confirm).toHaveBeenCalledWith(undefined);
	});

	it("surfaces an error when the upload fails", async () => {
		vi.mocked(uploadToR2).mockRejectedValue(new Error("network down"));
		const mint = vi.fn().mockResolvedValue({ uploadUrl: "u" });
		const onError = vi.fn();
		const { result } = renderHook(() =>
			useVideoUpload({ mint, confirm: vi.fn(), onError }),
		);
		await act(async () => result.current.start(mp4()));
		await waitFor(() => expect(result.current.status).toBe("error"));
		expect(onError).toHaveBeenCalledWith("network down");
	});

	it("aborts an in-flight upload when the widget unmounts", async () => {
		const abortSpy = vi.spyOn(AbortController.prototype, "abort");
		// A PUT that never resolves keeps the hook in the "uploading" state.
		vi.mocked(uploadToR2).mockImplementation(() => new Promise<void>(() => {}));
		const mint = vi.fn().mockResolvedValue({ uploadUrl: "u" });

		const { result, unmount } = renderHook(() =>
			useVideoUpload({ mint, confirm: vi.fn() }),
		);
		await act(async () => {
			result.current.start(mp4());
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		expect(result.current.status).toBe("uploading");

		unmount();
		expect(abortSpy).toHaveBeenCalled();
		abortSpy.mockRestore();
	});
});
