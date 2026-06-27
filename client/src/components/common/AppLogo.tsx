//* src/components/common/AppLogo.tsx

import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLogoProps {
	className?: string;
}

const AppLogo = ({ className }: AppLogoProps) => (
	<div
		className={cn(
			"flex items-center gap-2 font-heading text-2xl font-bold",
			className,
		)}
	>
		<GraduationCap aria-hidden className="size-7 text-primary" />
		Coursely
	</div>
);

export default AppLogo;
