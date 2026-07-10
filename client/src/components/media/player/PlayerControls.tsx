//* src/components/media/player/PlayerControls.tsx

import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";

import PlaybackRateMenu from "@/components/media/player/PlaybackRateMenu";
import SeekBar from "@/components/media/player/SeekBar";
import ShortcutsHint from "@/components/media/player/ShortcutsHint";
import { Button } from "@/components/ui/button";
import type { VideoControls } from "@/hooks/useVideoControls";
import { formatTime } from "@/lib/playerHelpers";
import { cn } from "@/lib/utils";

interface PlayerControlsProps {
	player: VideoControls;
}

/** Bottom controls bar: seek, play, volume, time, speed, shortcuts, fullscreen. */
const PlayerControls = ({ player }: PlayerControlsProps) => {
	const isSilent = player.muted || player.volume === 0;

	return (
		<div
			className={cn(
				"absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-linear-to-t from-black/80 via-black/40 to-transparent px-3 pt-10 pb-2.5 text-white transition-opacity duration-200",
				!player.mediaError && (player.controlsVisible || !player.playing)
					? "opacity-100"
					: "pointer-events-none invisible opacity-0",
			)}
		>
			<SeekBar
				currentTime={player.currentTime}
				duration={player.duration}
				bufferedEnd={player.bufferedEnd}
				onSeek={player.seekTo}
			/>

			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label={player.playing ? "Pause" : "Play"}
					onClick={player.togglePlay}
					className="text-white hover:bg-white/15 hover:text-white"
				>
					{player.playing ? <Pause /> : <Play />}
				</Button>

				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label={isSilent ? "Unmute" : "Mute"}
					onClick={player.toggleMute}
					className="text-white hover:bg-white/15 hover:text-white"
				>
					{isSilent ? <VolumeX /> : <Volume2 />}
				</Button>

				<input
					type="range"
					aria-label="Volume"
					min={0}
					max={1}
					step={0.05}
					value={isSilent ? 0 : player.volume}
					onChange={(event) => player.setVolume(Number(event.target.value))}
					className="h-1 w-16 cursor-pointer accent-primary"
				/>

				<span className="ml-1 text-xs tabular-nums text-white/90">
					{`${formatTime(player.currentTime)} / ${formatTime(player.duration)}`}
				</span>

				<div className="ml-auto flex items-center gap-1">
					<PlaybackRateMenu rate={player.rate} onSetRate={player.setRate} />
					<ShortcutsHint />

					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label={
							player.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
						}
						onClick={player.toggleFullscreen}
						className="text-white hover:bg-white/15 hover:text-white"
					>
						{player.isFullscreen ? <Minimize /> : <Maximize />}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default PlayerControls;
