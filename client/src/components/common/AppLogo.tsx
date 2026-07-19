//* src/components/common/AppLogo.tsx

import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

interface AppLogoProps {
	className?: string;
	iconClassName?: string;
}

const AppLogo = ({ className, iconClassName }: AppLogoProps) => (
	<div
		className={cn(
			"flex items-center gap-2 font-heading text-2xl font-bold",
			className,
		)}
	>
		<img
			src={logo}
			alt="manakuru logo"
			aria-hidden
			decoding="async"
			className={cn("size-8 shrink-0", iconClassName)}
		/>
		Manakuru
	</div>
);

export default AppLogo;
