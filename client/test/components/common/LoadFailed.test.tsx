//* test/components/common/LoadFailed.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import LoadFailed from "@/components/common/LoadFailed";

describe("LoadFailed", () => {
	it("renders an alert with the title and description, and retries on click", async () => {
		const onRetry = vi.fn();
		render(
			<LoadFailed
				title="Couldn't load courses"
				description="Something went wrong while loading."
				onRetry={onRetry}
			/>,
		);

		expect(screen.getByRole("alert")).toBeInTheDocument();
		expect(screen.getByText("Couldn't load courses")).toBeInTheDocument();
		expect(
			screen.getByText("Something went wrong while loading."),
		).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /try again/i }));
		expect(onRetry).toHaveBeenCalledOnce();
	});

	it("omits the back link when no backTo is given", () => {
		render(
			<LoadFailed title="x" description="y" onRetry={() => {}} />,
		);
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
	});

	it("renders a back link when backTo and backLabel are given", () => {
		render(
			<MemoryRouter>
				<LoadFailed
					title="Couldn't load this course"
					description="y"
					onRetry={() => {}}
					backTo="/admin/courses"
					backLabel="Back to courses"
				/>
			</MemoryRouter>,
		);
		expect(
			screen.getByRole("link", { name: /back to courses/i }),
		).toBeInTheDocument();
	});
});
