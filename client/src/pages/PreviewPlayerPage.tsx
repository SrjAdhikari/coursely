//* src/pages/PreviewPlayerPage.tsx

import { Navigate, Link, useParams } from "react-router";

import ROUTES from "@/routes/paths";
import { useGetCourseBySlug } from "@/hooks/useCourses";
import { useCurrentUser } from "@/hooks/useAuth";

import VideoPlayer from "@/components/media/VideoPlayer";
import Loader from "@/components/Loader";
import LoadFailed from "@/components/common/LoadFailed";
import { Button } from "@/components/ui/button";

/** Anonymous free-preview player — a public full-page screen for a preview lesson,
 *  with an enroll banner + CTA. Guards to preview-only lessons (the backend already
 *  enforces the gate; this keeps the UI from inviting a caller into a paid lesson). */
const PreviewPlayerPage = () => {
	const { slug, lessonId } = useParams();
	const { data, isLoading, isError, refetch } = useGetCourseBySlug(slug ?? "");

	const { data: userData } = useCurrentUser();
	const isLoggedIn = !!userData?.data;

	if (isLoading) return <Loader className="min-h-[60vh]" />;
	if (isError || !data?.data) {
		return (
			<LoadFailed
				title="Couldn't load this preview"
				description="Something went wrong loading the course. Check your connection and try again."
				onRetry={() => refetch()}
				backTo={ROUTES.CATALOG}
				backLabel="Back to courses"
			/>
		);
	}

	const course = data.data;
	const lesson = course.sections
		.flatMap((section) => section.lessons)
		.find((candidate) => candidate._id === lessonId);

	// Guard: only preview lessons are viewable anonymously; else back to detail.
	if (!lesson || !lesson.isPreview) {
		return <Navigate to={ROUTES.COURSE_DETAIL(course.slug)} replace />;
	}

	// Guests: carry a redirect back to the course so signup returns them here
	// (GuestRoute honours ?redirect after auth), matching PurchaseCard's loginHref.
	const enrollTo = isLoggedIn
		? ROUTES.COURSE_DETAIL(course.slug)
		: `${ROUTES.REGISTER}?redirect=${encodeURIComponent(
				ROUTES.COURSE_DETAIL(course.slug),
			)}`;

	return (
		<div className="mx-auto max-w-4xl">
			<Link
				to={ROUTES.COURSE_DETAIL(course.slug)}
				className="text-sm text-muted-foreground hover:text-primary"
			>
				← Back to {course.title}
			</Link>

			<div className="mt-4">
				<VideoPlayer lessonId={lesson._id} poster={course.thumbnailUrl} />
			</div>

			<p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
				free preview · {lesson.title}
			</p>

			<div className="mt-5 flex flex-col items-start gap-3 rounded-lg border border-border bg-card/50 p-5 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm text-muted-foreground">
					You're watching a free preview. Enroll for lifetime access to all
					lessons.
				</p>

				<Button asChild>
					<Link to={enrollTo}>Enroll now</Link>
				</Button>
			</div>
		</div>
	);
};

export default PreviewPlayerPage;
