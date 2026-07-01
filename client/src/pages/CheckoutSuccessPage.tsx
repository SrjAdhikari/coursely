//* src/pages/CheckoutSuccessPage.tsx

import { useEffect, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";

import ROUTES from "@/routes/paths";
import { useCheckoutStatus } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
import { MY_ENROLLMENTS_KEY } from "@/lib/queryKeys";

// Auto-retry cadence, then fall back to a manual "Check again" (6 × 1.5s ≈ 9s).
const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 6;

type ResultTone = "neutral" | "success" | "danger";

const DISC_TONES: Record<ResultTone, string> = {
	neutral: "border-border bg-card",
	success: "border-primary/30 bg-primary/10",
	danger: "border-destructive/30 bg-destructive/10",
};

const Result = ({
	icon,
	title,
	message,
	detail,
	tone = "neutral",
	children,
}: {
	icon: ReactNode;
	title: string;
	message: ReactNode;
	detail?: string;
	tone?: ResultTone;
	children?: ReactNode;
}) => (
	<div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
		<div
			className={`mb-5 flex size-16 items-center justify-center rounded-full border ${DISC_TONES[tone]}`}
		>
			{icon}
		</div>
		<h1 className="font-heading text-2xl font-semibold">{title}</h1>
		<p className="mt-2.5 text-sm text-muted-foreground">{message}</p>
		{detail && <p className="mt-2 text-xs text-muted-foreground">{detail}</p>}
		{children && (
			<div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
		)}
	</div>
);

/** Reconciles a Stripe hosted-Checkout session, auto-retrying while it settles. */
const CheckoutSuccessPage = () => {
	const [searchParams] = useSearchParams();
	const sessionId = searchParams.get("session_id") ?? "";

	const [attempts, setAttempts] = useState(0);
	const [hasEnrolled, setHasEnrolled] = useState(false);

	const queryClient = useQueryClient();
	const pollDeadlinePassed = attempts >= MAX_POLL_ATTEMPTS;
	// Stop polling once enrolled, past the retry deadline, or with no session.
	const shouldPoll = !!sessionId && !pollDeadlinePassed && !hasEnrolled;

	const { data, isError, refetch } = useCheckoutStatus(sessionId, shouldPoll);
	const checkoutStatus = data?.data;
	const enrolled = checkoutStatus?.enrolled ?? false;

	// Latch enrollment so polling stops immediately (and stays stopped).
	useEffect(() => {
		if (enrolled) setHasEnrolled(true);
	}, [enrolled]);

	// Count auto-retries; when polling stops the interval clears itself.
	useEffect(() => {
		if (!shouldPoll) return;
		const retryTicker = setInterval(
			() => setAttempts((current) => current + 1),
			POLL_INTERVAL_MS,
		);
		return () => clearInterval(retryTicker);
	}, [shouldPoll]);

	useEffect(() => {
		if (enrolled)
			queryClient.invalidateQueries({ queryKey: MY_ENROLLMENTS_KEY });
	}, [enrolled, queryClient]);

	const handleCheckAgain = () => {
		setAttempts(0);
		refetch();
	};

	if (!sessionId)
		return (
			<Result
				tone="danger"
				icon={<XCircle className="size-9 text-destructive" />}
				title="Missing checkout reference"
				message="We couldn't find a checkout session to confirm."
			>
				<Button asChild>
					<Link to={ROUTES.MY_COURSES}>Go to My Courses</Link>
				</Button>
			</Result>
		);

	if (isError)
		return (
			<Result
				tone="danger"
				icon={<XCircle className="size-9 text-destructive" />}
				title="We couldn't confirm this checkout"
				message="If you were charged, your access will appear in My Courses shortly."
			>
				<Button asChild>
					<Link to={ROUTES.MY_COURSES}>Go to My Courses</Link>
				</Button>
				<Button variant="outline" onClick={handleCheckAgain}>
					Check again
				</Button>
			</Result>
		);

	if (enrolled)
		return (
			<Result
				tone="success"
				icon={<CheckCircle2 className="size-9 text-primary" />}
				title="You're enrolled!"
				message={
					checkoutStatus?.course?.title ? (
						<>
							Payment confirmed —{" "}
							<span className="text-primary">
								{checkoutStatus.course.title}
							</span>{" "}
							is now in your library.
						</>
					) : (
						"Payment confirmed."
					)
				}
				detail="A receipt has been emailed to you by Stripe."
			>
				<Button asChild>
					<Link to={ROUTES.MY_COURSES}>Go to My Courses</Link>
				</Button>

				{checkoutStatus?.course?.slug && (
					<Button asChild variant="outline">
						<Link to={ROUTES.COURSE_DETAIL(checkoutStatus.course.slug)}>
							Back to course
						</Link>
					</Button>
				)}
			</Result>
		);

	const currentAttempt = Math.min(attempts + 1, MAX_POLL_ATTEMPTS);

	return (
		<Result
			icon={
				<div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
			}
			title={
				pollDeadlinePassed ? "Still processing…" : "Confirming your payment…"
			}
			message={
				pollDeadlinePassed
					? "This is taking longer than usual. You can check again, or come back to My Courses in a bit."
					: "This usually takes just a few seconds. We're checking with Stripe and will update automatically."
			}
			detail={
				pollDeadlinePassed
					? undefined
					: `attempt ${currentAttempt} of ${MAX_POLL_ATTEMPTS} · checking…`
			}
		>
			<Button variant="outline" onClick={handleCheckAgain}>
				Check again
			</Button>
		</Result>
	);
};

export default CheckoutSuccessPage;
