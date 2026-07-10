//* src/components/media/player/ShortcutsHint.tsx

import { Keyboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";

const KEYBOARD_SHORTCUTS = [
	{ label: "Play / pause", keys: ["Space", "K"] },
	{ label: "Skip 5s", keys: ["←", "→"] },
	{ label: "Volume", keys: ["↑", "↓"] },
	{ label: "Mute", keys: ["M"] },
	{ label: "Fullscreen", keys: ["F"] },
];

interface ShortcutsHintProps {
	container?: HTMLElement | null;
}

/** Keyboard-shortcuts reference popover. */
const ShortcutsHint = ({ container }: ShortcutsHintProps) => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label="Keyboard shortcuts"
					className="text-white hover:bg-white/15 hover:text-white"
				>
					<Keyboard />
				</Button>
			</PopoverTrigger>

			<PopoverContent align="end" className="w-56" container={container}>
				<p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Keyboard shortcuts
				</p>

				<ul className="space-y-1.5 text-sm">
					{KEYBOARD_SHORTCUTS.map((shortcut) => (
						<li
							key={shortcut.label}
							className="flex items-center justify-between gap-4"
						>
							<span>{shortcut.label}</span>
							<span className="flex gap-1">
								{shortcut.keys.map((key) => (
									<kbd
										key={key}
										className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs"
									>
										{key}
									</kbd>
								))}
							</span>
						</li>
					))}
				</ul>
			</PopoverContent>
		</Popover>
	);
};

export default ShortcutsHint;
