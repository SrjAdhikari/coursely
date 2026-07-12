//* src/hooks/useClientPagination.ts

import { useState } from "react";

/** Client-side pagination over an in-memory array. Auto-clamps the current page
 *  when `items` shrink (a search narrows the list or a row is removed). */
const useClientPagination = <Item>(items: Item[], pageSize: number) => {
	const [page, setPage] = useState(1);

	const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
	const safePage = Math.min(page, totalPages);
	const start = (safePage - 1) * pageSize;
	const pageItems = items.slice(start, start + pageSize);

	return { page: safePage, setPage, pageItems, total: items.length, totalPages };
};

export default useClientPagination;
