//* src/components/common/DataTable.tsx

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<Row> {
	header: string;
	cell: (row: Row) => ReactNode;
	align?: "right";
	cellClassName?: string;
}

interface DataTableProps<Row> {
	columns: Column<Row>[];
	rows: Row[];
	getRowKey: (row: Row) => string;
	/** id of a heading that labels the table (sets the table's accessible name). */
	ariaLabelledby?: string;
}

const headRowClass =
	"border-b border-border text-left font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground";
const bodyRowClass =
	"border-b border-border text-sm last:border-0 hover:bg-muted/40";

/** Column-config table: renders the shared shell and maps each row to cells. */
const DataTable = <Row,>({
	columns,
	rows,
	getRowKey,
	ariaLabelledby,
}: DataTableProps<Row>) => (
	<table aria-labelledby={ariaLabelledby} className="w-full border-collapse">
		<thead>
			<tr className={headRowClass}>
				{columns.map((column) => (
					<th
						key={column.header}
						scope="col"
						className={cn(
							"px-5 py-3 font-medium",
							column.align === "right" && "text-right",
						)}
					>
						{column.header}
					</th>
				))}
			</tr>
		</thead>

		<tbody>
			{rows.map((row) => (
				<tr key={getRowKey(row)} className={bodyRowClass}>
					{columns.map((column) => (
						<td
							key={column.header}
							className={cn(
								"px-5 py-3.5",
								column.align === "right" && "text-right",
								column.cellClassName,
							)}
						>
							{column.cell(row)}
						</td>
					))}
				</tr>
			))}
		</tbody>
	</table>
);

export default DataTable;
