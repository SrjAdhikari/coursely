import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import useDebounce from "@/hooks/useDebounce";

describe("useDebounce", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it("returns the initial value immediately", () => {
		const { result } = renderHook(() => useDebounce("a", 200));
		expect(result.current).toBe("a");
	});

	it("updates to the latest value only after the delay of stable input", () => {
		const { result, rerender } = renderHook(
			({ value }) => useDebounce(value, 200),
			{ initialProps: { value: "a" } },
		);

		rerender({ value: "ab" });
		rerender({ value: "abc" });
		expect(result.current).toBe("a"); // still the debounced (old) value

		act(() => vi.advanceTimersByTime(200));
		expect(result.current).toBe("abc"); // only the latest survives
	});

	it("does not emit an intermediate value when input keeps changing", () => {
		const { result, rerender } = renderHook(
			({ value }) => useDebounce(value, 200),
			{ initialProps: { value: "a" } },
		);

		rerender({ value: "ab" });
		act(() => vi.advanceTimersByTime(150)); // not yet elapsed
		rerender({ value: "abc" }); // resets the timer
		act(() => vi.advanceTimersByTime(150)); // 150 < 200 since the reset
		expect(result.current).toBe("a"); // never settled on "ab"

		act(() => vi.advanceTimersByTime(50));
		expect(result.current).toBe("abc");
	});
});
