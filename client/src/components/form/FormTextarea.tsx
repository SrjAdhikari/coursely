//* src/components/form/FormTextarea.tsx

import { forwardRef, type ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FormTextareaProps extends React.ComponentProps<"textarea"> {
	label: string;
	error?: string;
	hint?: ReactNode;
}

/**
 * Reusable multi-line field — label, textarea, and an error or hint line.
 * Uses forwardRef so React Hook Form's register() can attach its ref.
 */
const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
	({ label, error, hint, id, ...props }, ref) => (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<Textarea id={id} ref={ref} aria-invalid={!!error} {...props} />
			{error ? (
				<span className="font-mono text-sm text-destructive">{error}</span>
			) : hint ? (
				<span className="font-mono text-[11px] text-muted-foreground">
					{hint}
				</span>
			) : null}
		</div>
	),
);

FormTextarea.displayName = "FormTextarea";

export default FormTextarea;
