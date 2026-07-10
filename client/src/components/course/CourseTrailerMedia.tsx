//* src/components/course/CourseTrailerMedia.tsx

import { useState } from "react";
import { Play } from "lucide-react";

import { useCourseTrailerUrl } from "@/hooks/useMedia";
import Loader from "@/components/Loader";
import VideoSurface from "@/components/media/VideoSurface";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";

interface CourseTrailerMediaProps {
	thumbnailUrl: string;
	hasTrailer: boolean;
	slug: string;
	title: string;
}

/** Poster atop the Purchase Card; when a trailer exists, a play button opens it in a dialog lightbox. */
const CourseTrailerMedia = ({
	thumbnailUrl,
	hasTrailer,
	slug,
	title,
}: CourseTrailerMediaProps) => {
	const [isOpen, setIsOpen] = useState(false);

	// Minted lazily on open; gate on `isFetching` so a reopen reloads instead of showing a stale URL.
	const { data, isFetching, isError, refetch } = useCourseTrailerUrl(
		slug,
		isOpen,
	);

	const poster = (
		<div className="relative aspect-video w-full overflow-hidden border-b border-border bg-black">
			<img src={thumbnailUrl} alt={title} className="size-full object-cover" />

			{hasTrailer && (
				<>
					<div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />

					<button
						type="button"
						aria-label="Play trailer"
						onClick={() => setIsOpen(true)}
						className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					>
						<Play className="size-5 translate-x-px fill-current" aria-hidden />
					</button>
				</>
			)}
		</div>
	);

	// No trailer → poster only, no dialog.
	if (!hasTrailer) return poster;

	const trailerBody = isFetching ? (
		<Loader className="aspect-video rounded-lg border border-border bg-black" />
	) : isError || !data ? (
		<div
			role="alert"
			className="flex aspect-video flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground"
		>
			Couldn't load the trailer.
			<Button variant="outline" size="sm" onClick={() => void refetch()}>
				Try again
			</Button>
		</div>
	) : (
		<VideoSurface src={data.data.url} />
	);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			{poster}

			<DialogContent className="max-w-3xl">
				{/* sr-only: a11y title without duplicating the page heading. */}
				<DialogHeader className="sr-only">
					<DialogTitle>{title}: trailer</DialogTitle>
					<DialogDescription>Preview trailer for {title}.</DialogDescription>
				</DialogHeader>

				{trailerBody}
			</DialogContent>
		</Dialog>
	);
};

export default CourseTrailerMedia;
