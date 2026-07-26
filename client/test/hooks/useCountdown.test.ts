//* test/hooks/useCountdown.test.ts

import { describe, it, expect, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";

import useCountdown from "@/hooks/useCountdown";

describe("useCountdown", () => {
	afterEach(() => vi.useRealTimers());

	it("starts idle at zero", () => {
		const { result } = renderHook(() => useCountdown());
		expect(result.current.secondsLeft).toBe(0);
	});

	it("counts down one second at a time to zero", () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useCountdown());

		act(() => result.current.start(3));
		expect(result.current.secondsLeft).toBe(3);

		act(() => vi.advanceTimersByTime(1000));
		expect(result.current.secondsLeft).toBe(2);

		act(() => vi.advanceTimersByTime(1000));
		expect(result.current.secondsLeft).toBe(1);

		act(() => vi.advanceTimersByTime(1000));
		expect(result.current.secondsLeft).toBe(0);

		// Stays at zero — no negative ticks.
		act(() => vi.advanceTimersByTime(1000));
		expect(result.current.secondsLeft).toBe(0);
	});
});
