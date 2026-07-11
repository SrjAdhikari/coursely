import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, screen, act } from "@testing-library/react";
import { createElement } from "react";

import useActiveSection from "@/hooks/useActiveSection";

// Minimal controllable IntersectionObserver so each test drives its own entries.
type IntersectionEntry = { isIntersecting: boolean; target: Element };
type IntersectionCallback = (entries: IntersectionEntry[]) => void;

let observerInstances: MockIntersectionObserver[] = [];

class MockIntersectionObserver {
	callback: IntersectionCallback;
	observed: Element[] = [];
	disconnect = vi.fn();
	unobserve = vi.fn();

	constructor(callback: IntersectionCallback) {
		this.callback = callback;
		observerInstances.push(this);
	}

	observe = (element: Element) => {
		this.observed.push(element);
	};

	report(entries: IntersectionEntry[]) {
		this.callback(entries);
	}
}

const SECTION_IDS = ["why", "how", "faq"];

// Harness renders the active id so assertions can read it from the DOM.
const ActiveSectionHarness = () => {
	const active = useActiveSection(SECTION_IDS);
	return createElement(
		"div",
		null,
		createElement("p", { "data-testid": "active" }, active ?? "none"),
		createElement("section", { id: "why" }, "Why"),
		createElement("section", { id: "how" }, "How"),
		createElement("section", { id: "faq" }, "FAQ"),
	);
};

const realIntersectionObserver = window.IntersectionObserver;

describe("useActiveSection", () => {
	beforeEach(() => {
		observerInstances = [];
		window.IntersectionObserver =
			MockIntersectionObserver as unknown as typeof IntersectionObserver;
	});

	afterEach(() => {
		cleanup();
		window.IntersectionObserver = realIntersectionObserver;
	});

	it("observes every section and starts with no active section", () => {
		render(createElement(ActiveSectionHarness));

		const observer = observerInstances.at(-1)!;
		expect(observer.observed).toHaveLength(3);
		expect(screen.getByTestId("active")).toHaveTextContent("none");
	});

	it("marks a section active when it enters view", () => {
		render(createElement(ActiveSectionHarness));
		const observer = observerInstances.at(-1)!;

		act(() =>
			observer.report([
				{ isIntersecting: true, target: document.getElementById("how")! },
			]),
		);

		expect(screen.getByTestId("active")).toHaveTextContent("how");
	});

	it("prefers the topmost section when several intersect at once", () => {
		render(createElement(ActiveSectionHarness));
		const observer = observerInstances.at(-1)!;

		act(() =>
			observer.report([
				{ isIntersecting: true, target: document.getElementById("faq")! },
				{ isIntersecting: true, target: document.getElementById("how")! },
			]),
		);

		expect(screen.getByTestId("active")).toHaveTextContent("how");
	});

	it("clears the active section once it leaves view", () => {
		render(createElement(ActiveSectionHarness));
		const observer = observerInstances.at(-1)!;
		const why = document.getElementById("why")!;

		act(() => observer.report([{ isIntersecting: true, target: why }]));
		expect(screen.getByTestId("active")).toHaveTextContent("why");

		act(() => observer.report([{ isIntersecting: false, target: why }]));
		expect(screen.getByTestId("active")).toHaveTextContent("none");
	});

	it("disconnects the observer on unmount", () => {
		const { unmount } = render(createElement(ActiveSectionHarness));
		const observer = observerInstances.at(-1)!;

		unmount();

		expect(observer.disconnect).toHaveBeenCalledTimes(1);
	});
});
