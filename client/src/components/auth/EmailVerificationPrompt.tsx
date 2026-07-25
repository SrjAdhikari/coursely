//* src/components/auth/EmailVerificationPrompt.tsx

import { useState } from "react";

import { Button } from "@/components/ui/button";
import AlertBanner from "@/components/ui/alert-banner";
import { cn } from "@/lib/utils";
import { useResendVerification } from "@/hooks/useAuth";

interface EmailVerificationPromptProps {
	email: string;
	className?: string;
}

/**
 * Post-signup / unverified-login prompt: confirms where the verification link
 * went and offers a resend. The reply is deliberately generic (no account state
 * is revealed) — a success swaps in a neutral line; a failure shows an inline error.
 */
const EmailVerificationPrompt = ({
	email,
	className,
}: EmailVerificationPromptProps) => {
	const { mutate: resend, isPending } = useResendVerification();
	const [resent, setResent] = useState(false);
	const [resendError, setResendError] = useState<string | null>(null);

	const handleResend = () => {
		setResendError(null);
		resend(
			{ email },
			{
				onSuccess: () => setResent(true),
				onError: (error) => setResendError(error.message),
			},
		);
	};

	return (
		<div className={cn("space-y-4", className)}>
			<AlertBanner variant="info">
				We've sent a verification link to <strong>{email}</strong>. Open it to
				activate your account, then log in.
			</AlertBanner>

			{resendError && <AlertBanner variant="error">{resendError}</AlertBanner>}

			{resent ? (
				<p className="text-sm text-muted-foreground">
					If your account needs verifying, a new link is on its way.
				</p>
			) : (
				<Button
					type="button"
					variant="outline"
					onClick={handleResend}
					disabled={isPending}
					className="h-11 w-full"
				>
					{isPending ? "Sending..." : "Resend verification email"}
				</Button>
			)}
		</div>
	);
};

export default EmailVerificationPrompt;
