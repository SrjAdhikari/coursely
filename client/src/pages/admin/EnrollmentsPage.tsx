//* src/pages/admin/EnrollmentsPage.tsx

import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";

import type { AdminEnrollmentPayload } from "@/types/enrollment.types";
import { useListEnrollments } from "@/hooks/useEnrollments";

import DataTable, { type Column } from "@/components/common/DataTable";
import Paginator from "@/components/common/Paginator";
import Loader from "@/components/Loader";
import LoadFailed from "@/components/common/LoadFailed";
import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";
import { Badge } from "@/components/ui/badge";

import { formatPrice } from "@/lib/currency";
import { formatDate } from "@/lib/date";

const PAGE_SIZE = 10;

// Static columns — no props/state, so build once at module scope.
const enrollmentColumns: Column<AdminEnrollmentPayload>[] = [
	{
		header: "Student",
		cell: (enrollment) => (
			<>
				<div className="font-semibold">{enrollment.userId.name}</div>
				<div className="text-xs text-muted-foreground">
					{enrollment.userId.email}
				</div>
			</>
		),
	},
	{ header: "Course", cell: (enrollment) => enrollment.courseId.title },
	{
		header: "Amount",
		align: "right",
		cellClassName: "font-semibold",
		cell: (enrollment) =>
			enrollment.amountPaid === undefined
				? "—"
				: formatPrice(enrollment.amountPaid),
	},
	{
		header: "Enrolled",
		align: "right",
		cellClassName: "text-muted-foreground",
		cell: (enrollment) => formatDate(enrollment.createdAt),
	},
];

const EnrollmentsPage = () => {
	const [page, setPage] = useState(1);
	const { data, isLoading, isError, refetch } = useListEnrollments(
		page,
		PAGE_SIZE,
	);

	const result = data?.data;
	const enrollments = useMemo(() => result?.items ?? [], [result]);

	const totalPages = result?.pagination.totalPages ?? 1;
	const total = result?.pagination.total ?? 0;

	if (isLoading) return <Loader className="min-h-[80vh]" />;
	if (isError)
		return (
			<LoadFailed
				title="Couldn't load enrollments"
				description="Something went wrong while loading enrollments. Check your connection and try again."
				onRetry={() => refetch()}
			/>
		);

	return (
		<section>
			<div className="mb-7 flex items-start justify-between gap-4">
				<div>
					<h1 className="font-heading text-3xl font-semibold">Enrollments</h1>
					<p className="mt-1.5 text-sm text-muted-foreground">
						Every paid enrollment, newest first.
					</p>
				</div>
				<Badge variant="muted">{total} total</Badge>
			</div>

			<div className="overflow-hidden rounded-xl border border-border bg-card">
				{enrollments.length === 0 ? (
					<EmptyStatePlaceholder
						icon={ClipboardList}
						title="No enrollments yet"
						description="Paid enrollments will appear here."
					/>
				) : (
					<>
						<DataTable
							columns={enrollmentColumns}
							rows={enrollments}
							getRowKey={(enrollment) => enrollment._id}
						/>

						<Paginator
							page={page}
							pageSize={PAGE_SIZE}
							total={total}
							totalPages={totalPages}
							onPageChange={setPage}
						/>
					</>
				)}
			</div>
		</section>
	);
};

export default EnrollmentsPage;
