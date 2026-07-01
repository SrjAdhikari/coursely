//* test/hooks/usePayments.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@/api/payments.api", () => ({
	createCheckout: vi.fn(),
	getCheckoutStatus: vi.fn(),
}));

import { createCheckout, getCheckoutStatus } from "@/api/payments.api";
import { useCreateCheckout, useCheckoutStatus } from "@/hooks/usePayments";

const wrapper = ({ children }: { children: ReactNode }) => {
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe("payment hooks", () => {
	beforeEach(() => vi.clearAllMocks());

	it("creates a checkout session on mutate", async () => {
		vi.mocked(createCheckout).mockResolvedValue({
			success: true,
			message: "ok",
			data: { url: "https://stripe.test/x" },
		});
		const { result } = renderHook(() => useCreateCheckout(), { wrapper });
		result.current.mutate("course1");
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(createCheckout).toHaveBeenCalledWith("course1", expect.any(Object));
	});

	it("fetches checkout status when a session id is present", async () => {
		vi.mocked(getCheckoutStatus).mockResolvedValue({
			success: true,
			message: "ok",
			data: { enrolled: true, status: "paid" },
		});
		const { result } = renderHook(() => useCheckoutStatus("sess_1", false), {
			wrapper,
		});
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.data.enrolled).toBe(true);
	});

	it("stays idle without a session id", () => {
		const { result } = renderHook(() => useCheckoutStatus("", false), {
			wrapper,
		});
		expect(result.current.fetchStatus).toBe("idle");
		expect(getCheckoutStatus).not.toHaveBeenCalled();
	});

	it("stops polling once the session reconciles as enrolled", async () => {
		vi.useFakeTimers();
		vi.mocked(getCheckoutStatus).mockResolvedValue({
			success: true,
			message: "ok",
			data: { enrolled: true, status: "paid" },
		});

		renderHook(() => useCheckoutStatus("sess_1", true), { wrapper });

		// Flush the initial fetch, then advance well past several poll intervals.
		await vi.advanceTimersByTimeAsync(50);
		const callsAfterInitial = vi.mocked(getCheckoutStatus).mock.calls.length;
		await vi.advanceTimersByTimeAsync(5000);

		expect(callsAfterInitial).toBe(1);
		expect(vi.mocked(getCheckoutStatus).mock.calls.length).toBe(
			callsAfterInitial,
		);

		vi.useRealTimers();
	});
});
