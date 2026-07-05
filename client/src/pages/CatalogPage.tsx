//* src/pages/CatalogPage.tsx

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Search, BookOpen, SearchX } from "lucide-react";

import ROUTES from "@/routes/paths";
import { formatPrice } from "@/lib/currency";
import { useListPublishedCourses } from "@/hooks/useCourses";

import CourseCard from "@/components/common/CourseCard";
import Loader from "@/components/Loader";
import LoadFailed from "@/components/common/LoadFailed";
import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";
import { Button } from "@/components/ui/button";

const ALL_CATEGORIES = "All";

/** Public catalog — published courses with a URL-synced search + category chips. */
const CatalogPage = () => {
	const { data, isLoading, isError, refetch } = useListPublishedCourses();
	const [searchParams, setSearchParams] = useSearchParams();
	const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);

	// The URL is the source of truth for the query (so a shared /courses?q=… link
	// lands pre-filtered); typing syncs back with replace so it doesn't stack history.
	const query = searchParams.get("q") ?? "";

	const setQuery = useCallback(
		(value: string) => {
			setSearchParams(
				(params) => {
					if (value) params.set("q", value);
					else params.delete("q");
					return params;
				},
				{ replace: true },
			);
		},
		[setSearchParams],
	);

	const courses = useMemo(() => data?.data ?? [], [data]);

	const categories = useMemo(() => {
		const distinct = new Set(
			courses
				.map((course) => course.category)
				.filter((category): category is string => Boolean(category)),
		);

		return [ALL_CATEGORIES, ...distinct];
	}, [courses]);

	const filteredCourses = useMemo(() => {
		const searchTerm = query.trim().toLowerCase();

		const filtered = courses.filter((course) => {
			const matchesCategory =
				selectedCategory === ALL_CATEGORIES ||
				course.category === selectedCategory;

			const searchableText =
				`${course.title} ${course.instructorName} ${course.description}`.toLowerCase();

			const matchesSearch =
				searchTerm === "" || searchableText.includes(searchTerm);

			const isMatch = matchesCategory && matchesSearch;
			return isMatch;
		});

		return filtered;
	}, [courses, query, selectedCategory]);

	const clearSearch = useCallback(() => {
		setQuery("");
		setSelectedCategory(ALL_CATEGORIES);
	}, [setQuery]);

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

			{categories.length > 1 && (
				<div className="mb-6 flex flex-wrap gap-2">
					{categories.map((category) => (
						<Button
							key={category}
							type="button"
							size="sm"
							variant={selectedCategory === category ? "default" : "outline"}
							onClick={() => setSelectedCategory(category)}
						>
							{category}
						</Button>
					))}
				</div>
			)}

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
						description="Try a different term or clear your filters."
					>
						<Button variant="outline" onClick={clearSearch}>
							Clear search
						</Button>
					</EmptyStatePlaceholder>
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
							category={course.category}
							lessonCount={course.lessonCount}
							meta={formatPrice(course.price)}
						/>
					))}
				</div>
			)}
		</section>
	);
};

export default CatalogPage;
