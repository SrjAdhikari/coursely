//* test/routes/guards.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useSearchParams } from "react-router";
import type { ComponentType } from "react";

/** Renders the `redirect` search param so tests can assert the return-to path. */
const RedirectProbe = () => {
	const [params] = useSearchParams();
	return <div data-testid="redirect">{params.get("redirect")}</div>;
};

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
				<Route path="/admin" element={<div>admin area</div>} />
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

		it("sends an unauthenticated user to login with a return-to redirect", () => {
			mockUseCurrentUser.mockReturnValue(unauthed);
			render(
				<MemoryRouter initialEntries={["/my-courses"]}>
					<Routes>
						<Route element={<ProtectedRoute />}>
							<Route path="/my-courses" element={<div>my courses</div>} />
						</Route>
						<Route path="/login" element={<RedirectProbe />} />
					</Routes>
				</MemoryRouter>,
			);
			expect(screen.getByTestId("redirect")).toHaveTextContent("/my-courses");
		});
	});

	describe("GuestRoute", () => {
		it("renders the outlet when unauthenticated", () => {
			mockUseCurrentUser.mockReturnValue(unauthed);
			renderGuard(GuestRoute);
			expect(screen.getByText("secret content")).toBeInTheDocument();
		});

		it("redirects an authenticated student to /dashboard", () => {
			mockUseCurrentUser.mockReturnValue(authed("student"));
			renderGuard(GuestRoute);
			expect(screen.getByText("dashboard")).toBeInTheDocument();
		});

		it("redirects an authenticated admin to /admin", () => {
			mockUseCurrentUser.mockReturnValue(authed("admin"));
			renderGuard(GuestRoute);
			expect(screen.getByText("admin area")).toBeInTheDocument();
		});

		it("returns an authenticated user to a safe ?redirect path", () => {
			mockUseCurrentUser.mockReturnValue(authed("student"));
			render(
				<MemoryRouter initialEntries={["/login?redirect=%2Fcourses%2Freact"]}>
					<Routes>
						<Route element={<GuestRoute />}>
							<Route path="/login" element={<div>login page</div>} />
						</Route>
						<Route path="/courses/:slug" element={<div>course detail</div>} />
						<Route path="/dashboard" element={<div>dashboard</div>} />
					</Routes>
				</MemoryRouter>,
			);
			expect(screen.getByText("course detail")).toBeInTheDocument();
		});

		it("ignores an unsafe protocol-relative ?redirect", () => {
			mockUseCurrentUser.mockReturnValue(authed("student"));
			render(
				<MemoryRouter initialEntries={["/login?redirect=%2F%2Fevil.com"]}>
					<Routes>
						<Route element={<GuestRoute />}>
							<Route path="/login" element={<div>login page</div>} />
						</Route>
						<Route path="/dashboard" element={<div>dashboard</div>} />
					</Routes>
				</MemoryRouter>,
			);
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
