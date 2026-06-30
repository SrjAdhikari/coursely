//* src/components/admin/VideoUploadField.tsx

import {
	useRef,
	useState,
	type ChangeEvent,
	type DragEvent,
	type ReactNode,
} from "react";
import { Upload, Video, Check, CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FormField from "@/components/form/FormField";

import { VIDEO_MIME, MAX_VIDEO_LABEL } from "@/lib/uploadLimits";
import { cn } from "@/lib/utils";
import type { useVideoUpload } from "@/hooks/useVideoUpload";

interface VideoUploadFieldProps {
	label: string;
	state: ReturnType<typeof useVideoUpload>;
	hasVideo: boolean;
	/** Optional inline preview (the lesson passes a <VideoPlayer>). */
	previewSlot?: ReactNode;
}

// Decimal units (1000-based) to match the 1 GB cap and the "MB" labels.
const formatBytes = (bytes: number): string => {
	if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
	if (bytes >= 1_000_000) return `${Math.round(bytes / 1_000_000)} MB`;
	if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`;
	return `${bytes} B`;
};

/** Shared upload widget for the lesson video and course trailer. Presentational
 * only — all network logic lives in the injected `useVideoUpload` state.
 */
const VideoUploadField = ({
	label,
	state,
	hasVideo,
	previewSlot,
}: VideoUploadFieldProps) => {
	const inputRef = useRef<HTMLInputElement>(null);

	const [manualSeconds, setManualSeconds] = useState("");
	const [showPreview, setShowPreview] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

	const { status, progress, fileName, totalBytes, error } = state;

	// Keep the saved-video card on screen for idle/error too, so a failed replace
	// never makes an existing video look gone.
	const showUploaded =
		status === "done" ||
		((status === "idle" || status === "error") && hasVideo);
	const canPreview = hasVideo || status === "done";
	const loadedBytes = Math.round((totalBytes * progress) / 100);

	const manualValid = /^\d+$/.test(manualSeconds) && Number(manualSeconds) >= 1;
	const pickFile = () => inputRef.current?.click();

	const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = ""; // let the same file be re-picked
		if (file) state.start(file);
	};

	// Drag-and-drop onto the dropzone; the hook validates (mp4 + size).
	const onDrop = (event: DragEvent<HTMLButtonElement>) => {
		event.preventDefault();
		setIsDragging(false);
		const file = event.dataTransfer.files?.[0];
		if (file) state.start(file);
	};

	const replace = () => {
		setShowPreview(false);
		setManualSeconds("");
		state.reset();
		pickFile(); // reopen the picker so an already-uploaded video can be swapped
	};

	return (
		<div className="space-y-2">
			<span className="text-sm font-medium">
				{label}
				{status === "uploading" && (
					<span className="ml-1.5 font-mono text-[11px] font-normal text-muted-foreground">
						· uploading
					</span>
				)}
			</span>

			<input
				ref={inputRef}
				type="file"
				accept={VIDEO_MIME}
				className="sr-only"
				aria-label={`Upload ${label.toLowerCase()}`}
				onChange={onFileChange}
			/>

			{status === "idle" && !hasVideo && (
				<button
					type="button"
					onClick={pickFile}
					onDragOver={(event) => {
						event.preventDefault();
						setIsDragging(true);
					}}
					onDragLeave={(event) => {
						event.preventDefault();
						setIsDragging(false);
					}}
					onDrop={onDrop}
					className={cn(
						"flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors",
						isDragging
							? "border-primary/60 bg-muted/40"
							: "border-input hover:border-primary/40 hover:bg-muted/40",
					)}
				>
					<Upload className="size-6 text-primary" aria-hidden />
					<span className="text-sm">Drag a .mp4 here, or click to browse</span>
					<span className="font-mono text-[11px] text-muted-foreground">
						MP4 only · up to {MAX_VIDEO_LABEL}
					</span>
				</button>
			)}

			{status === "uploading" && (
				<div className="rounded-lg border border-input bg-background p-3.5">
					<div className="mb-2 flex items-center justify-between gap-2">
						<span className="flex min-w-0 items-center gap-2 font-mono text-xs">
							<Video className="size-4 shrink-0 text-primary" aria-hidden />
							<span className="truncate">{fileName}</span>
						</span>

						<span className="font-mono text-xs text-muted-foreground">
							{progress}%
						</span>
					</div>

					<Progress
						value={progress}
						aria-label="Upload progress"
						className="h-1.5 bg-muted"
					/>

					<div className="mt-2.5 flex items-center justify-between gap-2">
						<span className="truncate font-mono text-[11px] text-muted-foreground">
							Uploading to R2 · {formatBytes(loadedBytes)} /{" "}
							{formatBytes(totalBytes)}
						</span>

						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={state.cancel}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}

			{status === "confirming" && (
				<p className="font-mono text-xs text-muted-foreground">Saving…</p>
			)}

			{status === "awaiting-duration" && (
				<div className="space-y-2.5">
					<div className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3 text-sm">
						<CircleAlert
							className="mt-0.5 size-4 shrink-0 text-muted-foreground"
							aria-hidden
						/>
						<span>
							Uploaded — but we couldn't read the length automatically. Enter it
							to finish.
						</span>
					</div>

					<div className="flex items-end gap-2">
						<div className="flex-1">
							<FormField
								label="Duration (seconds)"
								id="manual-duration"
								inputMode="numeric"
								placeholder="e.g. 754"
								value={manualSeconds}
								onChange={(event) => setManualSeconds(event.target.value)}
							/>
						</div>

						<Button
							type="button"
							size="lg"
							disabled={!manualValid}
							onClick={() => state.submitManualDuration(Number(manualSeconds))}
						>
							Save duration
						</Button>
					</div>
				</div>
			)}

			{showUploaded && (
				<div className="space-y-3">
					<div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-3">
						<span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<Check className="size-4" aria-hidden />
						</span>

						<span className="min-w-0 flex-1 truncate font-mono text-xs">
							{status === "done" && fileName ? fileName : "Video uploaded"}
						</span>

						<div className="flex shrink-0 gap-2">
							{previewSlot && canPreview && (
								<Button
									type="button"
									size="sm"
									onClick={() => setShowPreview((open) => !open)}
								>
									{showPreview ? "Hide" : "Preview"}
								</Button>
							)}

							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={replace}
							>
								Replace
							</Button>
						</div>
					</div>

					{previewSlot && canPreview && showPreview && <div>{previewSlot}</div>}
				</div>
			)}

			{status === "error" && (
				<div className="space-y-2">
					<div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
						<CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
						<span>{error}</span>
					</div>

					{!hasVideo && (
						<Button type="button" variant="outline" size="sm" onClick={pickFile}>
							Choose another file
						</Button>
					)}
				</div>
			)}
		</div>
	);
};

export default VideoUploadField;
