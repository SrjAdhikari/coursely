//* test/routes/guards.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import type { ComponentType } from "react";

const mockUseCurrentUser = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
	useCurrentUser: () => mockUseCurrentUser(),
}));

import ProtectedRoute from "@/routes/ProtectedRoute";
import GuestRoute from "@/routes/GuestRoute";
import AdminRoute from "@/routes/AdminRoute";

const renderGuard = (Guard: ComponentType) =>
	render(
		<MemoryRouter initialEntries={["/secret"]}>
			<Routes>
				<Route element={<Guard />}>
					<Route path="/secret" element={<div>secret content</div>} />
				</Route>
				<Route path="/login" element={<div>login page</div>} />
				<Route path="/dashboard" element={<div>dashboard</div>} />
			</Routes>
		</MemoryRouter>,
	);

const authed = (role: "student" | "admin") => ({
	data: { data: { id: "1", name: "Asha", email: "asha@example.com", role } },
	isLoading: false,
	isError: false,
});
const loading = { data: undefined, isLoading: true, isError: false };
const unauthed = { data: undefined, isLoading: false, isError: true };

describe("route guards", () => {
	beforeEach(() => vi.clearAllMocks());

	describe("ProtectedRoute", () => {
		it("shows the loader while the auth check is in flight", () => {
			mockUseCurrentUser.mockReturnValue(loading);
			renderGuard(ProtectedRoute);
			expect(screen.getByRole("status")).toBeInTheDocument();
		});

		it("redirects to /login when unauthenticated", () => {
			mockUseCurrentUser.mockReturnValue(unauthed);
			renderGuard(ProtectedRoute);
			expect(screen.getByText("login page")).toBeInTheDocument();
		});

		it("renders the outlet when authenticated", () => {
			mockUseCurrentUser.mockReturnValue(authed("student"));
			renderGuard(ProtectedRoute);
			expect(screen.getByText("secret content")).toBeInTheDocument();
		});
	});

	describe("GuestRoute", () => {
		it("renders the outlet when unauthenticated", () => {
			mockUseCurrentUser.mockReturnValue(unauthed);
			renderGuard(GuestRoute);
			expect(screen.getByText("secret content")).toBeInTheDocument();
		});

		it("redirects to /dashboard when authenticated", () => {
			mockUseCurrentUser.mockReturnValue(authed("student"));
			renderGuard(GuestRoute);
			expect(screen.getByText("dashboard")).toBeInTheDocument();
		});
	});

	describe("AdminRoute", () => {
		it("redirects a signed-in student to /dashboard", () => {
			mockUseCurrentUser.mockReturnValue(authed("student"));
			renderGuard(AdminRoute);
			expect(screen.getByText("dashboard")).toBeInTheDocument();
		});

		it("renders the outlet for an admin", () => {
			mockUseCurrentUser.mockReturnValue(authed("admin"));
			renderGuard(AdminRoute);
			expect(screen.getByText("secret content")).toBeInTheDocument();
		});
	});
});
