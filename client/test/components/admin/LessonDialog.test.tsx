//* test/components/admin/LessonDialog.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ComponentProps } from "react";

const mockCreate = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/hooks/useCurriculum", () => ({
	useCreateLesson: () => ({ mutate: mockCreate, isPending: false }),
	useUpdateLesson: () => ({ mutate: mockUpdate, isPending: false }),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/hooks/useVideoUpload", () => ({
	useVideoUpload: () => ({
		status: "idle",
		progress: 0,
		fileName: "",
		error: null,
		start: vi.fn(),
		submitManualDuration: vi.fn(),
		cancel: vi.fn(),
		reset: vi.fn(),
	}),
}));
vi.mock("@/components/media/VideoPlayer", () => ({
	default: () => <div data-testid="player" />,
}));

import { toast } from "sonner";
import LessonDialog from "@/components/admin/LessonDialog";

const existingLesson = {
	_id: "l1",
	sectionId: "s1",
	courseId: "c1",
	title: "Welcome",
	order: 0,
	isPreview: true,
	duration: 252,
};

const renderDialog = (
	props: Partial<ComponentProps<typeof LessonDialog>> = {},
	client = new QueryClient(),
) =>
	render(
		<QueryClientProvider client={client}>
			<LessonDialog courseId="c1" sectionId="s1" onClose={vi.fn()} {...props} />
		</QueryClientProvider>,
	);

describe("LessonDialog", () => {
	beforeEach(() => vi.resetAllMocks());

	it("creates a lesson under its section", async () => {
		const user = userEvent.setup();
		renderDialog();
		await user.type(
			screen.getByLabelText(/lesson title/i),
			"Your first component",
		);
		await user.click(screen.getByRole("button", { name: /^add lesson$/i }));
		await waitFor(() =>
			expect(mockCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					sectionId: "s1",
					payload: expect.objectContaining({ title: "Your first component" }),
				}),
				expect.any(Object),
			),
		);
	});

	it("prefills and updates in edit mode, preserving order and preview", async () => {
		const user = userEvent.setup();
		renderDialog({ lesson: existingLesson });
		expect(screen.getByLabelText(/lesson title/i)).toHaveValue("Welcome");
		const save = screen.getByRole("button", { name: /save changes/i });
		await waitFor(() => expect(save).toBeEnabled());
		await user.click(save);
		expect(mockUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				id: "l1",
				payload: expect.objectContaining({
					title: "Welcome",
					order: 0,
					isPreview: true,
				}),
			}),
			expect.any(Object),
		);
		const payload = mockUpdate.mock.calls[0][0].payload;
		expect(payload).not.toHaveProperty("duration");
	});

	it("invalidates the course detail and toasts on success", async () => {
		const user = userEvent.setup();
		const client = new QueryClient();
		const invalidate = vi.spyOn(client, "invalidateQueries");
		mockCreate.mockImplementation((_args, { onSuccess }) => onSuccess());
		renderDialog({}, client);
		await user.type(screen.getByLabelText(/lesson title/i), "Intro");
		await user.click(screen.getByRole("button", { name: /^add lesson$/i }));
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["courses", "c1"] });
		expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Lesson added");
	});

	it("toasts the server error and stays open when the save fails", async () => {
		const user = userEvent.setup();
		mockCreate.mockImplementation((_args, { onError }) =>
			onError(new Error("Lesson title already exists")),
		);
		renderDialog();
		await user.type(screen.getByLabelText(/lesson title/i), "Intro");
		await user.click(screen.getByRole("button", { name: /^add lesson$/i }));
		expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
			"Lesson title already exists",
		);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("shows the video upload field in edit mode", () => {
		renderDialog({ lesson: existingLesson });
		expect(screen.getByLabelText(/upload video/i)).toBeInTheDocument();
	});

	it("does not show the upload field when creating", () => {
		renderDialog();
		expect(screen.queryByLabelText(/upload video/i)).not.toBeInTheDocument();
	});
});
