//* src/pages/admin/StudentManagePage.tsx

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useGetStudent, useUpdateStudent } from "@/hooks/useStudents";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import DataTable, { type Column } from "@/components/common/DataTable";
import LoadFailed from "@/components/common/LoadFailed";
import DeactivateDialog from "@/components/admin/DeactivateDialog";
import { formatPrice } from "@/lib/currency";
import { STUDENTS_KEY, studentKey } from "@/lib/queryKeys";
import ROUTES from "@/routes/paths";

const cardClass = "rounded-xl border border-border bg-card p-5";
const cardLabel =
	"font-mono text-[11px] uppercase tracking-wide text-muted-foreground";
const cardValue = "mt-2 font-heading text-3xl font-bold";

const formatJoinedDate = (iso: string) =>
	new Date(iso).toLocaleDateString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});

interface StudentEnrollment {
	course: string;
	purchased: string;
	amount: number;
	progress: number;
}

// Phase 5 placeholder — sample enrollments shown until the payments/enrollment
// feature lands; swap for real data from the enrollments API then.
const sampleEnrollments: StudentEnrollment[] = [
	{ course: "React from Scratch", purchased: "Jun 23", amount: 89900, progress: 38 },
	{ course: "JavaScript Essentials", purchased: "Apr 12", amount: 69900, progress: 100 },
	{ course: "HTML Foundations", purchased: "Mar 30", amount: 49900, progress: 100 },
	{ course: "Node.js & Express APIs", purchased: "May 18", amount: 99900, progress: 22 },
];

const enrollmentColumns: Column<StudentEnrollment>[] = [
	{
		header: "Course",
		cellClassName: "font-medium",
		cell: (enrollment) => enrollment.course,
	},
	{
		header: "Purchased",
		cellClassName: "font-mono text-muted-foreground",
		cell: (enrollment) => enrollment.purchased,
	},
	{
		header: "Amount",
		cellClassName: "font-mono font-semibold",
		cell: (enrollment) => formatPrice(enrollment.amount),
	},
	{
		header: "Progress",
		cellClassName: "font-mono",
		cell: (enrollment) => `${enrollment.progress}%`,
	},
];

const StudentManagePage = () => {
	const { id = "" } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data, isLoading, isError, refetch } = useGetStudent(id);
	const { mutate: updateStudent, isPending } = useUpdateStudent();
	const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);

	if (isLoading) return <Loader className="min-h-[60vh]" />;
	if (isError || !data)
		return (
			<LoadFailed
				title="Couldn't load this student"
				description="They may have been removed, or something went wrong. Try again or go back to students."
				onRetry={() => refetch()}
				backTo={ROUTES.ADMIN_STUDENTS}
				backLabel="Back to students"
			/>
		);

	const student = data.data;

	// The endpoint resolves only role:"student", so a loaded user is always a
	// student. Promoting removes them from that scope: drop the now-stale detail
	// from the cache and return to the list.
	const promoteToAdmin = () =>
		updateStudent(
			{ id, payload: { role: "admin" } },
			{
				onSuccess: () => {
					queryClient.removeQueries({ queryKey: studentKey(id) });
					queryClient.invalidateQueries({ queryKey: STUDENTS_KEY });
					toast.success(`${student.name} promoted to admin`);
					navigate(ROUTES.ADMIN_STUDENTS);
				},
				onError: (error) => toast.error(error.message),
			},
		);

	const setAccountActive = (isActive: boolean) =>
		updateStudent(
			{ id, payload: { isActive } },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: STUDENTS_KEY });
					queryClient.invalidateQueries({ queryKey: studentKey(id) });
					toast.success(
						isActive ? "Account reactivated" : "Account deactivated",
					);
				},
				onError: (error) => toast.error(error.message),
			},
		);

	return (
		<section className="max-w-5xl">
			<div className="mb-2 font-mono text-xs text-muted-foreground">
				<Link to={ROUTES.ADMIN_STUDENTS} className="hover:text-foreground">
					Students
				</Link>
				{" / "}
				{student.name}
			</div>

			<div className="mb-7 flex items-center gap-3.5">
				<span className="size-12 rounded-full bg-linear-to-br from-muted to-input" />
				<div>
					<h1 className="font-heading text-2xl font-semibold">
						{student.name}
					</h1>
					<div className="font-mono text-xs text-muted-foreground">
						{student.email} · joined {formatJoinedDate(student.createdAt)}
					</div>
				</div>
			</div>

			<div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div className={cardClass}>
					<div className={cardLabel}>Role</div>
					<div className={cardValue}>
						{student.role === "admin" ? "Admin" : "Student"}
					</div>
					{student.role === "student" && (
						<Button
							variant="outline"
							size="lg"
							className="mt-4 font-mono"
							disabled={isPending}
							onClick={promoteToAdmin}
						>
							Promote to admin
						</Button>
					)}
				</div>

				<div className={cardClass}>
					<div className={cardLabel}>Account</div>
					<div className={cardValue}>
						{student.isActive ? "Active" : "Deactivated"}
					</div>
					{student.isActive ? (
						<Button
							variant="destructive"
							size="lg"
							aria-label="Deactivate account"
							className="mt-4 font-mono"
							disabled={isPending}
							onClick={() => setConfirmingDeactivate(true)}
						>
							Deactivate
						</Button>
					) : (
						<Button
							variant="outline"
							size="lg"
							aria-label="Reactivate account"
							className="mt-4 font-mono"
							disabled={isPending}
							onClick={() => setAccountActive(true)}
						>
							Reactivate
						</Button>
					)}
				</div>

				<div className={cardClass}>
					<div className={cardLabel}>Enrollments</div>
					<div className={cardValue}>{sampleEnrollments.length}</div>
					<div className="mt-1 font-mono text-xs text-success">
						lifetime access
					</div>
				</div>
			</div>

			<div className="overflow-hidden rounded-xl border border-border bg-card">
				<div className="border-b border-border p-5">
					<h2
						id="their-enrollments-heading"
						className="font-heading text-lg font-semibold"
					>
						Their enrollments
					</h2>
				</div>

				<DataTable
					columns={enrollmentColumns}
					rows={sampleEnrollments}
					getRowKey={(enrollment) => enrollment.course}
					ariaLabelledby="their-enrollments-heading"
				/>
			</div>

			{confirmingDeactivate && (
				<DeactivateDialog
					studentName={student.name}
					onConfirm={() => setAccountActive(false)}
					onClose={() => setConfirmingDeactivate(false)}
				/>
			)}
		</section>
	);
};

export default StudentManagePage;
