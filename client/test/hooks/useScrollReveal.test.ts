import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { createElement } from "react";

import useScrollReveal from "@/hooks/useScrollReveal";

// Captured instances so each test can drive the observer it created.
type IntersectionCallback = (
	entries: Array<{ isIntersecting: boolean; target: Element }>,
) => void;

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

	// Report every observed element as intersecting, mirroring a scroll into view.
	reportIntersecting() {
		this.callback(
			this.observed.map((target) => ({ isIntersecting: true, target })),
		);
	}
}

// Tiny component that mounts the hook next to a couple of reveal targets.
const RevealHarness = () => {
	useScrollReveal();
	return createElement(
		"div",
		null,
		createElement("section", { className: "reveal-on-scroll" }, "First"),
		createElement("section", { className: "reveal-on-scroll" }, "Second"),
	);
};

const realIntersectionObserver = window.IntersectionObserver;

describe("useScrollReveal", () => {
	beforeEach(() => {
		observerInstances = [];
		window.IntersectionObserver =
			MockIntersectionObserver as unknown as typeof IntersectionObserver;
	});

	afterEach(() => {
		cleanup();
		window.IntersectionObserver = realIntersectionObserver;
	});

	it("observes reveal targets and adds is-visible when they intersect", () => {
		const { container } = render(createElement(RevealHarness));
		const targets = container.querySelectorAll(".reveal-on-scroll");
		expect(targets).toHaveLength(2);

		const observer = observerInstances.at(-1)!;
		expect(observer.observed).toHaveLength(2);
		targets.forEach((target) => expect(target).not.toHaveClass("is-visible"));

		observer.reportIntersecting();

		targets.forEach((target) => expect(target).toHaveClass("is-visible"));
	});

	it("reveals every target immediately when IntersectionObserver is unavailable", () => {
		delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;

		const { container } = render(createElement(RevealHarness));

		expect(observerInstances).toHaveLength(0);
		container
			.querySelectorAll(".reveal-on-scroll")
			.forEach((target) => expect(target).toHaveClass("is-visible"));
	});

	it("disconnects the observer on unmount", () => {
		const { unmount } = render(createElement(RevealHarness));
		const observer = observerInstances.at(-1)!;

		unmount();

		expect(observer.disconnect).toHaveBeenCalledTimes(1);
	});
});
