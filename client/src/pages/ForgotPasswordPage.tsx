//* src/pages/ForgotPasswordPage.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import AppLogo from "@/components/common/AppLogo";
import FormField from "@/components/form/FormField";
import AlertBanner from "@/components/ui/alert-banner";

import ROUTES from "@/routes/paths";
import { useForgotPassword } from "@/hooks/useAuth";
import {
	forgotPasswordSchema,
	type ForgotPasswordFormData,
} from "@/schemas/auth.schema";

const ForgotPasswordPage = () => {
	const { mutate: requestReset, isPending } = useForgotPassword();
	const [submitted, setSubmitted] = useState(false);
	const [authError, setAuthError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<ForgotPasswordFormData>({
		mode: "onChange",
		resolver: zodResolver(forgotPasswordSchema),
	});

	const onSubmit = (values: ForgotPasswordFormData) => {
		setAuthError(null);
		requestReset(values, {
			onSuccess: () => setSubmitted(true),
			onError: (error) => setAuthError(error.message),
		});
	};

	return (
		<div className="w-full max-w-100 rounded-xl border border-input bg-card p-8">
			<AppLogo className="mb-6 justify-center" />

			{submitted ? (
				<div className="space-y-6">
					<AlertBanner variant="info">
						If an account exists for that email, we've sent a link to reset your
						password.
					</AlertBanner>

					<Link
						to={ROUTES.LOGIN}
						className="block text-center text-sm text-muted-foreground hover:text-foreground"
					>
						Back to log in
					</Link>
				</div>
			) : (
				<>
					<div className="mb-6 text-center">
						<h1 className="text-xl">Forgot your password?</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							Enter your email and we'll send you a link to reset it.
						</p>
					</div>

					{authError && (
						<AlertBanner variant="error" className="mb-4">
							{authError}
						</AlertBanner>
					)}

					<form
						onSubmit={handleSubmit(onSubmit)}
						noValidate
						className="space-y-6"
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

						<Button
							type="submit"
							disabled={isPending || !isValid}
							className="w-full h-11 cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary"
						>
							<span className="text-base font-medium">
								{isPending ? "Sending..." : "Send reset link"}
							</span>
						</Button>
					</form>

					<Link
						to={ROUTES.LOGIN}
						className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground"
					>
						Back to log in
					</Link>
				</>
			)}
		</div>
	);
};

export default ForgotPasswordPage;
