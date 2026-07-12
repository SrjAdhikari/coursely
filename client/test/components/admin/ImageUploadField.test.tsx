//* test/components/admin/ImageUploadField.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ImageUploadField from "@/components/admin/ImageUploadField";
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

describe("ImageUploadField", () => {
	it("forwards the picked file to start()", async () => {
		const user = userEvent.setup();
		const state = baseState();
		render(<ImageUploadField label="Thumbnail" state={state} hasImage={false} />);
		const file = new File(["x"], "c.png", { type: "image/png" });
		await user.upload(screen.getByLabelText(/upload thumbnail/i), file);
		expect(state.start).toHaveBeenCalledWith(file);
	});

	it("renders the dropzone hint when idle with no image", () => {
		render(
			<ImageUploadField label="Thumbnail" state={baseState()} hasImage={false} />,
		);
		expect(screen.getByText(/png, jpeg, or webp/i)).toBeInTheDocument();
	});

	it("starts an upload when a file is dropped on the dropzone", () => {
		const state = baseState();
		render(<ImageUploadField label="Thumbnail" state={state} hasImage={false} />);
		const file = new File(["x"], "c.png", { type: "image/png" });
		fireEvent.drop(screen.getByRole("button", { name: /browse/i }), {
			dataTransfer: { files: [file] },
		});
		expect(state.start).toHaveBeenCalledWith(file);
	});

	it("shows the current thumbnail as an inline preview when one exists", () => {
		render(
			<ImageUploadField
				label="Thumbnail"
				state={baseState()}
				hasImage
				previewUrl="https://img.test/c.png"
			/>,
		);
		const preview = screen.getByRole("img", { name: /thumbnail preview/i });
		expect(preview).toHaveAttribute("src", "https://img.test/c.png");
	});

	it("keeps the saved-image card visible when a replacement upload errors", () => {
		const state = baseState({ status: "error", error: "Upload failed." });
		render(
			<ImageUploadField
				label="Thumbnail"
				state={state}
				hasImage
				previewUrl="https://img.test/c.png"
			/>,
		);
		expect(screen.getByRole("button", { name: /replace/i })).toBeInTheDocument();
		expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /choose another file/i }),
		).not.toBeInTheDocument();
	});
});
