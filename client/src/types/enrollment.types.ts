//* src/types/enrollment.types.ts

/** Course summary embedded in a student's own enrollment row. */
export interface EnrolledCoursePayload {
	_id: string;
	title: string;
	slug: string;
	thumbnailUrl: string;
	instructorName: string;
	price: number;
	currency: string;
}

/** A student's own enrollment (My Courses), with the course populated. */
export interface MyEnrollmentPayload {
	_id: string;
	courseId: EnrolledCoursePayload;
	amountPaid?: number;
	currency?: string;
	createdAt: string;
}

/** A row in the admin enrollment table (student + course populated). */
export interface AdminEnrollmentPayload {
	_id: string;
	userId: { _id: string; name: string; email: string };
	courseId: { _id: string; title: string };
	amountPaid?: number;
	currency?: string;
	createdAt: string;
}

/** Pagination metadata returned by paginated admin lists. */
export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

/** A paginated payload: items plus pagination metadata. */
export interface PaginatedPayload<T> {
	items: T[];
	pagination: PaginationMeta;
}
