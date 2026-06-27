//* src/components/Loader.tsx

import { LoaderIcon } from "lucide-react";

/** Centered full-screen spinner shown while the auth check is in flight. */
const Loader = () => (
	<div
		role="status"
		aria-label="Loading"
		className="flex flex-col min-h-screen items-center justify-center gap-2 text-primary"
	>
		<LoaderIcon className="size-6 animate-spin" aria-hidden />
		<span className="text-base font-mono font-medium ">Loading...</span>
	</div>
);

export default Loader;
