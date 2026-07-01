//* test/components/course/PurchaseCard.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import PurchaseCard from "@/components/course/PurchaseCard";

const base = {
	slug: "react",
	price: 149900,
	lessonCount: 18,
	totalDuration: 20520,
	onBuy: vi.fn(),
	isBuying: false,
};

const renderCard = (
	props: Partial<React.ComponentProps<typeof PurchaseCard>>,
) =>
	render(
		<MemoryRouter>
			<PurchaseCard {...base} status="buyable" {...props} />
		</MemoryRouter>,
	);

describe("PurchaseCard", () => {
	it("shows the price and what's included", () => {
		renderCard({});
		expect(screen.getByText("₹1,499")).toBeInTheDocument();
		expect(screen.getByText(/18 video lessons/i)).toBeInTheDocument();
		expect(screen.getByText(/5h 42m of content/i)).toBeInTheDocument();
	});

	it("guest: links to login with a return-to redirect", () => {
		renderCard({ status: "guest" });
		const link = screen.getByRole("link", { name: /log in to enroll/i });
		expect(link).toHaveAttribute("href", "/login?redirect=%2Fcourses%2Freact");
	});

	it("buyable: calls onBuy when clicked", async () => {
		const onBuy = vi.fn();
		renderCard({ status: "buyable", onBuy });
		await userEvent.click(
			screen.getByRole("button", { name: /buy this course/i }),
		);
		expect(onBuy).toHaveBeenCalledOnce();
	});

	it("buyable: disables and relabels while buying", () => {
		renderCard({ status: "buyable", isBuying: true });
		expect(screen.getByRole("button", { name: /redirecting/i })).toBeDisabled();
	});

	it("enrolled: shows ownership and a My Courses link", () => {
		renderCard({ status: "enrolled" });
		expect(screen.getByText(/enrolled · full access/i)).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /go to my courses/i }),
		).toHaveAttribute("href", "/my-courses");
	});

	it("enrolled: shows the ownership headline and hides the price", () => {
		renderCard({ status: "enrolled" });
		expect(screen.getByText(/you own this course/i)).toBeInTheDocument();
		expect(screen.queryByText("₹1,499")).not.toBeInTheDocument();
	});

	it("guest: notes that login brings the buyer back here", () => {
		renderCard({ status: "guest" });
		expect(
			screen.getByText(/bring you right back here after you sign in/i),
		).toBeInTheDocument();
	});

	it("buyable: notes the buyer is redirected to Stripe to pay", () => {
		renderCard({ status: "buyable" });
		expect(screen.getByText(/redirected to pay/i)).toBeInTheDocument();
	});
});
