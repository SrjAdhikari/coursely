//* src/components/media/player/SeekBar.tsx

import { clamp } from "@/lib/playerHelpers";

interface SeekBarProps {
	currentTime: number;
	duration: number;
	bufferedEnd: number;
	onSeek: (seconds: number) => void;
}

/** Scrub bar: buffered + played track with a thumb under a transparent range. */
const SeekBar = ({
	currentTime,
	duration,
	bufferedEnd,
	onSeek,
}: SeekBarProps) => {
	const playedPercent =
		duration > 0 ? clamp((currentTime / duration) * 100, 0, 100) : 0;
	const bufferedPercent =
		duration > 0 ? clamp((bufferedEnd / duration) * 100, 0, 100) : 0;

	return (
		<div className="relative flex h-3 items-center">
			<div className="absolute h-1.5 w-full rounded-full bg-white/25" />
			<div
				className="absolute h-1.5 rounded-full bg-white/40"
				style={{ width: `${bufferedPercent}%` }}
			/>

			<div
				className="absolute h-1.5 rounded-full bg-primary"
				style={{ width: `${playedPercent}%` }}
			/>

			<div
				className="pointer-events-none absolute size-3 -translate-x-1/2 rounded-full bg-primary shadow"
				style={{ left: `${playedPercent}%` }}
			/>

			<input
				type="range"
				aria-label="Seek"
				min={0}
				max={duration || 0}
				step="any"
				value={currentTime}
				onChange={(event) => onSeek(Number(event.target.value))}
				className="absolute inset-0 m-0 w-full cursor-pointer appearance-none bg-transparent opacity-0"
			/>
		</div>
	);
};

export default SeekBar;
