//* test/pages/HomePage.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/pages/HomePage";

describe("HomePage", () => {
	it("renders the Coursely heading", () => {
		render(<HomePage />);
		expect(
			screen.getByRole("heading", { name: /coursely/i }),
		).toBeInTheDocument();
	});
});
