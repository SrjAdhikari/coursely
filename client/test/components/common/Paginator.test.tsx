//* test/components/common/Paginator.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Paginator from "@/components/common/Paginator";

const renderPaginator = (
	props: Partial<React.ComponentProps<typeof Paginator>> = {},
) => {
	const onPageChange = vi.fn();
	render(
		<Paginator
			page={1}
			pageSize={10}
			total={47}
			totalPages={5}
			onPageChange={onPageChange}
			{...props}
		/>,
	);
	return { onPageChange };
};

const pageButton = (n: number) =>
	screen.getByRole("button", { name: new RegExp(`go to page ${n}$`, "i") });

describe("Paginator", () => {
	it("shows the current range and total", () => {
		renderPaginator({ page: 1 });
		expect(screen.getByText("Showing 1–10 of 47")).toBeInTheDocument();
	});

	it("shows the range for a middle page", () => {
		renderPaginator({ page: 3 });
		expect(screen.getByText("Showing 21–30 of 47")).toBeInTheDocument();
	});

	it("clamps the range end to the total on the last page", () => {
		renderPaginator({ page: 5 });
		expect(screen.getByText("Showing 41–47 of 47")).toBeInTheDocument();
	});

	it("shows every page button when there are five or fewer pages", () => {
		renderPaginator({ totalPages: 5 });
		expect(pageButton(5)).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /go to page 6$/i }),
		).not.toBeInTheDocument();
	});

	it("collapses to the first five pages when there are more than five", () => {
		renderPaginator({ page: 1, total: 78, totalPages: 8 });
		expect(pageButton(1)).toBeInTheDocument();
		expect(pageButton(5)).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /go to page 6$/i }),
		).not.toBeInTheDocument();
	});

	it("advances the window in chunks of five", () => {
		renderPaginator({ page: 6, total: 78, totalPages: 8 });
		expect(pageButton(6)).toBeInTheDocument();
		expect(pageButton(8)).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /go to page 5$/i }),
		).not.toBeInTheDocument();
	});

	it("marks the current page", () => {
		renderPaginator({ page: 3 });
		expect(pageButton(3)).toHaveAttribute("aria-current", "page");
	});

	it("disables Previous on the first page", () => {
		renderPaginator({ page: 1 });
		expect(
			screen.getByRole("button", { name: /previous/i }),
		).toBeDisabled();
		expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
	});

	it("disables Next on the last page", () => {
		renderPaginator({ page: 5, totalPages: 5 });
		expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
		expect(
			screen.getByRole("button", { name: /previous/i }),
		).toBeEnabled();
	});

	it("calls onPageChange when a page button is clicked", async () => {
		const { onPageChange } = renderPaginator({ page: 1 });
		await userEvent.click(pageButton(3));
		expect(onPageChange).toHaveBeenCalledWith(3);
	});

	it("calls onPageChange with the next and previous page for the arrows", async () => {
		const { onPageChange } = renderPaginator({ page: 3 });
		await userEvent.click(screen.getByRole("button", { name: /next/i }));
		expect(onPageChange).toHaveBeenCalledWith(4);
		await userEvent.click(screen.getByRole("button", { name: /previous/i }));
		expect(onPageChange).toHaveBeenCalledWith(2);
	});
});
