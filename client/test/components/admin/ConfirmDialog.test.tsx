//* test/components/admin/ConfirmDialog.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

describe("ConfirmDialog", () => {
	it("renders the derived delete copy with the item name", () => {
		render(
			<ConfirmDialog
				itemType="course"
				itemName="React from Scratch"
				onConfirm={() => {}}
				onClose={() => {}}
			/>,
		);
		expect(screen.getByText(/delete course\?/i)).toBeInTheDocument();
		expect(screen.getByText("React from Scratch")).toBeInTheDocument();
	});

	it("calls onConfirm when the delete button is clicked", async () => {
		const onConfirm = vi.fn();
		render(
			<ConfirmDialog
				itemType="course"
				itemName="React"
				onConfirm={onConfirm}
				onClose={() => {}}
			/>,
		);
		await userEvent.click(screen.getByRole("button", { name: /delete/i }));
		expect(onConfirm).toHaveBeenCalledOnce();
	});
});
