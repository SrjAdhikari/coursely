//* src/pages/CourseDetailPage.tsx

import { useCallback, useMemo } from "react";
import { useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserRound, Layers, Clock } from "lucide-react";

import ROUTES from "@/routes/paths";

import { useGetCourseBySlug } from "@/hooks/useCourses";
import { useCurrentUser } from "@/hooks/useAuth";
import { useMyEnrollments } from "@/hooks/useEnrollments";
import { useCreateCheckout } from "@/hooks/usePayments";

import CurriculumAccordion from "@/components/course/CurriculumAccordion";
import PurchaseCard from "@/components/course/PurchaseCard";
import Loader from "@/components/Loader";
import LoadFailed from "@/components/common/LoadFailed";

import { formatRuntime } from "@/lib/duration";
import { redirectTo } from "@/lib/navigation";
import { MY_ENROLLMENTS_KEY } from "@/lib/queryKeys";

/** Public course detail — curriculum + the three-state purchase card. */
const CourseDetailPage = () => {
	const { slug = "" } = useParams();
	const queryClient = useQueryClient();

	const { data, isLoading, isError, refetch } = useGetCourseBySlug(slug);
	const { data: currentUser } = useCurrentUser();
	const isLoggedIn = !!currentUser?.data;

	const { data: enrollments, isLoading: isLoadingEnrollments } =
		useMyEnrollments({ enabled: isLoggedIn });
	const { mutate: startCheckout, isPending } = useCreateCheckout();

	const course = data?.data;

	const enrolled = useMemo(() => {
		if (!course || !enrollments) return false;
		return enrollments.data.some((row) => row.courseId._id === course._id);
	}, [course, enrollments]);

	// Ownership is unknown while a logged-in visitor's enrollments load — don't
	// offer an active Buy (they may already own the course).
	const isCheckingAccess = isLoggedIn && !!isLoadingEnrollments;

	const lessons = useMemo(
		() => course?.sections.flatMap((section) => section.lessons) ?? [],
		[course],
	);

	const lessonCount = lessons.length;
	const totalDuration = useMemo(
		() => lessons.reduce((total, lesson) => total + lesson.duration, 0),
		[lessons],
	);

	const previewLessonCount = useMemo(
		() => lessons.filter((lesson) => lesson.isPreview).length,
		[lessons],
	);

	const handleBuy = useCallback(() => {
		if (!course || isCheckingAccess) return;
		startCheckout(course._id, {
			onSuccess: (response) => {
				if (response.data.url) {
					redirectTo(response.data.url);
				} else {
					toast.error("Couldn't start checkout. Please try again.");
				}
			},
			onError: (error) => {
				toast.error(error.message);
				queryClient.invalidateQueries({ queryKey: MY_ENROLLMENTS_KEY });
			},
		});
	}, [course, isCheckingAccess, startCheckout, queryClient]);

	if (isLoading) return <Loader className="min-h-[80vh]" />;
	if (isError || !course)
		return (
			<LoadFailed
				title="Course not found"
				description="We couldn't find that course. It may have been unpublished, or the link is wrong."
				onRetry={() => refetch()}
				backTo={ROUTES.CATALOG}
				backLabel="Browse courses"
			/>
		);

	const status = !isLoggedIn ? "guest" : enrolled ? "enrolled" : "buyable";

	return (
		<div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.7fr_0.9fr]">
			<div>
				<h1 className="font-heading text-3xl font-semibold leading-tight">
					{course.title}
				</h1>

				<div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
					<span className="flex items-center gap-1.5">
						<UserRound className="size-3.5" />
						{course.instructorName}
					</span>

					<span className="flex items-center gap-1.5">
						<Layers className="size-3.5" />
						{course.sections.length} sections · {lessonCount} lessons
					</span>

					<span className="flex items-center gap-1.5">
						<Clock className="size-3.5" />
						{formatRuntime(totalDuration)}
					</span>
				</div>

				<p className="mt-5 leading-relaxed text-foreground">
					{course.description}
				</p>

				<h2 className="mb-3.5 mt-8 font-heading text-xl font-semibold">
					Curriculum
				</h2>
				<CurriculumAccordion sections={course.sections} />
			</div>

			<div className="lg:sticky lg:top-24 lg:self-start">
				<PurchaseCard	
					slug={course.slug}
					price={course.price}
					lessonCount={lessonCount}
					totalDuration={totalDuration}
					previewLessonCount={previewLessonCount}
					status={status}
					onBuy={handleBuy}
					isBuying={isPending}
					isCheckingAccess={isCheckingAccess}
				/>
			</div>
		</div>
	);
};

export default CourseDetailPage;
