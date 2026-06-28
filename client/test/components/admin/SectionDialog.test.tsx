//* test/components/admin/SectionDialog.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ComponentProps } from "react";

const mockCreate = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/hooks/useCurriculum", () => ({
	useCreateSection: () => ({ mutate: mockCreate, isPending: false }),
	useUpdateSection: () => ({ mutate: mockUpdate, isPending: false }),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";
import SectionDialog from "@/components/admin/SectionDialog";

const existingSection = {
	_id: "s1",
	courseId: "c1",
	title: "Intro",
	order: 0,
	lessons: [],
};

const renderDialog = (
	props: Partial<ComponentProps<typeof SectionDialog>> = {},
	client = new QueryClient(),
) =>
	render(
		<QueryClientProvider client={client}>
			<SectionDialog courseId="c1" onClose={vi.fn()} {...props} />
		</QueryClientProvider>,
	);

describe("SectionDialog", () => {
	beforeEach(() => vi.resetAllMocks());

	it("creates a section from the form", async () => {
		const user = userEvent.setup();
		renderDialog();
		await user.type(screen.getByLabelText(/section title/i), "State & Hooks");
		await user.click(screen.getByRole("button", { name: /^add section$/i }));
		await waitFor(() =>
			expect(mockCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					courseId: "c1",
					payload: expect.objectContaining({ title: "State & Hooks" }),
				}),
				expect.any(Object),
			),
		);
	});

	it("prefills and updates in edit mode, preserving order 0", async () => {
		const user = userEvent.setup();
		renderDialog({ section: existingSection });
		expect(screen.getByLabelText(/section title/i)).toHaveValue("Intro");
		const save = screen.getByRole("button", { name: /save changes/i });
		await waitFor(() => expect(save).toBeEnabled());
		await user.click(save);
		expect(mockUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				id: "s1",
				payload: expect.objectContaining({ title: "Intro", order: 0 }),
			}),
			expect.any(Object),
		);
	});

	it("invalidates the course detail and toasts on success", async () => {
		const user = userEvent.setup();
		const client = new QueryClient();
		const invalidate = vi.spyOn(client, "invalidateQueries");
		mockCreate.mockImplementation((_args, { onSuccess }) => onSuccess());
		renderDialog({}, client);
		await user.type(screen.getByLabelText(/section title/i), "Routing");
		await user.click(screen.getByRole("button", { name: /^add section$/i }));
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["courses", "c1"] });
		expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Section added");
	});

	it("toasts the server error and stays open when the save fails", async () => {
		const user = userEvent.setup();
		mockCreate.mockImplementation((_args, { onError }) =>
			onError(new Error("Section title already exists")),
		);
		renderDialog();
		await user.type(screen.getByLabelText(/section title/i), "Routing");
		await user.click(screen.getByRole("button", { name: /^add section$/i }));
		expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
			"Section title already exists",
		);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});
});
