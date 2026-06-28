//* src/components/admin/CourseFormLoadFailed.tsx

import { Link } from "react-router";
import { RefreshCw, ServerCrash } from "lucide-react";

import { Button } from "@/components/ui/button";
import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";
import ROUTES from "@/routes/paths";

interface CourseLoadFailedProps {
	onRetry: () => void;
}

/**
 * Shown when a single course fails to load in the edit form. Static, friendly
 * copy (never the backend's raw `error.message`); offers a retry and a way back.
 */
const CourseLoadFailed = ({ onRetry }: CourseLoadFailedProps) => (
	<div role="alert">
		<EmptyStatePlaceholder
			icon={ServerCrash}
			title="Couldn't load this course"
			description="It may have been removed, or something went wrong. Try again or go back to courses."
		>
			<div className="flex gap-3">
				<Button
					variant="outline"
					onClick={onRetry}
					className="cursor-pointer font-mono"
				>
					<RefreshCw aria-hidden="true" className="size-4" />
					Try again
				</Button>

				<Button asChild variant="ghost" className="cursor-pointer font-mono">
					<Link to={ROUTES.ADMIN_COURSES}>Back to courses</Link>
				</Button>
			</div>
		</EmptyStatePlaceholder>
	</div>
);

export default CourseLoadFailed;
