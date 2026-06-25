//* src/components/Loader.tsx

import { LoaderIcon } from "lucide-react";

/** Centered full-screen spinner shown while the auth check is in flight. */
const Loader = () => (
	<div
		role="status"
		aria-label="Loading"
		className="flex min-h-screen items-center justify-center gap-2"
	>
		<LoaderIcon className="size-6 animate-spin text-primary" aria-hidden />
	</div>
);

export default Loader;
