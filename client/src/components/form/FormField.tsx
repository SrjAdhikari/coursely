//* src/components/form/FormField.tsx

import { useState, forwardRef, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps extends Omit<React.ComponentProps<"input">, "prefix"> {
	label: string;
	labelExtra?: ReactNode;
	error?: string;
	hint?: ReactNode;
	prefix?: ReactNode;
}

/**
 * Reusable form field — renders a label, input, and an error or hint line.
 * When type is "password", adds a show/hide toggle automatically.
 * Uses forwardRef so React Hook Form's register() can attach its ref.
 *
 * `labelExtra` renders to the right of the label (inline helpers / links).
 * `prefix` renders a left adornment inside the input (e.g. a "₹" symbol).
 * `hint` renders just below the input (tight gap) when there is no error.
 */
const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
	(
		{ label, labelExtra, error, hint, prefix, type, id, className, ...props },
		ref,
	) => {
		const [showPassword, setShowPassword] = useState(false);
		const isPassword = type === "password";

		return (
			<div>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor={id}>{label}</Label>
						{labelExtra}
					</div>

					<div className="relative">
						{prefix && (
							<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">
								{prefix}
							</span>
						)}

						<Input
							id={id}
							ref={ref}
							type={isPassword && showPassword ? "text" : type}
							aria-invalid={!!error}
							className={cn(prefix && "pl-7", className)}
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
				</div>

				{error ? (
					<span className="mt-1.5 block font-mono text-sm text-destructive">
						{error}
					</span>
				) : hint ? (
					<span className="mt-1.5 block font-mono text-[11px] text-muted-foreground">
						{hint}
					</span>
				) : null}
			</div>
		);
	},
);

FormField.displayName = "FormField";

export default FormField;
