//* test/components/admin/CourseLoadFailed.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import CourseLoadFailed from "@/components/admin/CourseFormLoadFailed";

const renderComponent = (onRetry = () => {}) =>
	render(
		<MemoryRouter>
			<CourseLoadFailed onRetry={onRetry} />
		</MemoryRouter>,
	);

describe("CourseLoadFailed", () => {
	it("renders an alert with static failure copy and a way back", () => {
		renderComponent();
		expect(screen.getByRole("alert")).toBeInTheDocument();
		expect(screen.getByText(/couldn't load this course/i)).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /back to courses/i }),
		).toBeInTheDocument();
	});

	it("calls onRetry when the retry button is clicked", async () => {
		const onRetry = vi.fn();
		renderComponent(onRetry);
		await userEvent.click(screen.getByRole("button", { name: /try again/i }));
		expect(onRetry).toHaveBeenCalledOnce();
	});
});
