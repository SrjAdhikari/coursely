//* src/pages/HomePage.tsx

import { useListPublishedCourses } from "@/hooks/useCourses";
import useScrollReveal from "@/hooks/useScrollReveal";

import HeroSection from "@/components/home/HeroSection";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import ValueProps from "@/components/home/ValueProps";
import ProductShowcase from "@/components/home/ProductShowcase";
import BuiltStrip from "@/components/home/BuiltStrip";
import TechMarquee from "@/components/home/TechMarquee";
import HowItWorks from "@/components/home/HowItWorks";
import FounderNote from "@/components/home/FounderNote";
import HomeFaq from "@/components/home/HomeFaq";
import CtaBand from "@/components/home/CtaBand";

/** Public marketing homepage — content sections rendered inside HomeLayout. */
const HomePage = () => {
	const { data } = useListPublishedCourses();
	const courses = data?.data ?? [];

	const courseCount = courses.length;
	const lessonCount = courses.reduce(
		(total, course) => total + course.lessonCount,
		0,
	);

	const hours = Math.floor(
		courses.reduce((total, course) => total + course.totalDuration, 0) / 3600,
	);

	useScrollReveal();

	return (
		<>
			<HeroSection
				courseCount={courseCount}
				lessonCount={lessonCount}
				hours={hours}
			/>
			<div className="reveal-on-scroll">
				<FeaturedCourses />
			</div>

			<div className="reveal-on-scroll">
				<ValueProps />
			</div>

			<div className="reveal-on-scroll">
				<ProductShowcase />
			</div>

			<div className="reveal-on-scroll">
				<BuiltStrip />
			</div>

			<div className="reveal-on-scroll">
				<TechMarquee />
			</div>

			<div className="reveal-on-scroll">
				<HowItWorks />
			</div>

			<div className="reveal-on-scroll">
				<FounderNote />
			</div>

			<div className="reveal-on-scroll">
				<HomeFaq />
			</div>

			<div className="reveal-on-scroll">
				<CtaBand />
			</div>
		</>
	);
};

export default HomePage;
