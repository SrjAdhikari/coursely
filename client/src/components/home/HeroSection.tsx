import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router";

import ROUTES from "@/routes/paths";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeroSectionProps {
	courseCount?: number;
}

const HeroSection = ({ courseCount }: HeroSectionProps) => {
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
		<section className="mx-auto max-w-3xl px-5 pt-16 pb-10 text-center">
			<p className="text-sm uppercase tracking-widest text-primary">
				learn to build the web
			</p>

			<h1 className="mt-4 font-heading text-5xl leading-tight sm:text-6xl">
				Ship real skills,{" "}
				<em className="not-italic text-primary">one lesson</em> at a time.
			</h1>

			<p className="mx-auto mt-5 max-w-xl text-muted-foreground">
				Project-driven courses in web development. Buy a course once, own it
				forever, and pick up exactly where you left off — on any device.
			</p>

			<form
				onSubmit={handleSearch}
				role="search"
				className="mx-auto mt-8 flex max-w-xl gap-2"
			>
				<Input
					type="search"
					aria-label="Search courses"
					placeholder="Search courses — React, CSS, Node…"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
				/>

				<Button type="submit" className="rounded-md">
					Search
				</Button>
			</form>

			{courseCount ? (
				<dl className="mx-auto mt-8 flex justify-center gap-10">
					<div>
						<dt className="sr-only">Courses</dt>
						<dd className="font-heading text-3xl text-primary">
							{courseCount}
						</dd>

						<p className="text-xs uppercase tracking-wider text-muted-foreground">
							courses
						</p>
					</div>
				</dl>
			) : null}
		</section>
	);
};

export default HeroSection;
