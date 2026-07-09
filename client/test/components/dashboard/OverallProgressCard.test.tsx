//* test/components/dashboard/OverallProgressCard.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OverallProgressCard from "@/components/dashboard/OverallProgressCard";

describe("OverallProgressCard", () => {
	it("shows the percent and a pluralized completed-of-total lessons line", () => {
		render(<OverallProgressCard percent={40} completed={12} total={30} />);
		expect(screen.getByText("40%")).toBeInTheDocument();
		expect(screen.getByText("12 / 30 lessons completed")).toBeInTheDocument();
	});

	it("shows a singular lesson label when total is 1", () => {
		render(<OverallProgressCard percent={100} completed={1} total={1} />);
		expect(screen.getByText("1 / 1 lesson completed")).toBeInTheDocument();
	});
});
