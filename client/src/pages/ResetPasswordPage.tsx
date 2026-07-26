//* src/pages/ResetPasswordPage.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import AppLogo from "@/components/common/AppLogo";
import FormField from "@/components/form/FormField";
import AlertBanner from "@/components/ui/alert-banner";

import ROUTES from "@/routes/paths";
import { useResetPassword } from "@/hooks/useAuth";
import {
	resetPasswordSchema,
	type ResetPasswordFormData,
} from "@/schemas/auth.schema";

const ResetPasswordPage = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token") ?? "";

	const { mutate: resetPassword, isPending } = useResetPassword();
	const [succeeded, setSucceeded] = useState(false);
	const [authError, setAuthError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<ResetPasswordFormData>({
		mode: "onChange",
		resolver: zodResolver(resetPasswordSchema),
	});

	const onSubmit = (values: ResetPasswordFormData) => {
		setAuthError(null);
		resetPassword(
			{ token, newPassword: values.newPassword },
			{
				onSuccess: () => setSucceeded(true),
				onError: (error) => setAuthError(error.message),
			},
		);
	};

	if (!token) {
		return (
			<div className="w-full max-w-100 rounded-xl border border-input bg-card p-8">
				<AppLogo className="mb-6 justify-center" />
				<AlertBanner variant="error">
					This password reset link is invalid or has expired. Please request a
					new one.
				</AlertBanner>

				<Link
					to={ROUTES.FORGOT_PASSWORD}
					className="mt-6 block text-center text-sm text-muted-foreground hover:text-primary hover:underline"
				>
					Request a new link
				</Link>
			</div>
		);
	}

	if (succeeded) {
		return (
			<div className="w-full max-w-100 rounded-xl border border-input bg-card p-8">
				<AppLogo className="mb-6 justify-center" />
				<AlertBanner variant="info">
					Your password has been reset. Please log in with your new password.
				</AlertBanner>

				<Button asChild className="mt-6 h-11 w-full">
					<Link to={ROUTES.LOGIN}>Go to log in</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="w-full max-w-100 rounded-xl border border-input bg-card p-8">
			<AppLogo className="mb-6 justify-center" />

			<div className="mb-6 text-center">
				<h1 className="text-xl">Set a new password</h1>
			</div>

			{authError && (
				<AlertBanner variant="error" className="mb-4">
					{authError}
				</AlertBanner>
			)}

			<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
				<FormField
					label="New password"
					id="newPassword"
					type="password"
					autoComplete="off"
					placeholder="Enter a new password"
					error={errors.newPassword?.message}
					{...register("newPassword")}
				/>

				<FormField
					label="Confirm password"
					id="confirmPassword"
					type="password"
					autoComplete="off"
					placeholder="Re-enter your new password"
					error={errors.confirmPassword?.message}
					{...register("confirmPassword")}
				/>

				<Button
					type="submit"
					disabled={isPending || !isValid}
					className="w-full h-11 cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary"
				>
					<span className="text-base font-medium">
						{isPending ? "Resetting..." : "Reset password"}
					</span>
				</Button>
			</form>
		</div>
	);
};

export default ResetPasswordPage;
