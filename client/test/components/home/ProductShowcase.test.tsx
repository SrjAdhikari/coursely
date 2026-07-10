import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProductShowcase from "@/components/home/ProductShowcase";

describe("ProductShowcase", () => {
	it("renders the section heading and three tabs with Dashboard selected by default", () => {
		render(<ProductShowcase />);

		expect(
			screen.getByRole("heading", { name: /a calm place to learn/i }),
		).toBeInTheDocument();

		const tabs = screen.getAllByRole("tab");
		expect(tabs).toHaveLength(3);

		const dashboardTab = screen.getByRole("tab", { name: /your dashboard/i });
		const learnTab = screen.getByRole("tab", { name: /watch & learn/i });
		const catalogTab = screen.getByRole("tab", { name: /the catalog/i });

		expect(dashboardTab).toHaveAttribute("aria-selected", "true");
		expect(learnTab).toHaveAttribute("aria-selected", "false");
		expect(catalogTab).toHaveAttribute("aria-selected", "false");

		// Only the dashboard panel is the visible/active one.
		const shownPanels = screen.getAllByRole("tabpanel");
		expect(shownPanels).toHaveLength(1);
		expect(shownPanels[0]).toHaveAttribute("id", "showcase-panel-dashboard");
	});

	it("keeps a tab's accessible name to just its kicker + heading, with the detail outside the button", () => {
		render(<ProductShowcase />);

		const dashboardTab = screen.getByRole("tab", { name: /your dashboard/i });
		// The intro paragraph must not bleed into the tab's accessible name.
		expect(dashboardTab).toHaveAccessibleName(
			/your dashboard.*see your progress at a glance/i,
		);
		expect(dashboardTab.textContent).not.toMatch(/every course you own/i);

		// Intro + checkpoints live outside any <button>.
		expect(
			screen.getByText(/every course you own/i).closest("button"),
		).toBeNull();
		expect(
			screen.getByText(/resume exactly where you left off/i).closest("button"),
		).toBeNull();
	});

	it("exposes only the active tab's detail to assistive tech; inactive details are inert", () => {
		render(<ProductShowcase />);

		// Dashboard is active by default -> its detail is not inert.
		expect(
			screen.getByText(/every course you own/i).closest("[inert]"),
		).toBeNull();

		// Learn + catalog are inactive -> their details are inert (AT-hidden).
		expect(
			screen.getByText(/distraction-free player/i).closest("[inert]"),
		).not.toBeNull();
		expect(
			screen.getByText(/tight, curated set/i).closest("[inert]"),
		).not.toBeNull();
	});

	it("selects Watch & learn on click and swaps the shown panel to the player", async () => {
		const user = userEvent.setup();
		render(<ProductShowcase />);

		await user.click(screen.getByRole("tab", { name: /watch & learn/i }));

		expect(
			screen.getByRole("tab", { name: /watch & learn/i }),
		).toHaveAttribute("aria-selected", "true");
		expect(
			screen.getByRole("tab", { name: /your dashboard/i }),
		).toHaveAttribute("aria-selected", "false");

		// The player panel is now the only shown one; dashboard is no longer shown.
		const shownPanels = screen.getAllByRole("tabpanel");
		expect(shownPanels).toHaveLength(1);
		expect(shownPanels[0]).toHaveAttribute("id", "showcase-panel-learn");

		// And its detail is now the exposed (non-inert) one.
		expect(
			screen.getByText(/distraction-free player/i).closest("[inert]"),
		).toBeNull();
	});

	it("moves selection to the next tab when ArrowDown is pressed", async () => {
		const user = userEvent.setup();
		render(<ProductShowcase />);

		screen.getByRole("tab", { name: /your dashboard/i }).focus();
		await user.keyboard("{ArrowDown}");

		const learnTab = screen.getByRole("tab", { name: /watch & learn/i });
		expect(learnTab).toHaveAttribute("aria-selected", "true");
		expect(learnTab).toHaveFocus();
	});

	it("wraps to the last tab when ArrowUp is pressed on the first tab", async () => {
		const user = userEvent.setup();
		render(<ProductShowcase />);

		screen.getByRole("tab", { name: /your dashboard/i }).focus();
		await user.keyboard("{ArrowUp}");

		const catalogTab = screen.getByRole("tab", { name: /the catalog/i });
		expect(catalogTab).toHaveAttribute("aria-selected", "true");
		expect(catalogTab).toHaveFocus();
	});

	it("selects the first tab on Home and the last tab on End", async () => {
		const user = userEvent.setup();
		render(<ProductShowcase />);

		const catalogTab = screen.getByRole("tab", { name: /the catalog/i });
		catalogTab.focus();

		await user.keyboard("{Home}");
		const dashboardTab = screen.getByRole("tab", { name: /your dashboard/i });
		expect(dashboardTab).toHaveAttribute("aria-selected", "true");
		expect(dashboardTab).toHaveFocus();

		await user.keyboard("{End}");
		expect(catalogTab).toHaveAttribute("aria-selected", "true");
		expect(catalogTab).toHaveFocus();
	});

	it("keeps roving tabindex — exactly one tab is tabbable and it is the selected one", async () => {
		const user = userEvent.setup();
		render(<ProductShowcase />);

		const tabbableAfterEach = () => {
			const tabs = screen.getAllByRole("tab");
			const tabbable = tabs.filter(
				(tab) => tab.getAttribute("tabindex") === "0",
			);
			expect(tabbable).toHaveLength(1);
			expect(tabbable[0]).toHaveAttribute("aria-selected", "true");
		};

		tabbableAfterEach();

		await user.click(screen.getByRole("tab", { name: /the catalog/i }));
		tabbableAfterEach();
	});
});
