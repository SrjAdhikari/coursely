//* src/components/media/player/PlaybackRateMenu.tsx

import { Gauge } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

const PLAYBACK_RATES = [0.5, 1, 1.25, 1.5, 2] as const;

interface PlaybackRateMenuProps {
	rate: number;
	onSetRate: (rate: number) => void;
	container?: HTMLElement | null;
}

/** Playback-speed picker. */
const PlaybackRateMenu = ({
	rate,
	onSetRate,
	container,
}: PlaybackRateMenuProps) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label="Playback speed"
					className="gap-1 px-1.5 text-xs text-white hover:bg-white/15 hover:text-white"
				>
					<Gauge />
					<span className="tabular-nums">{rate}×</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="min-w-28" container={container}>
				<DropdownMenuLabel>Playback speed</DropdownMenuLabel>
				<DropdownMenuRadioGroup
					value={String(rate)}
					onValueChange={(value) => onSetRate(Number(value))}
				>
					{PLAYBACK_RATES.map((option) => (
						<DropdownMenuRadioItem key={option} value={String(option)}>
							{option === 1 ? "Normal" : `${option}×`}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default PlaybackRateMenu;
