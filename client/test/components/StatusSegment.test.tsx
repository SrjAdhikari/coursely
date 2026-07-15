//* test/components/StatusSegment.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import StatusSegment from "@/components/StatusSegment";

describe("StatusSegment", () => {
	it("renders Draft and Live and reports each choice via onChange", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<StatusSegment value={false} onChange={onChange} />);

		const draft = screen.getByRole("button", { name: /draft/i });
		const live = screen.getByRole("button", { name: /live/i });
		expect(draft).toBeInTheDocument();
		expect(live).toBeInTheDocument();

		await user.click(live);
		expect(onChange).toHaveBeenCalledWith(true);

		await user.click(draft);
		expect(onChange).toHaveBeenCalledWith(false);
	});

	it("disables Live and shows a hint when liveDisabled, keeping Draft usable", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<StatusSegment value={false} onChange={onChange} liveDisabled />);

		const live = screen.getByRole("button", { name: /live/i });
		expect(live).toBeDisabled();

		await user.click(live);
		expect(onChange).not.toHaveBeenCalled();

		expect(
			screen.getByText(/upload at least one lesson video/i),
		).toBeInTheDocument();

		const draft = screen.getByRole("button", { name: /draft/i });
		expect(draft).toBeEnabled();
		await user.click(draft);
		expect(onChange).toHaveBeenCalledWith(false);
	});
});
