//* src/components/auth/AuthDivider.tsx

/** Labeled rule between the Google button and the email/password form. */
const AuthDivider = () => (
	<div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
		<span className="h-px flex-1 bg-border" />
		or continue with email
		<span className="h-px flex-1 bg-border" />
	</div>
);

export default AuthDivider;
