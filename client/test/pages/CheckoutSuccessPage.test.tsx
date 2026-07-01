//* test/pages/CheckoutSuccessPage.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
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
		mockUseCheckoutStatus.mockReturnValue({
			data: { data: { enrolled: false, status: "unpaid" } },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		renderAt("/checkout/success?session_id=cs_1");

		expect(screen.getByText(/confirming your payment/i)).toBeInTheDocument();
		expect(screen.getByText(/checking with stripe/i)).toBeInTheDocument();
		expect(screen.getByText(/attempt 1 of 6/i)).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /check again/i }));
		expect(mockRefetch).toHaveBeenCalled();
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
		expect(
			screen.getByText(/receipt has been emailed/i),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /my courses/i }),
		).toBeInTheDocument();
	});

	it("stops polling and shows a still-processing message after the poll deadline", () => {
		vi.useFakeTimers();
		mockUseCheckoutStatus.mockReturnValue({
			data: { data: { enrolled: false, status: "unpaid" } },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		renderAt("/checkout/success?session_id=cs_1");
		expect(screen.getByText(/confirming your payment/i)).toBeInTheDocument();

		act(() => {
			vi.advanceTimersByTime(9000);
		});

		expect(screen.getByText(/still processing/i)).toBeInTheDocument();
		const lastCallPollArg = mockUseCheckoutStatus.mock.calls.at(-1)?.[1];
		expect(lastCallPollArg).toBe(false);
		expect(
			screen.getByRole("button", { name: /check again/i }),
		).toBeInTheDocument();

		vi.useRealTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});
});
