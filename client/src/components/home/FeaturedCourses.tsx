import { BookOpen } from "lucide-react";
import { Link } from "react-router";

import { useListPublishedCourses } from "@/hooks/useCourses";
import { formatPrice } from "@/lib/currency";
import ROUTES from "@/routes/paths";

import CourseCard from "@/components/common/CourseCard";
import Loader from "@/components/Loader";
import LoadFailed from "@/components/common/LoadFailed";
import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";

const FEATURED_LIMIT = 6;

const FeaturedCourses = () => {
	const { data, isLoading, isError, refetch } = useListPublishedCourses();
	const courses = (data?.data ?? []).slice(0, FEATURED_LIMIT);

	return (
		<section className="mx-auto max-w-6xl px-5 py-16">
			<div className="mb-8 flex items-end justify-between gap-4">
				<div>
					<p className="text-sm uppercase tracking-widest text-primary">
						featured
					</p>

					<h2 className="mt-2 font-heading text-3xl">Start with a course</h2>
					<p className="mt-2 max-w-md text-muted-foreground">
						Hand-picked tracks to take you from an empty file to something you
						can ship.
					</p>
				</div>

				<Link
					to={ROUTES.CATALOG}
					className="text-sm text-primary hover:underline"
				>
					Browse all courses →
				</Link>
			</div>

			{isLoading ? (
				<Loader className="min-h-[40vh]" />
			) : isError ? (
				<LoadFailed
					title="Couldn't load courses"
					description="Something went wrong fetching the catalog."
					onRetry={refetch}
				/>
			) : courses.length === 0 ? (
				<EmptyStatePlaceholder
					icon={BookOpen}
					title="No courses yet"
					description="New courses are on the way — check back soon."
				/>
			) : (
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{courses.map((course) => (
						<CourseCard
							key={course._id}
							to={ROUTES.COURSE_DETAIL(course.slug)}
							title={course.title}
							instructorName={course.instructorName}
							thumbnailUrl={course.thumbnailUrl}
							description={course.description}
							meta={formatPrice(course.price)}
						/>
					))}
				</div>
			)}
		</section>
	);
};

export default FeaturedCourses;
