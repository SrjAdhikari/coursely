//* test/pages/CheckoutSuccessPage.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockUseCheckoutStatus = vi.fn();
const mockRefetch = vi.fn();
vi.mock("@/hooks/usePayments", () => ({
	useCheckoutStatus: (...args: unknown[]) => mockUseCheckoutStatus(...args),
}));

import CheckoutSuccessPage from "@/pages/CheckoutSuccessPage";

const renderAt = (entry: string) =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<MemoryRouter initialEntries={[entry]}>
				<CheckoutSuccessPage />
			</MemoryRouter>
		</QueryClientProvider>,
	);

// A confirming page whose `settle()` re-renders with a fresh element (a new
// element reference — otherwise React bails out and never re-reads the mock),
// letting a test drive successive poll settlements.
const renderConfirming = () => {
	const client = new QueryClient();
	const tree = () => (
		<QueryClientProvider client={client}>
			<MemoryRouter initialEntries={["/checkout/success?session_id=cs_1"]}>
				<CheckoutSuccessPage />
			</MemoryRouter>
		</QueryClientProvider>
	);
	const view = render(tree());
	return { settle: () => view.rerender(tree()) };
};

// A settled poll advances `dataUpdatedAt` (success) or `errorUpdatedAt` (error).
const settlingPoll = (dataUpdatedAt: number) => ({
	data: { data: { enrolled: false, status: "unpaid" } },
	isLoading: false,
	isError: false,
	refetch: mockRefetch,
	dataUpdatedAt,
	errorUpdatedAt: 0,
});
const failingPoll = (errorUpdatedAt: number) => ({
	data: undefined,
	isLoading: false,
	isError: true,
	refetch: mockRefetch,
	dataUpdatedAt: 0,
	errorUpdatedAt,
});

describe("CheckoutSuccessPage", () => {
	beforeEach(() => vi.clearAllMocks());

	it("shows a graceful fallback when session_id is missing, without crashing", () => {
		mockUseCheckoutStatus.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		renderAt("/checkout/success");

		expect(screen.getByText(/missing checkout reference/i)).toBeInTheDocument();
	});

	it("shows a confirming state with retry progress and a Check again button while settling", async () => {
		const user = userEvent.setup();
		mockUseCheckoutStatus.mockReturnValue(settlingPoll(0));

		renderAt("/checkout/success?session_id=cs_1");

		expect(screen.getByText(/confirming your payment/i)).toBeInTheDocument();
		expect(screen.getByText(/checking with stripe/i)).toBeInTheDocument();
		expect(screen.getByText(/attempt 1 of 6/i)).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /check again/i }));
		expect(mockRefetch).toHaveBeenCalled();
	});

	it("advances the attempt counter as real polls settle, not on a wall-clock timer", () => {
		mockUseCheckoutStatus.mockReturnValue(settlingPoll(0));
		const { settle } = renderConfirming();
		expect(screen.getByText(/attempt 1 of 6/i)).toBeInTheDocument();

		// Each real poll settlement advances the counter, with no timer involved.
		mockUseCheckoutStatus.mockReturnValue(settlingPoll(1000));
		settle();
		expect(screen.getByText(/attempt 2 of 6/i)).toBeInTheDocument();

		mockUseCheckoutStatus.mockReturnValue(settlingPoll(2000));
		settle();
		expect(screen.getByText(/attempt 3 of 6/i)).toBeInTheDocument();
	});

	it("does not advance the counter on a re-render with no new settlement", () => {
		mockUseCheckoutStatus.mockReturnValue(settlingPoll(0));
		const { settle } = renderConfirming();
		expect(screen.getByText(/attempt 1 of 6/i)).toBeInTheDocument();

		mockUseCheckoutStatus.mockReturnValue(settlingPoll(1000));
		settle();
		expect(screen.getByText(/attempt 2 of 6/i)).toBeInTheDocument();

		// Re-render with the SAME timestamp (no new poll) must not advance it.
		settle();
		expect(screen.getByText(/attempt 2 of 6/i)).toBeInTheDocument();
	});

	it("confirms enrollment with a success message and a link to My Courses", () => {
		mockUseCheckoutStatus.mockReturnValue({
			data: {
				data: {
					enrolled: true,
					status: "paid",
					course: { slug: "react", title: "React" },
				},
			},
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		renderAt("/checkout/success?session_id=cs_1");

		expect(screen.getByText(/you're enrolled/i)).toBeInTheDocument();
		expect(screen.getByText(/receipt has been emailed/i)).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /my courses/i }),
		).toBeInTheDocument();
	});

	it("stops polling and shows a still-processing message after six attempts", () => {
		mockUseCheckoutStatus.mockReturnValue(settlingPoll(0));
		const { settle } = renderConfirming();
		expect(screen.getByText(/confirming your payment/i)).toBeInTheDocument();

		// Six real polls settle — the deadline counts attempts, not seconds.
		for (let attempt = 1; attempt <= 6; attempt++) {
			mockUseCheckoutStatus.mockReturnValue(settlingPoll(attempt * 1000));
			settle();
		}

		expect(screen.getByText(/still processing/i)).toBeInTheDocument();
		expect(mockUseCheckoutStatus.mock.calls.at(-1)?.[1]).toBe(false);
		expect(
			screen.getByRole("button", { name: /check again/i }),
		).toBeInTheDocument();
	});

	it("keeps the confirming state on a transient error while still polling", () => {
		mockUseCheckoutStatus.mockReturnValue(failingPoll(0));

		renderAt("/checkout/success?session_id=cs_1");

		expect(screen.getByText(/confirming your payment/i)).toBeInTheDocument();
		expect(screen.queryByText(/couldn't confirm/i)).not.toBeInTheDocument();
	});

	it("shows the error screen once the retry window is exhausted", () => {
		mockUseCheckoutStatus.mockReturnValue(failingPoll(0));
		const { settle } = renderConfirming();
		expect(screen.getByText(/confirming your payment/i)).toBeInTheDocument();

		for (let attempt = 1; attempt <= 6; attempt++) {
			mockUseCheckoutStatus.mockReturnValue(failingPoll(attempt * 1000));
			settle();
		}

		expect(
			screen.getByText(/couldn't confirm this checkout/i),
		).toBeInTheDocument();
	});
});
