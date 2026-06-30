//* test/components/admin/VideoUploadField.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import VideoUploadField from "@/components/admin/VideoUploadField";
import type { useVideoUpload } from "@/hooks/useVideoUpload";

type State = ReturnType<typeof useVideoUpload>;

const baseState = (overrides: Partial<State> = {}): State => ({
	status: "idle",
	isBusy: false,
	progress: 0,
	fileName: "",
	totalBytes: 0,
	error: null,
	start: vi.fn(),
	submitManualDuration: vi.fn(),
	cancel: vi.fn(),
	reset: vi.fn(),
	...overrides,
});

describe("VideoUploadField", () => {
	it("forwards the picked file to start()", async () => {
		const user = userEvent.setup();
		const state = baseState();
		render(<VideoUploadField label="Video" state={state} hasVideo={false} />);
		const file = new File(["x"], "v.mp4", { type: "video/mp4" });
		await user.upload(screen.getByLabelText(/upload video/i), file);
		expect(state.start).toHaveBeenCalledWith(file);
	});

	it("starts an upload when a file is dropped on the dropzone", () => {
		const state = baseState();
		render(<VideoUploadField label="Video" state={state} hasVideo={false} />);
		const file = new File(["x"], "v.mp4", { type: "video/mp4" });
		fireEvent.drop(screen.getByRole("button", { name: /browse/i }), {
			dataTransfer: { files: [file] },
		});
		expect(state.start).toHaveBeenCalledWith(file);
	});

	it("shows progress and cancels while uploading", async () => {
		const user = userEvent.setup();
		const state = baseState({
			status: "uploading",
			progress: 47,
			fileName: "v.mp4",
			totalBytes: 81_000_000,
		});
		render(<VideoUploadField label="Video" state={state} hasVideo={false} />);
		expect(screen.getByText("47%")).toBeInTheDocument();
		expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "47");
		expect(screen.getByText(/uploading to r2/i)).toHaveTextContent(
			"38 MB / 81 MB",
		);
		await user.click(screen.getByRole("button", { name: /cancel/i }));
		expect(state.cancel).toHaveBeenCalled();
	});

	it("submits a manual duration in the fallback state", async () => {
		const user = userEvent.setup();
		const state = baseState({ status: "awaiting-duration" });
		render(<VideoUploadField label="Video" state={state} hasVideo={false} />);
		await user.type(screen.getByLabelText(/duration \(seconds\)/i), "90");
		await user.click(screen.getByRole("button", { name: /save duration/i }));
		expect(state.submitManualDuration).toHaveBeenCalledWith(90);
	});

	it("toggles the preview slot after a successful upload", async () => {
		const user = userEvent.setup();
		const state = baseState({ status: "done", fileName: "v.mp4" });
		render(
			<VideoUploadField
				label="Video"
				state={state}
				hasVideo
				previewSlot={<div data-testid="player">player</div>}
			/>,
		);
		expect(screen.queryByTestId("player")).not.toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /preview/i }));
		expect(screen.getByTestId("player")).toBeInTheDocument();
	});

	it("keeps the existing-video card visible when a replacement upload errors", () => {
		const state = baseState({
			status: "error",
			error: "Upload failed. Please try again.",
		});
		render(
			<VideoUploadField
				label="Video"
				state={state}
				hasVideo
				previewSlot={<div data-testid="player" />}
			/>,
		);
		// The saved video is still represented (Replace stays available)…
		expect(
			screen.getByRole("button", { name: /replace/i }),
		).toBeInTheDocument();
		// …alongside the error, but without the destructive "choose another file".
		expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /choose another file/i }),
		).not.toBeInTheDocument();
	});

	it("labels the card generically instead of showing a stale file name", () => {
		const state = baseState({ status: "idle", fileName: "stale.mp4" });
		render(<VideoUploadField label="Video" state={state} hasVideo />);
		expect(screen.getByText(/video uploaded/i)).toBeInTheDocument();
		expect(screen.queryByText("stale.mp4")).not.toBeInTheDocument();
	});

	it("resets and reopens the picker via Replace", async () => {
		const user = userEvent.setup();
		const clickSpy = vi
			.spyOn(HTMLInputElement.prototype, "click")
			.mockImplementation(() => {});
		const state = baseState({ status: "idle", fileName: "" });
		render(<VideoUploadField label="Video" state={state} hasVideo />);
		await user.click(screen.getByRole("button", { name: /replace/i }));
		expect(state.reset).toHaveBeenCalled();
		// already-uploaded media: Replace must reopen the picker (hasVideo stays true)
		expect(clickSpy).toHaveBeenCalled();
		clickSpy.mockRestore();
	});
});
