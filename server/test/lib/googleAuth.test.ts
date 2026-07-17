//* test/lib/googleAuth.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";

// Control the OAuth2Client's verifyIdToken across tests.
const { verifyIdTokenMock } = vi.hoisted(() => ({ verifyIdTokenMock: vi.fn() }));
vi.mock("google-auth-library", () => ({
	OAuth2Client: class {
		verifyIdToken = verifyIdTokenMock;
	},
}));

import verifyGoogleIdToken from "../../src/lib/googleAuth";

const ticketWith = (payload: unknown) => ({ getPayload: () => payload });

describe("verifyGoogleIdToken", () => {
	beforeEach(() => vi.clearAllMocks());

	it("returns the normalized identity for a valid token", async () => {
		verifyIdTokenMock.mockResolvedValue(
			ticketWith({
				email: "Asha@Example.com",
				email_verified: true,
				name: "Asha Rai",
				picture: "https://lh3.googleusercontent.com/a/pic",
			}),
		);

		const identity = await verifyGoogleIdToken("valid-token");

		expect(identity).toEqual({
			email: "asha@example.com", // lowercased
			name: "Asha Rai",
			emailVerified: true,
			avatarUrl: "https://lh3.googleusercontent.com/a/pic",
		});
	});

	it("throws 401 INVALID_ID_TOKEN when verification fails", async () => {
		verifyIdTokenMock.mockRejectedValue(new Error("bad signature"));
		await expect(verifyGoogleIdToken("bad")).rejects.toMatchObject({
			statusCode: 401,
			errorCode: "INVALID_ID_TOKEN",
		});
	});

	it("throws 401 INVALID_ID_TOKEN when the email claim is missing", async () => {
		verifyIdTokenMock.mockResolvedValue(ticketWith({ name: "No Email" }));
		await expect(verifyGoogleIdToken("no-email")).rejects.toMatchObject({
			statusCode: 401,
			errorCode: "INVALID_ID_TOKEN",
		});
	});
});
