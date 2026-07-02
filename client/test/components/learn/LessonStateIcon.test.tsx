//* test/components/learn/LessonStateIcon.test.tsx

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import LessonStateIcon from "@/components/learn/LessonStateIcon";

describe("LessonStateIcon", () => {
	it("renders a check for a completed lesson", () => {
		const { container } = render(<LessonStateIcon state="completed" />);
		expect(container.querySelector('[data-state="completed"]')).toBeTruthy();
		expect(container.querySelector("svg")).toBeTruthy();
	});

	it("renders a partial ring carrying the watched percent for in-progress", () => {
		const { container } = render(
			<LessonStateIcon state="in-progress" watchedFraction={0.4} />,
		);
		const ring = container.querySelector('[data-state="in-progress"]');
		expect(ring).toBeTruthy();
		expect(ring?.getAttribute("data-percent")).toBe("40");
	});

	it("renders an empty circle (no check) for not-started", () => {
		const { container } = render(<LessonStateIcon state="not-started" />);
		expect(container.querySelector('[data-state="not-started"]')).toBeTruthy();
		expect(container.querySelector("svg")).toBeNull();
	});
});
