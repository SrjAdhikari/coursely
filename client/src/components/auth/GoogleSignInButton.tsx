//* src/components/auth/GoogleSignInButton.tsx

import { GoogleLogin } from "@react-oauth/google";
import GoogleIcon from "@/components/icons/GoogleIcon";

interface GoogleSignInButtonProps {
	onSuccess: (idToken: string) => void;
	onError: () => void;
	label?: string;
}

/**
 * Fully styled Google button: a custom button with an invisible Google widget
 * overlaid on top to catch the click and trigger the ID-token popup.
 */
const GoogleSignInButton = ({
	onSuccess,
	onError,
	label = "Continue with Google",
}: GoogleSignInButtonProps) => {
	return (
		<div className="group relative w-full">
			<button
				type="button"
				tabIndex={-1}
				className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-border bg-background text-base font-medium text-foreground transition-colors hover:bg-muted group-focus-within:ring-2 group-focus-within:ring-ring group-focus-within:ring-offset-2"
			>
				<GoogleIcon className="size-5" />
				<span>{label}</span>
			</button>

			{/* Invisible Google widget — catches clicks and triggers the ID-token popup. */}
			<div className="absolute inset-0 opacity-0 [&>div]:h-full!">
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
