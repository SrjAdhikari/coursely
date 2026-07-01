//* src/components/layout/store/StoreLayout.tsx

import { Outlet } from "react-router";
import StoreHeader from "@/components/layout/store/StoreHeader";

/** Layout route wrapping the store pages with the shared header. */
const StoreLayout = () => (
	<div className="relative z-10 min-h-screen">
		<StoreHeader />
		<main className="mx-auto max-w-6xl px-5 py-8">
			<Outlet />
		</main>
	</div>
);

export default StoreLayout;
