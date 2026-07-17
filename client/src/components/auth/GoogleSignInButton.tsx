//* src/components/auth/GoogleSignInButton.tsx

import { GoogleLogin } from "@react-oauth/google";
import GoogleIcon from "@/components/icons/GoogleIcon";
import { cn } from "@/lib/utils";

interface GoogleSignInButtonProps {
	onSuccess: (idToken: string) => void;
	onError: () => void;
	label?: string;
	disabled?: boolean;
}

/**
 * Fully styled Google button: a custom button with an invisible Google widget
 * overlaid on top to catch the click and trigger the ID-token popup.
 */
const GoogleSignInButton = ({
	onSuccess,
	onError,
	label = "Continue with Google",
	disabled = false,
}: GoogleSignInButtonProps) => {
	return (
		<div
			className={cn(
				"group relative w-full",
				disabled && "pointer-events-none opacity-50",
			)}
		>
			<button
				type="button"
				tabIndex={-1}
				aria-hidden="true"
				className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted group-focus-within:ring-2 group-focus-within:ring-ring/40"
			>
				<GoogleIcon className="size-5" />
				<span>{label}</span>
			</button>

			{/* Invisible Google widget — clipped to the button so it can't catch phantom clicks past its edge. */}
			<div className="absolute inset-0 overflow-hidden opacity-0 [&>div]:h-full!">
				<GoogleLogin
					onSuccess={(credentialResponse) => {
						if (credentialResponse.credential) {
							onSuccess(credentialResponse.credential);
						} else {
							onError();
						}
					}}
					onError={onError}
					theme="outline"
					size="large"
					width="400"
				/>
			</div>
		</div>
	);
};

export default GoogleSignInButton;
