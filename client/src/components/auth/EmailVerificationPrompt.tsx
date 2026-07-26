//* src/components/auth/EmailVerificationPrompt.tsx

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import AlertBanner from "@/components/ui/alert-banner";
import { cn } from "@/lib/utils";
import { useResendVerification } from "@/hooks/useAuth";
import useCountdown from "@/hooks/useCountdown";

interface EmailVerificationPromptProps {
	email: string;
	className?: string;
}

/**
 * Post-signup / unverified-login prompt: confirms where the link went and offers a
 * resend. Success toasts and starts the button cooldown; failure shows an inline error.
 */
const EmailVerificationPrompt = ({
	email,
	className,
}: EmailVerificationPromptProps) => {
	const { mutate: resend, isPending } = useResendVerification();
	const { secondsLeft, start: startCooldown } = useCountdown();
	const [resendError, setResendError] = useState<string | null>(null);

	const handleResend = () => {
		setResendError(null);
		resend(
			{ email },
			{
				onSuccess: () => {
					toast.success("Verification email sent");
					startCooldown(60); // mirror the backend's 60s resend cooldown
				},
				onError: (error) => setResendError(error.message),
			},
		);
	};

	const onCooldown = secondsLeft > 0;

	return (
		<div className={cn("space-y-4", className)}>
			<AlertBanner variant="info">
				We've sent a verification link to <strong>{email}</strong>. Open it to
				activate your account, then log in.
			</AlertBanner>

			{resendError && <AlertBanner variant="error">{resendError}</AlertBanner>}

			<Button
				type="button"
				variant="outline"
				onClick={handleResend}
				disabled={isPending || onCooldown}
				className="h-11 w-full"
			>
				{onCooldown
					? `Resend in ${secondsLeft}s`
					: "Resend verification email"}
			</Button>
		</div>
	);
};

export default EmailVerificationPrompt;
