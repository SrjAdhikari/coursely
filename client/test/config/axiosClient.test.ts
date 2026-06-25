//* test/config/axiosClient.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	AxiosError,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from "axios";

// vi.hoisted so the mock factory (which is hoisted above this file) can safely
// reference the spy without hitting its temporal dead zone.
const { removeQueries } = vi.hoisted(() => ({ removeQueries: vi.fn() }));
vi.mock("@/config/queryClient", () => ({ default: { removeQueries } }));

import axiosClient from "@/config/axiosClient";
import { CURRENT_USER_KEY } from "@/lib/queryKeys";
import ROUTES from "@/routes/paths";

// The eviction handler is the rejection arm of the (single) response interceptor.
const rejectionHandler = (
	axiosClient.interceptors.response as unknown as {
		handlers: { rejected: (error: unknown) => Promise<unknown> }[];
	}
).handlers[0].rejected;

// A real AxiosError so it flows through the production normalizeError path
// (normalizeError gates on `error instanceof AxiosError`).
const makeAxiosError = (code: string, url: string): AxiosError => {
	const error = new AxiosError("nope");
	error.config = { url } as InternalAxiosRequestConfig;
	error.response = {
		data: { status: "fail", error: { code, message: "nope" } },
	} as AxiosResponse;
	return error;
};

const atPath = (pathname: string) =>
	vi.stubGlobal("location", { pathname, href: pathname });

describe("axios eviction interceptor", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		atPath(ROUTES.DASHBOARD); // a protected, non-public path
	});

	afterEach(() => vi.unstubAllGlobals());

	it("evicts the cached user and redirects to login on an eviction code", async () => {
		await expect(
			rejectionHandler(makeAxiosError("UNAUTHORIZED_ACCESS", "/courses/abc")),
		).rejects.toMatchObject({ code: "UNAUTHORIZED_ACCESS" });

		expect(removeQueries).toHaveBeenCalledWith({ queryKey: CURRENT_USER_KEY });
		expect(window.location.href).toBe(ROUTES.LOGIN);
	});

	it("does NOT evict on the /auth/me probe (route guards own first-load)", async () => {
		await expect(
			rejectionHandler(makeAxiosError("UNAUTHORIZED_ACCESS", "/auth/me")),
		).rejects.toMatchObject({ code: "UNAUTHORIZED_ACCESS" });

		expect(removeQueries).not.toHaveBeenCalled();
		expect(window.location.href).toBe(ROUTES.DASHBOARD);
	});

	it("does NOT evict while already on a public page", async () => {
		atPath(ROUTES.LOGIN);

		await expect(
			rejectionHandler(makeAxiosError("UNAUTHORIZED_ACCESS", "/courses/abc")),
		).rejects.toMatchObject({ code: "UNAUTHORIZED_ACCESS" });

		expect(removeQueries).not.toHaveBeenCalled();
		expect(window.location.href).toBe(ROUTES.LOGIN);
	});

	it("does NOT evict on a non-eviction error code", async () => {
		await expect(
			rejectionHandler(makeAxiosError("VALIDATION_ERROR", "/courses/abc")),
		).rejects.toMatchObject({ code: "VALIDATION_ERROR" });

		expect(removeQueries).not.toHaveBeenCalled();
		expect(window.location.href).toBe(ROUTES.DASHBOARD);
	});
});
