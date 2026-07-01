//* src/components/course/PurchaseCard.tsx

import { Link } from "react-router";
import { Check, CircleCheck } from "lucide-react";

import ROUTES from "@/routes/paths";
import { Button } from "@/components/ui/button";

import { formatPrice } from "@/lib/currency";
import { formatRuntime } from "@/lib/duration";

type PurchaseStatus = "guest" | "buyable" | "enrolled";

interface PurchaseCardProps {
	slug: string;
	price: number;
	lessonCount: number;
	totalDuration: number;
	previewLessonCount: number;
	status: PurchaseStatus;
	onBuy: () => void;
	isBuying: boolean;
}

/** Footnote under the CTA, tailored to the buyer's state. */
const STATUS_NOTES: Record<PurchaseStatus, string> = {
	guest: "We'll bring you right back here after you sign in.",
	buyable: "Secure checkout by Stripe. You'll be redirected to pay.",
	enrolled: "Access your lessons anytime from My Courses.",
};

/** The sticky buy box on the course detail page; three ownership states. */
const PurchaseCard = ({
	slug,
	price,
	lessonCount,
	totalDuration,
	previewLessonCount,
	status,
	onBuy,
	isBuying,
}: PurchaseCardProps) => {
	const loginHref = `${ROUTES.LOGIN}?redirect=${encodeURIComponent(
		ROUTES.COURSE_DETAIL(slug),
	)}`;

	// Split the ₹ glyph from the digits so it can render dimmer than the amount.
	const formattedPrice = formatPrice(price);
	const currencySymbol = formattedPrice.slice(0, 1);
	const priceAmount = formattedPrice.slice(1);

	const showPreviewLine = status !== "enrolled" && previewLessonCount > 0;

	return (
		<aside className="overflow-hidden rounded-xl border border-input bg-card">
			<div className="p-5">
				{status === "enrolled" ? (
					<div className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
						<Check className="size-5" />
						You own this course
					</div>
				) : (
					<>
						<div className="flex items-baseline gap-1.5 font-heading text-3xl font-bold">
							<span className="text-base font-medium text-muted-foreground">
								{currencySymbol}
							</span>
							{priceAmount}
						</div>
						<p className="mt-1 text-xs text-muted-foreground">
							One-time payment · lifetime access
						</p>
					</>
				)}
			</div>

			<div className="px-5 pb-4">
				{status === "guest" && (
					<Button asChild className="w-full">
						<Link to={loginHref}>Log in to enroll</Link>
					</Button>
				)}

				{status === "buyable" && (
					<Button onClick={onBuy} disabled={isBuying} className="w-full">
						{isBuying ? "Redirecting…" : "Buy this course"}
					</Button>
				)}

				{status === "enrolled" && (
					<div className="space-y-3">
						<div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm text-primary">
							<CircleCheck className="size-4" /> Enrolled · full access unlocked
						</div>
						<Button asChild variant="outline" className="w-full">
							<Link to={ROUTES.MY_COURSES}>Go to My Courses</Link>
						</Button>
					</div>
				)}
			</div>

			<ul className="space-y-2.5 border-t border-border p-5 text-sm text-muted-foreground">
				<li className="flex items-center gap-2.5">
					<Check className="size-4 text-primary" />
					{lessonCount} video lessons
				</li>

				<li className="flex items-center gap-2.5">
					<Check className="size-4 text-primary" />
					{formatRuntime(totalDuration)} of content
				</li>

				<li className="flex items-center gap-2.5">
					<Check className="size-4 text-primary" />
					Lifetime access
				</li>

				{showPreviewLine && (
					<li className="flex items-center gap-2.5">
						<Check className="size-4 text-primary" />
						{previewLessonCount} free preview{" "}
						{previewLessonCount === 1 ? "lesson" : "lessons"}
					</li>
				)}
			</ul>

			<p className="px-5 pb-5 text-center text-xs text-muted-foreground">
				{STATUS_NOTES[status]}
			</p>
		</aside>
	);
};

export default PurchaseCard;
