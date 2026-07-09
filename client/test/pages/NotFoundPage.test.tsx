//* test/pages/NotFoundPage.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import NotFoundPage from "@/pages/NotFoundPage";

describe("NotFoundPage", () => {
	it("shows a 404 message and links back home", () => {
		render(
			<MemoryRouter>
				<NotFoundPage />
			</MemoryRouter>,
		);

		expect(screen.getByText(/page not found/i)).toBeInTheDocument();
		expect(
			screen.getByText(/doesn't exist or may have moved/i),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /back to home/i }),
		).toHaveAttribute("href", "/");
	});
});
