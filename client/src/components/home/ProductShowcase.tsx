//* src/components/home/ProductShowcase.tsx

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Check, Lock, Play, Volume2 } from "lucide-react";

import { cn } from "@/lib/utils";
import ProductFrame from "@/components/home/ProductFrame";

const dashboardStats = [
	{ label: "Courses", value: "3" },
	{ label: "Lessons done", value: "41" },
	{ label: "Hours watched", value: "12.5" },
];

const learnLessons = [
	{ title: "Why React exists", duration: "8:20", state: "done" },
	{ title: "JSX & the render tree", duration: "11:05", state: "done" },
	{
		title: "Building your first component",
		duration: "14:38",
		state: "active",
	},
	{ title: "Props & composition", duration: "9:41", state: "locked" },
	{ title: "State with useState", duration: "12:56", state: "locked" },
];

const catalogFilters = [
	"All",
	"Web Basics",
	"JavaScript",
	"Frontend",
	"Backend",
];

// Per-language tiles (mirrors the master mockup) so the catalog frame reads as a
// varied grid instead of an all-lime block that fights the accent.
const catalogCourses = [
	{
		glyph: "</>",
		title: "HTML & CSS Foundations",
		price: "₹499",
		tile: "linear-gradient(135deg,#e8662a,#b8420f)",
		ink: "#0a0c08",
	},
	{
		glyph: "JS",
		title: "JavaScript Essentials",
		price: "₹699",
		tile: "linear-gradient(135deg,#f2c94c,#caa01f)",
		ink: "#1a1500",
	},
	{
		glyph: "⚛",
		title: "React from Scratch",
		price: "₹999",
		tile: "linear-gradient(135deg,#22d3ee,#0e7490)",
		ink: "#04242b",
	},
	{
		glyph: "TS",
		title: "TypeScript Deep Dive",
		price: "₹899",
		tile: "linear-gradient(135deg,#60a5fa,#2563eb)",
		ink: "#ffffff",
	},
	{
		glyph: "Nd",
		title: "Node & Express APIs",
		price: "₹999",
		tile: "linear-gradient(135deg,#6ee7b7,#059669)",
		ink: "#04241a",
	},
	{
		glyph: "#",
		title: "Modern CSS Layout",
		price: "₹599",
		tile: "linear-gradient(135deg,#3a8bff,#1452cc)",
		ink: "#ffffff",
	},
];

// Placeholder mock-UI frames — swapped for real screenshots post content-seeding.
// Each fills the fixed stage height so it seats cleanly like the mockup.
const DashboardMock = () => (
	<div aria-hidden className="flex h-full flex-col p-5 text-left">
		<div className="mb-4 flex items-center justify-between gap-4">
			<div>
				<p className="text-[11px] uppercase tracking-wider text-muted-foreground">
					Welcome back
				</p>
				<h4 className="mt-1 text-xl">Keep the streak going</h4>
			</div>
			<div className="relative size-18 shrink-0">
				<svg viewBox="0 0 80 80" className="size-full -rotate-90">
					<circle
						cx="40"
						cy="40"
						r="34"
						fill="none"
						strokeWidth={6}
						className="stroke-border"
					/>
					<circle
						cx="40"
						cy="40"
						r="34"
						fill="none"
						strokeWidth={6}
						strokeLinecap="round"
						strokeDasharray="213.6"
						strokeDashoffset="81.2"
						className="stroke-primary"
					/>
				</svg>
				<span className="absolute inset-0 grid place-items-center text-sm font-semibold">
					62%
				</span>
			</div>
		</div>

		<div className="mb-4 grid grid-cols-3 gap-2.5">
			{dashboardStats.map((tile) => (
				<div
					key={tile.label}
					className="rounded-lg border border-border bg-card p-3"
				>
					<p className="text-[10px] uppercase tracking-wide text-muted-foreground">
						{tile.label}
					</p>
					<p className="mt-1 text-xl font-semibold">{tile.value}</p>
				</div>
			))}
		</div>

		<div className="mt-auto flex items-center gap-3 rounded-xl border border-input bg-muted p-3">
			<span className="grid size-12 shrink-0 place-items-center rounded-lg bg-linear-to-br from-primary to-primary/60 text-lg font-bold text-primary-foreground">
				⚛
			</span>
			<div className="min-w-0 flex-1">
				<p className="text-[10px] uppercase tracking-wider text-muted-foreground">
					Continue learning
				</p>
				<p className="mt-0.5 truncate text-sm font-semibold">
					React from Scratch
				</p>
				<div className="mt-1.5 flex items-center gap-2">
					<span className="h-1 w-32 overflow-hidden rounded-full bg-border">
						<span
							className="block h-full rounded-full bg-primary"
							style={{ width: "44%" }}
						/>
					</span>
					<span className="text-[11px] text-muted-foreground">
						8 / 18 lessons
					</span>
				</div>
			</div>
			<span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
				<Play className="size-4 translate-x-px" aria-hidden />
			</span>
		</div>
	</div>
);

const LearnMock = () => (
	<div aria-hidden className="grid h-full text-left sm:grid-cols-5">
		<div className="flex flex-col border-b border-border sm:col-span-3 sm:border-b-0 sm:border-r">
			<div className="relative grid aspect-video place-items-center bg-muted sm:aspect-auto sm:min-h-0 sm:flex-1">
				<span className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-card">
					<Play className="size-6 translate-x-0.5" aria-hidden />
				</span>
				<span className="absolute bottom-3 left-3 rounded bg-foreground/70 px-2 py-1 text-[11px] text-background">
					04 · Building your first component
				</span>
			</div>
			<div className="bg-card p-4">
				<div className="mb-3 h-1 overflow-hidden rounded-full bg-border">
					<span
						className="block h-full rounded-full bg-primary"
						style={{ width: "44%" }}
					/>
				</div>
				<div className="flex items-center gap-3 text-muted-foreground">
					<Play className="size-4" aria-hidden />
					<Volume2 className="size-4" aria-hidden />
					<span className="text-[11px]">6:12 / 14:38</span>
					<span className="ml-auto rounded border border-border px-1.5 py-0.5 text-[11px]">
						1.5×
					</span>
				</div>
			</div>
		</div>

		<div className="flex flex-col bg-card sm:col-span-2">
			<div className="border-b border-border p-4">
				<div className="mb-2 flex items-center justify-between">
					<p className="text-sm font-semibold">Course progress</p>
					<span className="text-xs text-primary">44%</span>
				</div>
				<div className="h-1 overflow-hidden rounded-full bg-border">
					<span
						className="block h-full rounded-full bg-primary"
						style={{ width: "44%" }}
					/>
				</div>
			</div>
			<div className="p-2">
				<p className="px-2 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
					Section 1 · Foundations
				</p>
				{learnLessons.map((lesson) => (
					<div
						key={lesson.title}
						className={cn(
							"flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-muted-foreground",
							lesson.state === "active" && "bg-accent-soft text-foreground",
						)}
					>
						{lesson.state === "done" ? (
							<Check className="size-4 shrink-0 text-primary" aria-hidden />
						) : lesson.state === "active" ? (
							<Play className="size-4 shrink-0 text-primary" aria-hidden />
						) : (
							<Lock className="size-4 shrink-0" aria-hidden />
						)}
						<span className="flex-1 truncate">{lesson.title}</span>
						<span className="shrink-0 text-[11px]">{lesson.duration}</span>
					</div>
				))}
			</div>
		</div>
	</div>
);

// Fits the fixed 424px stage: shorter 16/7 thumbnails + a flex column whose grid
// takes the remaining space, so all six cards and prices stay visible.
const CatalogMock = () => (
	<div aria-hidden className="flex h-full flex-col p-4 text-left">
		<div className="mb-3 flex flex-wrap gap-2">
			{catalogFilters.map((filter, index) => (
				<span
					key={filter}
					className={cn(
						"rounded-full border px-3 py-1.5 text-xs",
						index === 0
							? "border-primary bg-primary font-semibold text-primary-foreground"
							: "border-border bg-card text-muted-foreground",
					)}
				>
					{filter}
				</span>
			))}
		</div>
		<div className="grid flex-1 grid-cols-2 content-start gap-2.5 sm:grid-cols-3">
			{catalogCourses.map((course) => (
				<div
					key={course.title}
					className="overflow-hidden rounded-lg border border-border bg-card"
				>
					<div
						className="grid aspect-[16/7] place-items-center text-lg font-bold"
						style={{ background: course.tile, color: course.ink }}
					>
						{course.glyph}
					</div>
					<div className="p-2.5">
						<p className="text-xs font-semibold leading-tight">{course.title}</p>
						<p className="mt-1.5 text-xs font-bold">{course.price}</p>
					</div>
				</div>
			))}
		</div>
	</div>
);

type MockComponent = () => ReactNode;

interface ShowcaseFeature {
	id: string;
	step: string;
	kicker: string;
	heading: string;
	intro: string;
	points: string[];
	url: string;
	Mock: MockComponent;
}

// One entry per tab — copy reused from the previous split showcase, paired with
// the browser-frame mock it drives.
const showcaseFeatures: ShowcaseFeature[] = [
	{
		id: "dashboard",
		step: "01",
		kicker: "your dashboard",
		heading: "See your progress at a glance",
		intro:
			"Every course you own, how far you've come, and a one-click jump straight back into the lesson you were on.",
		points: [
			"Resume exactly where you left off",
			"Track completed lessons per course",
			"Everything you own in one library",
		],
		url: "coursely.app/dashboard",
		Mock: DashboardMock,
	},
	{
		id: "learn",
		step: "02",
		kicker: "watch & learn",
		heading: "Your classroom is one focused screen",
		intro:
			"A distraction-free player with your curriculum right beside it, and progress that saves as you go.",
		points: [
			"Distraction-free video player",
			"Curriculum and progress side by side",
			"Picks up on the exact lesson you left",
		],
		url: "coursely.app/learn/react-from-scratch",
		Mock: LearnMock,
	},
	{
		id: "catalog",
		step: "03",
		kicker: "the catalog",
		heading: "A focused catalog, no noise",
		intro:
			"A tight, curated set of web-development courses: each one with a clear title, an honest price, and free previews. Find your next one in seconds.",
		points: [
			"Straightforward, scannable course cards",
			"Filter by topic, not by hype",
			"Prices shown up front",
		],
		url: "coursely.app/courses",
		Mock: CatalogMock,
	},
];

/** Interactive product tour: a vertical tablist on the left drives one product
 *  frame on the right. Follows the WAI-ARIA tabs pattern — roving tabIndex,
 *  arrow / Home / End keys, and reduced-motion-safe transitions from index.css. */
const ProductShowcase = () => {
	const [activeId, setActiveId] = useState(showcaseFeatures[0].id);
	const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

	const selectTabAt = (index: number) => {
		const feature = showcaseFeatures[index];
		setActiveId(feature.id);
		tabRefs.current[index]?.focus();
	};

	const handleTabKeyDown = (
		event: KeyboardEvent<HTMLButtonElement>,
		index: number,
	) => {
		const lastIndex = showcaseFeatures.length - 1;
		let nextIndex: number | null = null;

		if (event.key === "ArrowDown" || event.key === "ArrowRight") {
			nextIndex = index === lastIndex ? 0 : index + 1;
		} else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
			nextIndex = index === 0 ? lastIndex : index - 1;
		} else if (event.key === "Home") {
			nextIndex = 0;
		} else if (event.key === "End") {
			nextIndex = lastIndex;
		}

		if (nextIndex !== null) {
			event.preventDefault();
			selectTabAt(nextIndex);
		}
	};

	return (
		<section className="mx-auto max-w-6xl px-5 py-16">
			<div className="mx-auto mb-10 max-w-xl text-center">
				<p className="text-xs uppercase tracking-widest text-primary">
					inside coursely
				</p>
				<h2 className="mt-3 text-4xl">A calm place to learn</h2>
				<p className="mt-3 text-muted-foreground">
					The whole app is built around one idea: get out of your way so you can
					keep making progress.
				</p>
			</div>

			<div className="showcase-grid">
				{/* Left — the vertical tablist with rail, glowing nodes and ghost numerals. */}
				<div
					className="showcase-tablist"
					role="tablist"
					aria-label="Explore the Coursely app"
					aria-orientation="vertical"
				>
					{showcaseFeatures.map((feature, index) => {
						const isActive = feature.id === activeId;
						return (
							<div key={feature.id} className="showcase-item">
								<button
									ref={(node) => {
										tabRefs.current[index] = node;
									}}
									type="button"
									role="tab"
									id={`showcase-tab-${feature.id}`}
									aria-controls={`showcase-panel-${feature.id}`}
									aria-selected={isActive}
									tabIndex={isActive ? 0 : -1}
									onClick={() => setActiveId(feature.id)}
									onKeyDown={(event) => handleTabKeyDown(event, index)}
									className="showcase-tab"
								>
									<span className="showcase-node" aria-hidden />
									<span className="showcase-ghost" aria-hidden>
										{feature.step}
									</span>

									<span className="showcase-tab-body">
										<span className="self-start rounded-full border border-accent-line bg-accent-soft px-2.5 py-1 text-xs uppercase tracking-wider text-primary">
											{feature.kicker}
										</span>
										<span className="font-heading text-base font-semibold leading-tight">
											{feature.heading}
										</span>
									</span>
								</button>

								{/* Detail sits OUTSIDE the tab so its accessible name is just the
								    kicker + heading; `inert` hides the collapsed inactive
								    details from assistive tech while keeping the expand animation. */}
								<div className="showcase-detail" inert={!isActive}>
									<div className="showcase-detail-inner">
										<p className="max-w-prose pt-2 text-sm leading-relaxed text-muted-foreground">
											{feature.intro}
										</p>
										<ul className="flex flex-col gap-2.5 pt-3.5">
											{feature.points.map((point) => (
												<li
													key={point}
													className="flex items-center gap-2.5 text-sm text-foreground"
												>
													<span className="grid size-5 shrink-0 place-items-center rounded-md border border-accent-line bg-accent-soft text-primary">
														<Check className="size-3" aria-hidden />
													</span>
													{point}
												</li>
											))}
										</ul>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Right — one deliberate frame on a glowing stage; content swaps per tab. */}
				<div className="mx-auto w-full max-w-2xl lg:max-w-none">
					{showcaseFeatures.map((feature) => {
						const isActive = feature.id === activeId;
						const FeatureMock = feature.Mock;
						return (
							<div
								key={feature.id}
								role="tabpanel"
								id={`showcase-panel-${feature.id}`}
								aria-labelledby={`showcase-tab-${feature.id}`}
								hidden={!isActive}
								className={cn(isActive && "showcase-panel")}
							>
								<div className="showcase-stage">
									<ProductFrame url={feature.url}>
										<div className="overflow-hidden sm:h-106">
											<FeatureMock />
										</div>
									</ProductFrame>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default ProductShowcase;
