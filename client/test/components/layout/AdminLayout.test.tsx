//* test/components/layout/AdminLayout.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@/hooks/useAuth", () => ({
	useCurrentUser: () => ({
		data: { data: { name: "Asha Rai", role: "admin" } },
	}),
	useLogout: () => ({ mutate: vi.fn() }),
}));

import AdminLayout from "@/components/layout/AdminLayout";

const wrapper = ({ children }: { children: ReactNode }) => {
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe("AdminLayout", () => {
	it("renders the sidebar nav, the routed child, and the current user", () => {
		render(
			<MemoryRouter initialEntries={["/admin"]}>
				<Routes>
					<Route path="/admin" element={<AdminLayout />}>
						<Route index element={<div>Child screen</div>} />
					</Route>
				</Routes>
			</MemoryRouter>,
			{ wrapper },
		);
		expect(screen.getByRole("link", { name: /courses/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /students/i })).toBeInTheDocument();
		expect(screen.getByText("Child screen")).toBeInTheDocument();
		expect(screen.getByText("Asha Rai")).toBeInTheDocument();
	});
});
