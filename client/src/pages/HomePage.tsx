//* src/pages/HomePage.tsx

import { useListPublishedCourses } from "@/hooks/useCourses";

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
	const courseCount = data?.data?.length;

	return (
		<>
			<HeroSection courseCount={courseCount} />
			<FeaturedCourses />
			<ValueProps />
			<ProductShowcase />
			<BuiltStrip />
			<TechMarquee />
			<HowItWorks />
			<FounderNote />
			<HomeFaq />
			<CtaBand />
		</>
	);
};

export default HomePage;
