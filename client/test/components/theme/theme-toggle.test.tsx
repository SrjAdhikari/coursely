//* test/components/theme/theme-toggle.test.tsx

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "@/components/theme/theme-toggle";

describe("ThemeToggle", () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.classList.add("dark");
	});

	it("toggles the document theme and persists the choice", async () => {
		render(<ThemeToggle />);
		const button = screen.getByRole("button", { name: /toggle theme/i });

		await userEvent.click(button);
		expect(document.documentElement.classList.contains("dark")).toBe(false);
		expect(localStorage.getItem("theme")).toBe("light");

		await userEvent.click(button);
		expect(document.documentElement.classList.contains("dark")).toBe(true);
		expect(localStorage.getItem("theme")).toBe("dark");
	});
});
