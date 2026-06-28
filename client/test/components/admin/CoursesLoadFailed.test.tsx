//* test/components/admin/CoursesLoadFailed.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CoursesLoadFailed from "@/components/admin/CoursesLoadFailed";

describe("CoursesLoadFailed", () => {
	it("renders an alert with static failure copy", () => {
		render(<CoursesLoadFailed onRetry={() => {}} />);
		expect(screen.getByRole("alert")).toBeInTheDocument();
		expect(screen.getByText(/couldn't load courses/i)).toBeInTheDocument();
	});

	it("calls onRetry when the retry button is clicked", async () => {
		const onRetry = vi.fn();
		render(<CoursesLoadFailed onRetry={onRetry} />);
		await userEvent.click(screen.getByRole("button", { name: /try again/i }));
		expect(onRetry).toHaveBeenCalledOnce();
	});
});
