//* src/components/theme/theme-toggle.tsx

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import useTheme from "@/hooks/useTheme";

/** Button that toggles between the light and dark theme. */
const ThemeToggle = () => {
	const { toggleTheme } = useTheme();

	return (
		<Button
			type="button"
			variant="outline"
			size="icon-sm"
			onClick={toggleTheme}
			aria-label="Toggle theme"
			className="relative"
		>
			<Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
			<Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
		</Button>
	);
};

export default ThemeToggle;
