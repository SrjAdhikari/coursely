//* src/components/admin/StudentLoadFailed.tsx

import { Link } from "react-router";
import { RefreshCw, ServerCrash } from "lucide-react";

import { Button } from "@/components/ui/button";
import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";
import ROUTES from "@/routes/paths";

interface StudentLoadFailedProps {
	onRetry: () => void;
}

/**
 * Shown when a single student fails to load on the manage page. Static, friendly
 * copy (never the backend's raw `error.message`); offers a retry and a way back.
 */
const StudentLoadFailed = ({ onRetry }: StudentLoadFailedProps) => (
	<div role="alert">
		<EmptyStatePlaceholder
			icon={ServerCrash}
			title="Couldn't load this student"
			description="They may have been removed, or something went wrong. Try again or go back to students."
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
					<Link to={ROUTES.ADMIN_STUDENTS}>Back to students</Link>
				</Button>
			</div>
		</EmptyStatePlaceholder>
	</div>
);

export default StudentLoadFailed;
