//* test/pages/CheckoutCancelPage.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import CheckoutCancelPage from "@/pages/CheckoutCancelPage";

describe("CheckoutCancelPage", () => {
	it("explains nothing was charged and links onward", () => {
		render(
			<MemoryRouter>
				<CheckoutCancelPage />
			</MemoryRouter>,
		);

		expect(screen.getByText(/checkout canceled/i)).toBeInTheDocument();
		expect(screen.getByText(/no.*charge/i)).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /browse courses/i }),
		).toHaveAttribute("href", "/courses");
		expect(screen.getByRole("link", { name: /my courses/i })).toHaveAttribute(
			"href",
			"/my-courses",
		);
	});
});
