//* test/components/sidebar/SidebarUser.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

const user = {
	id: "u1",
	name: "Suraj Adhikari",
	email: "suraj@example.com",
	role: "admin" as const,
};

vi.mock("@/hooks/useAuth", () => ({
	useCurrentUser: () => ({ data: { data: user } }),
	useLogout: () => ({ mutate: mockLogout }),
}));

vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();
	return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

import SidebarUser from "@/components/sidebar/SidebarUser";
import { CURRENT_USER_KEY } from "@/lib/queryKeys";
import { toast } from "sonner";

const renderSidebarUser = () => {
	const queryClient = new QueryClient();
	const rendered = render(
		<QueryClientProvider client={queryClient}>
			<SidebarUser />
		</QueryClientProvider>,
	);
	return { ...rendered, queryClient };
};

describe("SidebarUser", () => {
	beforeEach(() => vi.clearAllMocks());

	it("shows the avatar initials, name, and email on the trigger", () => {
		renderSidebarUser();
		expect(screen.getByText("SA")).toBeInTheDocument();
		expect(screen.getByText("Suraj Adhikari")).toBeInTheDocument();
		expect(screen.getByText("suraj@example.com")).toBeInTheDocument();
	});

	it("keeps the role and logout hidden until the avatar is clicked", () => {
		renderSidebarUser();
		expect(screen.queryByText("Admin")).not.toBeInTheDocument();
		expect(
			screen.queryByRole("menuitem", { name: /log out/i }),
		).not.toBeInTheDocument();
	});

	it("opens a menu with the read-only admin role and a logout item", async () => {
		renderSidebarUser();
		await userEvent.click(
			screen.getByRole("button", { name: /account menu/i }),
		);
		expect(await screen.findByText("Admin")).toBeInTheDocument();
		expect(
			screen.getByRole("menuitem", { name: /log out/i }),
		).toBeInTheDocument();
	});

	it("clears the session and redirects to login when Log out is clicked", async () => {
		const { queryClient } = renderSidebarUser();
		const removeQueries = vi.spyOn(queryClient, "removeQueries");
		await userEvent.click(
			screen.getByRole("button", { name: /account menu/i }),
		);
		const logoutItem = await screen.findByRole("menuitem", {
			name: /log out/i,
		});
		await userEvent.click(logoutItem);

		expect(mockLogout).toHaveBeenCalledTimes(1);
		const options = mockLogout.mock.calls[0][1];
		options.onSuccess();
		expect(removeQueries).toHaveBeenCalledWith({ queryKey: CURRENT_USER_KEY });
		expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
	});

	it("shows an error toast and stays put when logout fails", async () => {
		renderSidebarUser();
		await userEvent.click(
			screen.getByRole("button", { name: /account menu/i }),
		);
		const logoutItem = await screen.findByRole("menuitem", {
			name: /log out/i,
		});
		await userEvent.click(logoutItem);

		const options = mockLogout.mock.calls[0][1];
		options.onError(new Error("network"));
		expect(toast.error).toHaveBeenCalled();
		expect(mockNavigate).not.toHaveBeenCalled();
	});
});
