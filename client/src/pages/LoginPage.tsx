//* src/pages/LoginPage.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import AppLogo from "@/components/common/AppLogo";
import FormField from "@/components/form/FormField";
import AlertBanner from "@/components/ui/alert-banner";
import EmailVerificationPrompt from "@/components/auth/EmailVerificationPrompt";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import AuthDivider from "@/components/auth/AuthDivider";

import { cn } from "@/lib/utils";
import { CURRENT_USER_KEY } from "@/lib/queryKeys";

import ROUTES from "@/routes/paths";
import { useLogin, useGoogleSignIn } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";

const tabClass = (active: boolean) =>
	cn(
		"flex-1 rounded-full py-2 text-center font-mono text-sm transition",
		active
			? "bg-primary font-bold text-primary-foreground"
			: "text-muted-foreground hover:text-foreground",
	);

const LoginPage = () => {
	const { mutate, isPending: isLoggingIn } = useLogin();
	const { mutate: googleSignIn, isPending: isGooglePending } =
		useGoogleSignIn();
	const isSubmitting = isLoggingIn || isGooglePending;

	const queryClient = useQueryClient();
	const [authError, setAuthError] = useState<string | null>(null);
	const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

	// Preserve any post-auth redirect target when switching between the tabs.
	const [searchParams] = useSearchParams();
	const redirect = searchParams.get("redirect");
	const withRedirect = (path: string) =>
		redirect ? `${path}?redirect=${encodeURIComponent(redirect)}` : path;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isValid },
	} = useForm<LoginFormData>({
		mode: "onChange",
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = (values: LoginFormData) => {
		setAuthError(null);
		setUnverifiedEmail(null);
		mutate(values, {
			onSuccess: () => {
				reset();
				queryClient.invalidateQueries({ queryKey: CURRENT_USER_KEY });
			},
			onError: (error) => {
				// A correct password on an unverified account - offer a resend,
				// not a generic error. Every other failure stays generic.
				if (error.code === "EMAIL_NOT_VERIFIED")
					setUnverifiedEmail(values.email);
				else setAuthError(error.message);
			},
		});
	};

	const handleGoogleSuccess = (idToken: string) => {
		setAuthError(null);
		setUnverifiedEmail(null);
		googleSignIn(
			{ idToken },
			{
				onSuccess: () =>
					queryClient.invalidateQueries({ queryKey: CURRENT_USER_KEY }),
				onError: (error) => setAuthError(error.message),
			},
		);
	};

	const handleGoogleError = () => {
		setAuthError("Google sign-in didn't complete. Please try again.");
	};

	return (
		<div className="w-full max-w-100 rounded-xl border border-input bg-card p-8">
			<AppLogo className="mb-6 justify-center" />

			<div className="mb-8 flex gap-1 rounded-full border bg-background p-1">
				<Link to={withRedirect(ROUTES.LOGIN)} className={tabClass(true)}>
					Log in
				</Link>

				<Link to={withRedirect(ROUTES.REGISTER)} className={tabClass(false)}>
					Sign up
				</Link>
			</div>

			<GoogleSignInButton
				onSuccess={handleGoogleSuccess}
				onError={handleGoogleError}
				disabled={isSubmitting}
			/>

			<AuthDivider />

			{authError && (
				<AlertBanner variant="error" className="mb-4">
					{authError}
				</AlertBanner>
			)}

			{unverifiedEmail && (
				<EmailVerificationPrompt email={unverifiedEmail} className="mb-4" />
			)}

			<form
				onSubmit={handleSubmit(onSubmit)}
				noValidate
				className="space-y-6 mb-3"
			>
				<FormField
					label="Email"
					id="email"
					type="email"
					autoComplete="off"
					placeholder="Enter your email address"
					error={errors.email?.message}
					{...register("email")}
				/>

				<FormField
					label="Password"
					id="password"
					type="password"
					autoComplete="off"
					placeholder="Enter your password"
					labelExtra={
						<Link
							to={ROUTES.FORGOT_PASSWORD}
							className="text-xs text-muted-foreground hover:text-primary hover:underline cursor-pointer"
						>
							Forgot password?
						</Link>
					}
					error={errors.password?.message}
					{...register("password")}
				/>

				<Button
					type="submit"
					disabled={isSubmitting || !isValid}
					className="w-full h-11 cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary"
				>
					<span className="text-base font-medium">
						{isLoggingIn ? "Signing in..." : "Sign in"}
					</span>
				</Button>
			</form>
		</div>
	);
};

export default LoginPage;
