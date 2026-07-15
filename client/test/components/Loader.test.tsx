//* test/components/Loader.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import Loader from "@/components/Loader";

describe("Loader", () => {
	it("exposes an accessible loading status", () => {
		render(<Loader />);
		expect(
			screen.getByRole("status", { name: /loading/i }),
		).toBeInTheDocument();
	});

	it("is a full-screen overlay by default (no props)", () => {
		render(<Loader />);
		expect(screen.getByRole("status")).toHaveClass("fixed", "inset-0", "z-50");
	});

	it("sizes inline instead when given a className", () => {
		render(<Loader className="aspect-video" />);
		const status = screen.getByRole("status");
		expect(status).toHaveClass("aspect-video");
		expect(status).not.toHaveClass("fixed");
	});
});
