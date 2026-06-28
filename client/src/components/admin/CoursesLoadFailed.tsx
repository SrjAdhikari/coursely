//* src/components/admin/CoursesLoadFailed.tsx

import { RefreshCw, ServerCrash } from "lucide-react";

import { Button } from "@/components/ui/button";
import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";

interface CoursesLoadFailedProps {
	onRetry: () => void;
}

/**
 * Shown when the admin courses query fails. Uses static, friendly copy (never
 * the backend's raw `error.message`) and offers a retry. The list endpoint has
 * no resource-specific failure codes, so a single fallback message covers it.
 */
const CoursesLoadFailed = ({ onRetry }: CoursesLoadFailedProps) => (
	<div role="alert">
		<EmptyStatePlaceholder
			icon={ServerCrash}
			title="Couldn't load courses"
			description="Something went wrong while loading your courses. Check your connection and try again."
		>
			<Button
				variant="outline"
				onClick={onRetry}
				className="cursor-pointer font-mono"
			>
				<RefreshCw aria-hidden="true" className="size-4" />
				Try again
			</Button>
		</EmptyStatePlaceholder>
	</div>
);

export default CoursesLoadFailed;
