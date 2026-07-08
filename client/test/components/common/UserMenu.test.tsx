//* test/components/common/UserMenu.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockMutate = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
	useLogout: () => ({ mutate: mockMutate }),
}));

vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();
	return { ...actual, useNavigate: () => mockNavigate };
});

import UserMenu from "@/components/common/UserMenu";
import { CURRENT_USER_KEY } from "@/lib/queryKeys";

const user = {
	id: "u1",
	name: "Suraj Adhikari",
	email: "suraj@example.com",
	role: "student" as const,
};

const renderMenu = () => {
	const queryClient = new QueryClient();
	const rendered = render(
		<QueryClientProvider client={queryClient}>
			<UserMenu user={user} />
		</QueryClientProvider>,
	);
	return { ...rendered, queryClient };
};

describe("UserMenu", () => {
	beforeEach(() => vi.clearAllMocks());

	it("shows the user's initials on the avatar trigger", () => {
		renderMenu();
		expect(screen.getByText("SA")).toBeInTheDocument();
	});

	it("keeps the menu closed until the avatar is clicked", () => {
		renderMenu();
		expect(screen.queryByText("suraj@example.com")).not.toBeInTheDocument();
		expect(
			screen.queryByRole("menuitem", { name: /log out/i }),
		).not.toBeInTheDocument();
	});

	it("opens a menu with the name, email, and a logout item", async () => {
		renderMenu();
		await userEvent.click(
			screen.getByRole("button", { name: /account menu/i }),
		);
		// Menu content is portaled/animated — retry until it mounts.
		expect(await screen.findByText("Suraj Adhikari")).toBeInTheDocument();
		expect(screen.getByText("suraj@example.com")).toBeInTheDocument();
		expect(
			screen.getByRole("menuitem", { name: /log out/i }),
		).toBeInTheDocument();
	});

	it("clears the session and redirects to login when Log out is clicked", async () => {
		const { queryClient } = renderMenu();
		const removeQueries = vi.spyOn(queryClient, "removeQueries");
		await userEvent.click(
			screen.getByRole("button", { name: /account menu/i }),
		);
		const logoutItem = await screen.findByRole("menuitem", {
			name: /log out/i,
		});
		await userEvent.click(logoutItem);

		expect(mockMutate).toHaveBeenCalledTimes(1);

		// Fire the success callback the component handed the mutation.
		const options = mockMutate.mock.calls[0][1];
		options.onSuccess();
		expect(removeQueries).toHaveBeenCalledWith({ queryKey: CURRENT_USER_KEY });
		expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
	});
});
