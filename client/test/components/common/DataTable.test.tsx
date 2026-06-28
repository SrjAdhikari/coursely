//* test/components/common/DataTable.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import DataTable, { type Column } from "@/components/common/DataTable";

interface Row {
	id: string;
	name: string;
	price: number;
}

const rows: Row[] = [
	{ id: "1", name: "Alpha", price: 100 },
	{ id: "2", name: "Beta", price: 200 },
];

const columns: Column<Row>[] = [
	{ header: "Name", cell: (row) => row.name },
	{ header: "Price", cell: (row) => `₹${row.price}`, align: "right" },
];

describe("DataTable", () => {
	it("renders a header per column and a row per item", () => {
		render(
			<DataTable columns={columns} rows={rows} getRowKey={(row) => row.id} />,
		);
		expect(
			screen.getByRole("columnheader", { name: "Name" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("columnheader", { name: "Price" }),
		).toBeInTheDocument();
		expect(screen.getAllByRole("row")).toHaveLength(3); // header + 2 rows
		expect(screen.getByText("Alpha")).toBeInTheDocument();
		expect(screen.getByText("₹200")).toBeInTheDocument();
	});

	it("forwards aria-labelledby so the table has an accessible name", () => {
		render(
			<>
				<h2 id="my-heading">My table</h2>
				<DataTable
					columns={columns}
					rows={rows}
					getRowKey={(row) => row.id}
					ariaLabelledby="my-heading"
				/>
			</>,
		);
		expect(
			screen.getByRole("table", { name: "My table" }),
		).toBeInTheDocument();
	});

	it("right-aligns a column flagged align=right", () => {
		render(
			<DataTable columns={columns} rows={rows} getRowKey={(row) => row.id} />,
		);
		expect(screen.getByRole("columnheader", { name: "Price" })).toHaveClass(
			"text-right",
		);
	});

	it("applies align and cellClassName to the body cells", () => {
		const styledColumns: Column<Row>[] = [
			{ header: "Name", cell: (row) => row.name, cellClassName: "font-bold" },
			{ header: "Price", cell: (row) => `₹${row.price}`, align: "right" },
		];
		render(
			<DataTable
				columns={styledColumns}
				rows={rows}
				getRowKey={(row) => row.id}
			/>,
		);
		expect(screen.getByText("Alpha").closest("td")).toHaveClass("font-bold");
		expect(screen.getByText("₹100").closest("td")).toHaveClass("text-right");
	});
});
