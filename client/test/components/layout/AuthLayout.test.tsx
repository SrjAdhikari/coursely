//* test/components/layout/AuthLayout.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";

import AuthLayout from "@/components/layout/AuthLayout";

describe("AuthLayout", () => {
	it("renders a home logo link, a catalog link, and the routed child", () => {
		render(
			<MemoryRouter initialEntries={["/login"]}>
				<Routes>
					<Route element={<AuthLayout />}>
						<Route path="/login" element={<p>auth form</p>} />
					</Route>
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.getByRole("link", { name: /coursely/i })).toHaveAttribute(
			"href",
			"/",
		);
		expect(
			screen.getByRole("link", { name: /browse courses/i }),
		).toHaveAttribute("href", "/courses");
		expect(screen.getByText("auth form")).toBeInTheDocument(); // <Outlet/>
	});
});
