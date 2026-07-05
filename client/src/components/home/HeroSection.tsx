import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";

import ROUTES from "@/routes/paths";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
	courseCount?: number;
	lessonCount?: number;
	hours?: number;
}

const HeroSection = ({ courseCount, lessonCount, hours }: HeroSectionProps) => {
	const navigate = useNavigate();
	const [query, setQuery] = useState("");

	const handleSearch = (event: SyntheticEvent) => {
		event.preventDefault();
		const trimmed = query.trim();

		navigate(
			trimmed
				? `${ROUTES.CATALOG}?q=${encodeURIComponent(trimmed)}`
				: ROUTES.CATALOG,
		);
	};

	return (
		<section className="mx-auto max-w-5xl px-5 pt-16 pb-10 text-center">
			<p className="text-sm uppercase tracking-widest text-primary">
				learn to build the web
			</p>

			<h1 className="mt-4 font-heading text-6xl font-bold leading-none sm:text-7xl">
				Ship real skills,{" "}
				<em className="not-italic text-primary">one lesson</em> <br />
				at a time.
			</h1>

			<p className="mx-auto mt-5 max-w-3xl text-lg text-muted-foreground">
				Project-driven courses in web development. Buy a course once, own it
				forever, and pick up exactly where you left off on any device.
			</p>

			<form
				onSubmit={handleSearch}
				role="search"
				className="mx-auto mt-8 flex max-w-xl items-center gap-3 rounded-full border border-input bg-background py-2 pr-2 pl-5 shadow-xs transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50"
			>
				<Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
				<input
					type="search"
					aria-label="Search courses"
					placeholder="Search courses — React, CSS, Node…"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
				/>
				<Button type="submit" className="rounded-full px-6 cursor-pointer">
					Search
				</Button>
			</form>

			{courseCount || lessonCount || hours ? (
				<dl className="mx-auto mt-8 flex justify-center gap-10">
					{courseCount ? (
						<div>
							<dt className="sr-only">Courses</dt>
							<dd className="font-heading text-3xl text-primary">
								{courseCount}
							</dd>

							<p className="text-xs uppercase tracking-wider text-muted-foreground">
								courses
							</p>
						</div>
					) : null}

					{lessonCount ? (
						<div>
							<dt className="sr-only">Lessons</dt>
							<dd className="font-heading text-3xl text-primary">
								{lessonCount}
							</dd>

							<p className="text-xs uppercase tracking-wider text-muted-foreground">
								lessons
							</p>
						</div>
					) : null}

					{hours ? (
						<div>
							<dt className="sr-only">Hours</dt>
							<dd className="font-heading text-3xl text-primary">{hours}</dd>
							<p className="text-xs uppercase tracking-wider text-muted-foreground">
								hours
							</p>
						</div>
					) : null}
				</dl>
			) : null}
		</section>
	);
};

export default HeroSection;
