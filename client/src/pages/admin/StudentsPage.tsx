//* src/pages/admin/StudentsPage.tsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, UsersRound, SearchX } from "lucide-react";

import { useListStudents } from "@/hooks/useStudents";
import Loader from "@/components/Loader";
import { Badge } from "@/components/ui/badge";
import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";
import LoadFailed from "@/components/common/LoadFailed";
import ROUTES from "@/routes/paths";

const rowAction =
	"cursor-pointer font-mono text-[13px] text-muted-foreground transition-colors";

const formatJoinedDate = (iso: string) =>
	new Date(iso).toLocaleDateString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});

const StudentsPage = () => {
	const navigate = useNavigate();
	const { data, isLoading, isError, refetch } = useListStudents();
	const [query, setQuery] = useState("");

	const students = useMemo(() => data?.data ?? [], [data]);
	const filtered = useMemo(() => {
		const term = query.trim().toLowerCase();
		if (!term) return students;

		return students.filter((student) =>
			[student.name, student.email].join(" ").toLowerCase().includes(term),
		);
	}, [students, query]);

	if (isLoading) return <Loader className="min-h-[60vh]" />;
	if (isError)
		return (
			<LoadFailed
				title="Couldn't load students"
				description="Something went wrong while loading your students. Check your connection and try again."
				onRetry={() => refetch()}
			/>
		);

	return (
		<section>
			<div className="mb-7">
				<h1 className="font-heading text-3xl font-semibold">Students</h1>
				<p className="mt-1.5 font-mono text-sm text-muted-foreground">
					View learners and manage their role &amp; account status.
				</p>
			</div>

			<div className="overflow-hidden rounded-xl border border-border bg-card">
				<div className="flex items-center justify-between gap-3.5 border-b border-border p-4">
					<div className="flex max-w-80 flex-1 items-center gap-2.5 rounded-lg border border-input bg-card px-3 py-2 focus-within:border-primary/30">
						<Search className="size-4 text-muted-foreground" />
						<input
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search by name or email…"
							aria-label="Search students"
							className="flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground"
						/>
					</div>

					<span className="font-mono text-xs text-muted-foreground">
						{students.length} {students.length === 1 ? "student" : "students"}
					</span>
				</div>

				{filtered.length === 0 ? (
					students.length === 0 ? (
						<EmptyStatePlaceholder
							icon={UsersRound}
							title="No students yet"
							description="Students will appear here once people sign up."
						/>
					) : (
						<EmptyStatePlaceholder
							icon={SearchX}
							title="No matching students"
							description="Try a different search term."
						/>
					)
				) : (
					<table className="w-full border-collapse">
						<thead>
							<tr className="border-b border-border text-left font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground">
								<th scope="col" className="px-5 py-3 font-medium">
									Student
								</th>
								<th scope="col" className="px-5 py-3 font-medium">
									Role
								</th>
								<th scope="col" className="px-5 py-3 font-medium">
									Status
								</th>
								<th scope="col" className="px-5 py-3 font-medium">
									Joined
								</th>
								<th scope="col" className="px-5 py-3 text-right font-medium">
									Actions
								</th>
							</tr>
						</thead>

						<tbody>
							{filtered.map((student) => (
								<tr
									key={student._id}
									className="border-b border-border text-sm last:border-0 hover:bg-muted/40"
								>
									<td className="px-5 py-3.5">
										<div className="font-semibold">{student.name}</div>
										<div className="font-mono text-[11.5px] text-muted-foreground">
											{student.email}
										</div>
									</td>

									<td className="px-5 py-3.5">
										<Badge
											variant={student.role === "admin" ? "secondary" : "muted"}
										>
											{student.role === "admin" ? "Admin" : "Student"}
										</Badge>
									</td>

									<td className="px-5 py-3.5">
										<Badge
											variant={student.isActive ? "accent" : "destructive"}
										>
											{student.isActive ? "Active" : "Deactivated"}
										</Badge>
									</td>

									<td className="px-5 py-3.5 font-mono text-muted-foreground">
										{formatJoinedDate(student.createdAt)}
									</td>

									<td className="px-5 py-3.5">
										<div className="flex justify-end">
											<button
												type="button"
												aria-label={`Manage ${student.name}`}
												onClick={() =>
													navigate(ROUTES.adminStudent(student._id))
												}
												className={`${rowAction} hover:text-primary`}
											>
												Manage
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</section>
	);
};

export default StudentsPage;
