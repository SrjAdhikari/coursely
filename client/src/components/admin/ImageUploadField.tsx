//* src/components/admin/ImageUploadField.tsx

import {
	useRef,
	useState,
	type ChangeEvent,
	type DragEvent,
} from "react";
import { Upload, Image as ImageIcon, Check, CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { IMAGE_MIME_TYPES, MAX_IMAGE_LABEL } from "@/lib/uploadLimits";
import { cn } from "@/lib/utils";
import type { useVideoUpload } from "@/hooks/useVideoUpload";

interface ImageUploadFieldProps {
	label: string;
	state: ReturnType<typeof useVideoUpload>;
	hasImage: boolean;
	/** Resolved URL of the saved thumbnail, shown as the inline preview. */
	previewUrl?: string;
}

// The dropzone's `accept` attribute takes a comma-separated MIME list.
const ACCEPT_ATTRIBUTE = IMAGE_MIME_TYPES.join(",");

// Decimal units (1000-based) to match the MB cap and labels.
const formatBytes = (bytes: number): string => {
	if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
	if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`;
	return `${bytes} B`;
};

/** Upload widget for a course thumbnail image. Presentational only — all network
 * logic lives in the injected uploader state. Mirrors VideoUploadField, but shows
 * an <img> preview instead of a video player.
 */
const ImageUploadField = ({
	label,
	state,
	hasImage,
	previewUrl,
}: ImageUploadFieldProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const { status, progress, fileName, totalBytes, error } = state;

	// Keep the saved-image card visible for idle/error too, so a failed replace
	// never makes an existing thumbnail look gone.
	const showUploaded =
		status === "done" ||
		((status === "idle" || status === "error") && hasImage);
	const showPreview = !!previewUrl && (hasImage || status === "done");
	const loadedBytes = Math.round((totalBytes * progress) / 100);

	const pickFile = () => inputRef.current?.click();

	const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = ""; // let the same file be re-picked
		if (file) state.start(file);
	};

	// Drag-and-drop onto the dropzone; the hook validates (image MIME + size).
	const onDrop = (event: DragEvent<HTMLButtonElement>) => {
		event.preventDefault();
		setIsDragging(false);
		const file = event.dataTransfer.files?.[0];
		if (file) state.start(file);
	};

	const replace = () => {
		state.reset();
		pickFile(); // reopen the picker so an already-uploaded image can be swapped
	};

	return (
		<div className="space-y-2">
			<span className="text-sm font-medium">
				{label}
				{status === "uploading" ? (
					<span className="ml-1.5 text-xs font-normal text-muted-foreground">
						· uploading
					</span>
				) : null}
			</span>

			<input
				ref={inputRef}
				type="file"
				accept={ACCEPT_ATTRIBUTE}
				className="sr-only"
				aria-label={`Upload ${label.toLowerCase()}`}
				onChange={onFileChange}
			/>

			{status === "idle" && !hasImage ? (
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
					<span className="text-sm">
						Drag an image here, or click to browse
					</span>
					<span className="text-xs text-muted-foreground">
						PNG, JPEG, or WebP · up to {MAX_IMAGE_LABEL}
					</span>
				</button>
			) : null}

			{status === "uploading" ? (
				<div className="rounded-lg border border-input bg-background p-3.5">
					<div className="mb-2 flex items-center justify-between gap-2">
						<span className="flex min-w-0 items-center gap-2 text-xs">
							<ImageIcon className="size-4 shrink-0 text-primary" aria-hidden />
							<span className="truncate">{fileName}</span>
						</span>

						<span className="text-xs text-muted-foreground">{progress}%</span>
					</div>

					<Progress
						value={progress}
						aria-label="Upload progress"
						className="h-1.5 bg-muted"
					/>

					<div className="mt-2.5 flex items-center justify-between gap-2">
						<span className="truncate text-xs text-muted-foreground">
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
			) : null}

			{status === "confirming" ? (
				<p className="text-xs text-muted-foreground">Saving…</p>
			) : null}

			{showUploaded ? (
				<div className="space-y-3">
					{showPreview ? (
						<div className="overflow-hidden rounded-lg border border-border">
							<img
								src={previewUrl}
								alt="Thumbnail preview"
								className="aspect-video w-full object-cover"
							/>
						</div>
					) : null}

					<div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-3">
						<span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<Check className="size-4" aria-hidden />
						</span>

						<span className="min-w-0 flex-1 truncate text-xs">
							{status === "done" && fileName ? fileName : "Thumbnail uploaded"}
						</span>

						<Button type="button" variant="outline" size="sm" onClick={replace}>
							Replace
						</Button>
					</div>
				</div>
			) : null}

			{status === "error" ? (
				<div className="space-y-2">
					<div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
						<CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
						<span>{error}</span>
					</div>

					{!hasImage ? (
						<Button type="button" variant="outline" size="sm" onClick={pickFile}>
							Choose another file
						</Button>
					) : null}
				</div>
			) : null}
		</div>
	);
};

export default ImageUploadField;
