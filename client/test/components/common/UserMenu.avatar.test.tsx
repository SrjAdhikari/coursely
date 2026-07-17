//* test/components/common/UserMenu.avatar.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Deterministic avatar: render an <img> only when a src is given, else the
// fallback (radix's real image loader never resolves under jsdom).
vi.mock("@/components/ui/avatar", () => ({
	Avatar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	AvatarImage: ({ src, alt }: { src?: string; alt?: string }) =>
		src ? <img src={src} alt={alt} /> : null,
	AvatarFallback: ({ children }: { children: ReactNode }) => (
		<span>{children}</span>
	),
}));

import UserMenu from "@/components/common/UserMenu";
import type { UserPayload } from "@/types/auth.types";

const baseUser: UserPayload = {
	id: "1",
	name: "Asha Rai",
	email: "asha@example.com",
	role: "student",
};

const renderMenu = (user: UserPayload) =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<MemoryRouter>
				<UserMenu user={user} />
			</MemoryRouter>
		</QueryClientProvider>,
	);

describe("UserMenu avatar", () => {
	it("renders the Google picture when avatarUrl is present", () => {
		const { container } = renderMenu({
			...baseUser,
			avatarUrl: "https://lh3.googleusercontent.com/a/pic",
		});
		expect(container.querySelector("img")).toHaveAttribute(
			"src",
			"https://lh3.googleusercontent.com/a/pic",
		);
	});

	it("shows the name initials when there is no avatarUrl", () => {
		const { container } = renderMenu(baseUser);
		expect(container.querySelector("img")).toBeNull();
		expect(screen.getByText("AR")).toBeInTheDocument();
	});
});
