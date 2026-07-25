//* src/pages/VerifyEmailPage.tsx

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import AppLogo from "@/components/common/AppLogo";
import FormField from "@/components/form/FormField";
import AlertBanner from "@/components/ui/alert-banner";
import Loader from "@/components/Loader";

import ROUTES from "@/routes/paths";
import { useVerifyEmail, useResendVerification } from "@/hooks/useAuth";
import {
	forgotPasswordSchema,
	type ForgotPasswordFormData,
} from "@/schemas/auth.schema";

type VerifyStatus = "verifying" | "success" | "error";

const VerifyEmailPage = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token") ?? "";

	const { mutate: verifyEmail } = useVerifyEmail();
	const { mutate: resend, isPending: isResending } = useResendVerification();

	const [status, setStatus] = useState<VerifyStatus>(
		token ? "verifying" : "error",
	);
	const [errorMessage, setErrorMessage] = useState(
		"This verification link is invalid or has expired.",
	);
	const [resent, setResent] = useState(false);
	const hasRequested = useRef(false);

	// Verify the token only once. React runs effects twice in development, and
	// the token is single-use, so the ref blocks the second run from wasting it.
	useEffect(() => {
		if (!token || hasRequested.current) return;
		hasRequested.current = true;
		verifyEmail(
			{ token },
			{
				onSuccess: () => setStatus("success"),
				onError: (error) => {
					setErrorMessage(error.message);
					setStatus("error");
				},
			},
		);
	}, [token, verifyEmail]);

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<ForgotPasswordFormData>({
		mode: "onChange",
		resolver: zodResolver(forgotPasswordSchema),
	});

	const onResend = (values: ForgotPasswordFormData) => {
		resend(values, {
			onSuccess: () => setResent(true),
			onError: (error) => setErrorMessage(error.message),
		});
	};

	return (
		<div className="w-full max-w-100 rounded-xl border border-input bg-card p-8">
			<AppLogo className="mb-6 justify-center" />

			{status === "verifying" && (
				<div className="space-y-4 text-center">
					<h1 className="text-xl">Verifying your email</h1>
					<Loader className="py-6" />
				</div>
			)}

			{status === "success" && (
				<div className="space-y-6 text-center">
					<h1 className="text-xl">Email verified</h1>
					<AlertBanner variant="info">
						Your email address is confirmed. You can now log in.
					</AlertBanner>
					<Button asChild className="h-11 w-full">
						<Link to={ROUTES.LOGIN}>Go to log in</Link>
					</Button>
				</div>
			)}

			{status === "error" && (
				<div className="space-y-6">
					<div className="text-center">
						<h1 className="text-xl">Verification failed</h1>
					</div>

					<AlertBanner variant="error">{errorMessage}</AlertBanner>

					{resent ? (
						<p className="text-center text-sm text-muted-foreground">
							If your account needs verifying, a new link is on its way.
						</p>
					) : (
						<form
							onSubmit={handleSubmit(onResend)}
							noValidate
							className="space-y-4"
						>
							<FormField
								label="Email"
								id="resend-email"
								type="email"
								autoComplete="off"
								placeholder="Enter your email address"
								error={errors.email?.message}
								{...register("email")}
							/>

							<Button
								type="submit"
								disabled={isResending || !isValid}
								className="w-full h-11 cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary"
							>
								{isResending ? "Sending..." : "Resend verification email"}
							</Button>
						</form>
					)}

					<Link
						to={ROUTES.LOGIN}
						className="block text-center text-sm text-muted-foreground hover:text-primary hover:underline"
					>
						Back to log in
					</Link>
				</div>
			)}
		</div>
	);
};

export default VerifyEmailPage;
