//* test/api/auth.api.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/config/axiosClient", () => ({
	default: { post: vi.fn() },
}));

import axiosClient from "@/config/axiosClient";
import {
	verifyEmail,
	resendVerification,
	forgotPassword,
	resetPassword,
} from "@/api/auth.api";

const ok = () => ({ data: { success: true, message: "ok", data: undefined } });

describe("auth.api verification + reset wrappers", () => {
	beforeEach(() => vi.clearAllMocks());

	it("POSTs the token to the verify-email endpoint", async () => {
		vi.mocked(axiosClient.post).mockResolvedValue(ok());
		await verifyEmail({ token: "raw-token" });
		expect(axiosClient.post).toHaveBeenCalledWith("/auth/verify-email", {
			token: "raw-token",
		});
	});

	it("POSTs the email to the resend-verification endpoint", async () => {
		vi.mocked(axiosClient.post).mockResolvedValue(ok());
		await resendVerification({ email: "asha@example.com" });
		expect(axiosClient.post).toHaveBeenCalledWith("/auth/resend-verification", {
			email: "asha@example.com",
		});
	});

	it("POSTs the email to the forgot-password endpoint", async () => {
		vi.mocked(axiosClient.post).mockResolvedValue(ok());
		await forgotPassword({ email: "asha@example.com" });
		expect(axiosClient.post).toHaveBeenCalledWith("/auth/forgot-password", {
			email: "asha@example.com",
		});
	});

	it("POSTs the token and new password to the reset-password endpoint", async () => {
		vi.mocked(axiosClient.post).mockResolvedValue(ok());
		await resetPassword({ token: "raw-token", newPassword: "Password1!" });
		expect(axiosClient.post).toHaveBeenCalledWith("/auth/reset-password", {
			token: "raw-token",
			newPassword: "Password1!",
		});
	});
});
