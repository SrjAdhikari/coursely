//* src/pages/LoginPage.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { GraduationCap } from "lucide-react";

import FormField from "@/components/form/FormField";
import { Button } from "@/components/ui/button";
import AlertBanner from "@/components/ui/alert-banner";
import { cn } from "@/lib/utils";
import { useLogin } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { CURRENT_USER_KEY } from "@/lib/queryKeys";
import ROUTES from "@/routes/paths";

const tabClass = (active: boolean) =>
	cn(
		"flex-1 rounded-full py-2 text-center font-mono text-sm transition",
		active
			? "bg-primary font-bold text-primary-foreground"
			: "text-muted-foreground hover:text-foreground",
	);

const LoginPage = () => {
	const { mutate, isPending } = useLogin();
	const queryClient = useQueryClient();
	const [authError, setAuthError] = useState<string | null>(null);

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
		mutate(values, {
			onSuccess: () => {
				reset();
				queryClient.invalidateQueries({ queryKey: CURRENT_USER_KEY });
			},
			onError: (error) => setAuthError(error.message),
		});
	};

	return (
		<div className="w-full max-w-100 rounded-xl border border-input bg-card p-8">
			<div className="mb-6 flex items-center justify-center gap-2 font-heading text-2xl font-bold">
				<GraduationCap className="size-7 text-primary" />
				Coursely
			</div>

			<div className="mb-8 flex gap-1 rounded-full border bg-background p-1">
				<Link to={ROUTES.LOGIN} className={tabClass(true)}>
					Log in
				</Link>

				<Link to={ROUTES.REGISTER} className={tabClass(false)}>
					Sign up
				</Link>
			</div>

			{authError && (
				<AlertBanner variant="error" className="mb-4">
					{authError}
				</AlertBanner>
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
					error={errors.password?.message}
					{...register("password")}
				/>

				<Button
					type="submit"
					disabled={isPending || !isValid}
					className="w-full h-11 font-mono cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary"
				>
					<span className="text-base font-medium">
						{isPending ? "Signing in..." : "Sign in"}
					</span>
				</Button>
			</form>
		</div>
	);
};

export default LoginPage;
