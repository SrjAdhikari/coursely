//* src/components/form/FormField.tsx

import { useState, forwardRef, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps extends React.ComponentProps<"input"> {
	label: string;
	labelExtra?: ReactNode;
	error?: string;
}

/**
 * Reusable form field — renders a label, input, and error message.
 * When type is "password", adds a show/hide toggle automatically.
 * Uses forwardRef so React Hook Form's register() can attach its ref.
 *
 * `labelExtra` renders to the right of the label — useful for inline
 * helpers like "Forgot password?", character counts, or help icons.
 */
const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
	({ label, labelExtra, error, type, id, ...props }, ref) => {
		const [showPassword, setShowPassword] = useState(false);
		const isPassword = type === "password";

		return (
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label htmlFor={id}>{label}</Label>
					{labelExtra}
				</div>

				<div className="relative">
					<Input
						id={id}
						ref={ref}
						type={isPassword && showPassword ? "text" : type}
						aria-invalid={!!error}
						{...props}
					/>

					{isPassword && (
						<button
							type="button"
							aria-label={showPassword ? "Hide password" : "Show password"}
							aria-pressed={showPassword}
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							{showPassword ? (
								<EyeOff className="size-4" />
							) : (
								<Eye className="size-4" />
							)}
						</button>
					)}
				</div>

				{error && (
					<span className="text-sm font-mono text-destructive">{error}</span>
				)}
			</div>
		);
	},
);

FormField.displayName = "FormField";

export default FormField;
