//* test/services/auth.service.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";

const {
	verifyGoogleIdTokenMock,
	sendVerificationEmailMock,
	sendPasswordResetEmailMock,
} = vi.hoisted(() => ({
	verifyGoogleIdTokenMock: vi.fn(),
	sendVerificationEmailMock: vi.fn(),
	sendPasswordResetEmailMock: vi.fn(),
}));
vi.mock("../../src/lib/googleAuth", () => ({ default: verifyGoogleIdTokenMock }));
vi.mock("../../src/services/email.service", () => ({
	sendVerificationEmail: sendVerificationEmailMock,
	sendPasswordResetEmail: sendPasswordResetEmailMock,
}));

import {
	registerUser,
	loginUser,
	logoutUser,
	loginOrCreateGoogleUser,
	verifyEmail,
	resendVerificationLink,
	forgotPassword,
	resetPassword,
} from "../../src/services/auth.service";
import User from "../../src/models/user.model";
import Session from "../../src/models/session.model";
import Token from "../../src/models/token.model";
import { issueToken } from "../../src/services/token.service";
import { ONE_MINUTE_MS } from "../../src/utils/date";
import { hashToken } from "../../src/utils/token";
import { createTestUser, createTestSession } from "../helpers/factories";

describe("auth.service", () => {
	describe("registerUser", () => {
		beforeEach(() => vi.clearAllMocks());

		it("creates a student with a hashed password and issues no session (login mints the session)", async () => {
			const result = await registerUser(
				"Asha",
				"asha@example.com",
				"Password123",
			);
			expect(result).toBeUndefined();

			const stored = await User.findOne({ email: "asha@example.com" }).select(
				"+password",
			);
			expect(stored?.name).toBe("Asha");
			expect(stored?.role).toBe("student");
			expect(stored?.password).not.toBe("Password123");
			expect(await Session.countDocuments({ userId: stored?._id })).toBe(0);
		});

		it("does not throw or create a duplicate for a taken email (no enumeration)", async () => {
			await createTestUser({ email: "dupe@example.com" });

			await expect(
				registerUser("Dupe User", "dupe@example.com", "Password123"),
			).resolves.toBeUndefined();

			expect(await User.countDocuments({ email: "dupe@example.com" })).toBe(1);
		});

		it("creates an unverified user and issues a verification token", async () => {
			await registerUser("Asha", "verify-me@example.com", "Password123");

			const stored = await User.findOne({ email: "verify-me@example.com" });
			expect(stored?.isVerified).toBe(false);
			expect(
				await Token.countDocuments({
					userId: stored?._id,
					type: "email_verification",
				}),
			).toBe(1);
			expect(sendVerificationEmailMock).toHaveBeenCalledWith(
				"Asha",
				"verify-me@example.com",
				expect.stringContaining("/verify-email?token="),
			);
		});

		it("issues no token and sends no email for a taken email (no create, no enumeration)", async () => {
			await createTestUser({ email: "taken2@example.com" });

			await registerUser("Dupe", "taken2@example.com", "Password123");

			expect(await User.countDocuments({ email: "taken2@example.com" })).toBe(1);
			expect(await Token.countDocuments()).toBe(0);
			expect(sendVerificationEmailMock).not.toHaveBeenCalled();
		});
	});

	describe("loginUser", () => {
		it("returns a random session token backed by a hash-only session", async () => {
			await createTestUser({ email: "ok@example.com", password: "Password123" });
			const token = await loginUser("ok@example.com", "Password123");

			// A high-entropy token, NOT a Mongo ObjectId.
			expect(token).not.toMatch(/^[a-f0-9]{24}$/);

			// Only the hash is persisted; the raw token is never stored.
			const stored = await Session.findOne({
				tokenHash: hashToken(token),
			});
			expect(stored).not.toBeNull();
			expect(stored?.tokenHash).not.toBe(token);
		});

		it("rejects a wrong password with a generic 401 INVALID_CREDENTIALS", async () => {
			await createTestUser({ email: "ok2@example.com", password: "Password123" });
			await expect(
				loginUser("ok2@example.com", "WrongPass1"),
			).rejects.toMatchObject({
				statusCode: 401,
				errorCode: "INVALID_CREDENTIALS",
			});
		});

		it("rejects an unknown email with the SAME generic 401 (no enumeration)", async () => {
			await expect(
				loginUser("ghost@example.com", "Password123"),
			).rejects.toMatchObject({
				statusCode: 401,
				errorCode: "INVALID_CREDENTIALS",
			});
		});

		it("blocks a deactivated account with 403 ACCOUNT_DEACTIVATED", async () => {
			await createTestUser({
				email: "off@example.com",
				password: "Password123",
				isActive: false,
			});
			await expect(
				loginUser("off@example.com", "Password123"),
			).rejects.toMatchObject({
				statusCode: 403,
				errorCode: "ACCOUNT_DEACTIVATED",
			});
		});

		it("blocks an unverified account with 403 EMAIL_NOT_VERIFIED after a correct password", async () => {
			await createTestUser({
				email: "unver@example.com",
				password: "Password123",
				isVerified: false,
			});
			await expect(
				loginUser("unver@example.com", "Password123"),
			).rejects.toMatchObject({
				statusCode: 403,
				errorCode: "EMAIL_NOT_VERIFIED",
			});
		});

		it("mints a distinct token on every login (fixation defense, R2.1)", async () => {
			await createTestUser({ email: "re@example.com", password: "Password123" });
			const first = await loginUser("re@example.com", "Password123");
			const second = await loginUser("re@example.com", "Password123");
			expect(first).not.toBe(second);
		});
	});

	describe("logoutUser", () => {
		it("deletes the session document server-side", async () => {
			const user = await createTestUser({ email: "bye@example.com" });
			const { session } = await createTestSession(user._id);
			await logoutUser(session._id.toString());
			expect(await Session.findById(session._id)).toBeNull();
		});
	});
});

describe("loginOrCreateGoogleUser", () => {
	beforeEach(() => vi.clearAllMocks());

	const identity = (over = {}) => ({
		email: "asha@example.com",
		name: "Asha Rai",
		emailVerified: true,
		avatarUrl: "https://lh3.googleusercontent.com/a/pic",
		...over,
	});

	it("creates a new Google user (with avatar) and mints a session", async () => {
		verifyGoogleIdTokenMock.mockResolvedValue(identity());

		const result = await loginOrCreateGoogleUser("tok");

		expect(result.isNewUser).toBe(true);
		const user = await User.findOne({ email: "asha@example.com" });
		expect(user?.provider).toBe("google");
		expect(user?.avatarUrl).toBe("https://lh3.googleusercontent.com/a/pic");
		expect(
			await Session.findOne({ tokenHash: hashToken(result.token) }),
		).not.toBeNull();
	});

	it("creates Google users pre-verified", async () => {
		verifyGoogleIdTokenMock.mockResolvedValue(identity());

		await loginOrCreateGoogleUser("tok");

		const user = await User.findOne({ email: "asha@example.com" });
		expect(user?.isVerified).toBe(true);
	});

	it("logs in a returning Google user (isNewUser=false)", async () => {
		await User.create({
			name: "Asha Rai",
			email: "asha@example.com",
			provider: "google",
		});
		verifyGoogleIdTokenMock.mockResolvedValue(identity());

		const result = await loginOrCreateGoogleUser("tok");

		expect(result.isNewUser).toBe(false);
		expect(await User.countDocuments({ email: "asha@example.com" })).toBe(1);
	});

	it("rejects a Google sign-in on a password account with 409 PROVIDER_MISMATCH", async () => {
		await createTestUser({ email: "asha@example.com", password: "Password123" });
		verifyGoogleIdTokenMock.mockResolvedValue(identity());

		await expect(loginOrCreateGoogleUser("tok")).rejects.toMatchObject({
			statusCode: 409,
			errorCode: "PROVIDER_MISMATCH",
		});
		expect(await Session.countDocuments()).toBe(0);
	});

	it("rejects an unverified Google email with 403 GOOGLE_EMAIL_NOT_VERIFIED", async () => {
		verifyGoogleIdTokenMock.mockResolvedValue(identity({ emailVerified: false }));
		await expect(loginOrCreateGoogleUser("tok")).rejects.toMatchObject({
			statusCode: 403,
			errorCode: "GOOGLE_EMAIL_NOT_VERIFIED",
		});
		expect(await User.countDocuments()).toBe(0);
	});

	it("blocks a deactivated Google account with 403 ACCOUNT_DEACTIVATED", async () => {
		await User.create({
			name: "Asha Rai",
			email: "asha@example.com",
			provider: "google",
			isActive: false,
		});
		verifyGoogleIdTokenMock.mockResolvedValue(identity());
		await expect(loginOrCreateGoogleUser("tok")).rejects.toMatchObject({
			statusCode: 403,
			errorCode: "ACCOUNT_DEACTIVATED",
		});
	});

	it("sanitizes the Google name and accepts formats the email rules forbid", async () => {
		verifyGoogleIdTokenMock.mockResolvedValue(
			identity({ name: "<b>J. R.</b> Smith" }),
		);

		const result = await loginOrCreateGoogleUser("tok");

		expect(result.isNewUser).toBe(true);
		const user = await User.findOne({ email: "asha@example.com" });
		// HTML stripped; the period (forbidden for email names) is kept for Google.
		expect(user?.name).toBe("J. R. Smith");
	});
});

describe("verifyEmail", () => {
	it("marks the account verified for a valid token and consumes it", async () => {
		const user = await createTestUser({ isVerified: false });
		const rawToken = await issueToken(user._id, "email_verification");

		await verifyEmail(rawToken);

		const updated = await User.findById(user._id);
		expect(updated?.isVerified).toBe(true);
		expect(await Token.countDocuments({ userId: user._id })).toBe(0);
	});

	it("throws 400 INVALID_OR_EXPIRED_TOKEN for a bad token", async () => {
		await expect(verifyEmail("nope")).rejects.toMatchObject({
			statusCode: 400,
			errorCode: "INVALID_OR_EXPIRED_TOKEN",
		});
	});
});

describe("resendVerificationLink", () => {
	beforeEach(() => vi.clearAllMocks());

	it("issues a new verification token for an eligible unverified account", async () => {
		const user = await createTestUser({ isVerified: false });

		await resendVerificationLink(user.email);

		expect(
			await Token.countDocuments({
				userId: user._id,
				type: "email_verification",
			}),
		).toBe(1);
		expect(sendVerificationEmailMock).toHaveBeenCalledWith(
			user.name,
			user.email,
			expect.stringContaining("/verify-email?token="),
		);
	});

	it("does nothing for an already-verified account", async () => {
		const user = await createTestUser({ isVerified: true });

		await resendVerificationLink(user.email);

		expect(await Token.countDocuments({ userId: user._id })).toBe(0);
		expect(sendVerificationEmailMock).not.toHaveBeenCalled();
	});

	it("does nothing (no throw) for an unknown email", async () => {
		await expect(
			resendVerificationLink("ghost@example.com"),
		).resolves.toBeUndefined();
		expect(sendVerificationEmailMock).not.toHaveBeenCalled();
	});

	it("does nothing for a Google account", async () => {
		const user = await User.create({
			name: "G User",
			email: "g@example.com",
			provider: "google",
		});

		await resendVerificationLink(user.email);

		expect(await Token.countDocuments({ userId: user._id })).toBe(0);
		expect(sendVerificationEmailMock).not.toHaveBeenCalled();
	});

	it("sends nothing while a just-issued link is still on cooldown", async () => {
		const user = await createTestUser({ isVerified: false });
		await issueToken(user._id, "email_verification");

		await resendVerificationLink(user.email);

		expect(sendVerificationEmailMock).not.toHaveBeenCalled();
	});

	it("sends again once the cooldown has elapsed", async () => {
		const user = await createTestUser({ isVerified: false });
		await issueToken(user._id, "email_verification");
		await Token.updateOne(
			{ userId: user._id, type: "email_verification" },
			{ $set: { createdAt: new Date(Date.now() - 2 * ONE_MINUTE_MS) } },
		);

		await resendVerificationLink(user.email);

		expect(sendVerificationEmailMock).toHaveBeenCalledTimes(1);
	});
});

describe("forgotPassword", () => {
	beforeEach(() => vi.clearAllMocks());

	it("issues a reset token for a password account", async () => {
		const user = await createTestUser({ email: "fp@example.com" });

		await forgotPassword("fp@example.com");

		expect(
			await Token.countDocuments({
				userId: user._id,
				type: "password_reset",
			}),
		).toBe(1);
	});

	it("emails a reset link to the account owner", async () => {
		const user = await createTestUser({ email: "fp2@example.com" });

		await forgotPassword("fp2@example.com");

		expect(sendPasswordResetEmailMock).toHaveBeenCalledWith(
			user.name,
			"fp2@example.com",
			expect.stringContaining("/reset-password?token="),
		);
	});

	it("does nothing (no throw) for an unknown email", async () => {
		await expect(forgotPassword("ghost@example.com")).resolves.toBeUndefined();
		expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
	});

	it("does nothing for a Google account", async () => {
		const user = await User.create({
			name: "G User",
			email: "g2@example.com",
			provider: "google",
		});

		await forgotPassword("g2@example.com");

		expect(await Token.countDocuments({ userId: user._id })).toBe(0);
		expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
	});

	it("sends nothing while a just-issued link is still on cooldown", async () => {
		const user = await createTestUser({ email: "fp3@example.com" });
		await issueToken(user._id, "password_reset");

		await forgotPassword("fp3@example.com");

		expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
	});

	it("sends again once the cooldown has elapsed", async () => {
		const user = await createTestUser({ email: "fp4@example.com" });
		await issueToken(user._id, "password_reset");
		await Token.updateOne(
			{ userId: user._id, type: "password_reset" },
			{ $set: { createdAt: new Date(Date.now() - 2 * ONE_MINUTE_MS) } },
		);

		await forgotPassword("fp4@example.com");

		expect(sendPasswordResetEmailMock).toHaveBeenCalledTimes(1);
	});
});

describe("resetPassword", () => {
	it("sets a new hashed password, verifies the account, and clears sessions", async () => {
		const user = await createTestUser({
			email: "rp@example.com",
			password: "OldPass123!",
			isVerified: false,
		});
		await createTestSession(user._id);
		const rawToken = await issueToken(user._id, "password_reset");

		await resetPassword(rawToken, "NewPass456!");

		const updated = await User.findById(user._id).select("+password");
		expect(updated!.password).not.toBe("NewPass456!");
		expect(await updated!.comparePassword("NewPass456!")).toBe(true);
		expect(updated!.isVerified).toBe(true);
		expect(await Session.countDocuments({ userId: user._id })).toBe(0);
		expect(await Token.countDocuments({ userId: user._id })).toBe(0);
	});

	it("throws 400 INVALID_OR_EXPIRED_TOKEN for a bad token", async () => {
		await expect(resetPassword("nope", "NewPass456!")).rejects.toMatchObject({
			statusCode: 400,
			errorCode: "INVALID_OR_EXPIRED_TOKEN",
		});
	});

	it("rolls the whole reset back when the session wipe fails", async () => {
		const user = await createTestUser({
			email: "rp2@example.com",
			password: "OldPass123!",
		});
		const rawToken = await issueToken(user._id, "password_reset");

		const deleteManySpy = vi
			.spyOn(Session, "deleteMany")
			.mockRejectedValue(new Error("session wipe failed"));
		await expect(resetPassword(rawToken, "NewPass456!")).rejects.toThrow(
			"session wipe failed",
		);
		deleteManySpy.mockRestore();

		// Token un-consumed and password untouched — the user can retry the link.
		expect(
			await Token.countDocuments({ userId: user._id, type: "password_reset" }),
		).toBe(1);
		const untouched = await User.findById(user._id).select("+password");
		expect(await untouched!.comparePassword("OldPass123!")).toBe(true);
	});
});

describe("loginUser on a Google-only account", () => {
	it("fails generically with 401 INVALID_CREDENTIALS (no password stored)", async () => {
		await User.create({
			name: "Asha Rai",
			email: "asha@example.com",
			provider: "google",
		});
		await expect(
			loginUser("asha@example.com", "AnyPassword1"),
		).rejects.toMatchObject({
			statusCode: 401,
			errorCode: "INVALID_CREDENTIALS",
		});
	});
});

describe("email send failures are non-fatal", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// The service logs the swallowed send error — silence it to keep output clean.
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("register still creates the account when the verification email fails to send", async () => {
		sendVerificationEmailMock.mockRejectedValueOnce(new Error("SMTP down"));

		await expect(
			registerUser("Asha", "smtp-fail@example.com", "Password123"),
		).resolves.toBeUndefined();

		const stored = await User.findOne({ email: "smtp-fail@example.com" });
		expect(stored).not.toBeNull();
	});

	it("resendVerificationLink does not throw when the send fails (reply stays generic)", async () => {
		const user = await createTestUser({ isVerified: false });
		sendVerificationEmailMock.mockRejectedValueOnce(new Error("SMTP down"));

		await expect(resendVerificationLink(user.email)).resolves.toBeUndefined();
	});

	it("forgotPassword does not throw when the send fails (reply stays generic)", async () => {
		await createTestUser({ email: "fp-fail@example.com" });
		sendPasswordResetEmailMock.mockRejectedValueOnce(new Error("SMTP down"));

		await expect(forgotPassword("fp-fail@example.com")).resolves.toBeUndefined();
	});
});
