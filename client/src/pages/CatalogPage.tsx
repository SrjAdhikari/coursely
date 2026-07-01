//* src/pages/CatalogPage.tsx

import { useMemo, useState } from "react";
import { Search, BookOpen, SearchX } from "lucide-react";

import ROUTES from "@/routes/paths";
import { formatPrice } from "@/lib/currency";
import { useListPublishedCourses } from "@/hooks/useCourses";

import CourseCard from "@/components/common/CourseCard";
import Loader from "@/components/Loader";
import LoadFailed from "@/components/common/LoadFailed";
import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";

/** Public catalog — published courses with a client-side search. */
const CatalogPage = () => {
	const { data, isLoading, isError, refetch } = useListPublishedCourses();
	const [query, setQuery] = useState("");

	const courses = useMemo(() => data?.data ?? [], [data]);
	const filteredCourses = useMemo(() => {
		const searchTerm = query.trim().toLowerCase();
		if (!searchTerm) return courses;

		return courses.filter((course) =>
			[course.title, course.instructorName, course.description]
				.join(" ")
				.toLowerCase()
				.includes(searchTerm),
		);
	}, [courses, query]);

	if (isLoading) return <Loader className="min-h-[80vh]" />;
	if (isError)
		return (
			<LoadFailed
				title="Couldn't load courses"
				description="Something went wrong while loading the catalog. Check your connection and try again."
				onRetry={() => refetch()}
			/>
		);

	return (
		<section>
			<div className="mb-7 flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-heading text-3xl font-semibold">
						Browse courses
					</h1>
					<p className="mt-1.5 text-sm text-muted-foreground">
						{courses.length} {courses.length === 1 ? "course" : "courses"}
					</p>
				</div>

				<div className="flex max-w-80 flex-1 items-center gap-2.5 rounded-lg border border-input bg-card px-3 py-2 focus-within:border-primary/30">
					<Search className="size-4 text-muted-foreground" />
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search courses…"
						aria-label="Search courses"
						className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
					/>
				</div>
			</div>

			{filteredCourses.length === 0 ? (
				courses.length === 0 ? (
					<EmptyStatePlaceholder
						icon={BookOpen}
						title="No courses yet"
						description="New courses will appear here soon."
					/>
				) : (
					<EmptyStatePlaceholder
						icon={SearchX}
						title="No courses match your search"
						description="Try a different term."
					/>
				)
			) : (
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{filteredCourses.map((course) => (
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

export default CatalogPage;
