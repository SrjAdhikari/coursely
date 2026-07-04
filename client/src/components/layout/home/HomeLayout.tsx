//* src/components/layout/home/HomeLayout.tsx

import { Outlet } from "react-router";

import HomeHeader from "@/components/layout/home/HomeHeader";
import HomeFooter from "@/components/layout/home/HomeFooter";

/** Layout route wrapping the public marketing pages with the header + footer. */
const HomeLayout = () => (
	<div className="relative z-10 min-h-screen">
		<HomeHeader />
		<main>
			<Outlet />
		</main>
		<HomeFooter />
	</div>
);

export default HomeLayout;
