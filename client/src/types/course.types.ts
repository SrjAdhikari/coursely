//* src/types/course.types.ts

/** A course as returned by the admin endpoints. */
export interface CoursePayload {
	_id: string;
	title: string;
	slug: string;
	description: string;
	instructorName: string;
	thumbnailUrl: string;
	trailerKey?: string;
	price: number;
	currency: string;
	isPublished: boolean;
	createdAt: string;
	updatedAt: string;
}

/** A lesson within a section. */
export interface LessonPayload {
	_id: string;
	sectionId: string;
	courseId: string;
	title: string;
	order: number;
	isPreview: boolean;
	videoKey?: string;
	duration: number;
}

/** A section's own fields (what the section create/update endpoints return). */
export interface SectionPayload {
	_id: string;
	courseId: string;
	title: string;
	order: number;
}

/** A section with its nested lessons, as embedded in the curriculum detail. */
export interface SectionWithLessons extends SectionPayload {
	lessons: LessonPayload[];
}

/** A course with its full nested curriculum (sections and their lessons). */
export interface CourseWithCurriculum extends CoursePayload {
	sections: SectionWithLessons[];
}

/** Fields for creating a course. */
export interface CreateCoursePayload {
	title: string;
	description: string;
	instructorName: string;
	thumbnailUrl: string;
	price: number;
	currency?: string;
	isPublished?: boolean;
}

/** Fields for updating a course (all optional). */
export type UpdateCoursePayload = Partial<CreateCoursePayload>;

/** Fields for creating a section. */
export interface CreateSectionPayload {
	title: string;
	order?: number;
}

/** Fields for updating a section (all optional). */
export type UpdateSectionPayload = Partial<CreateSectionPayload>;

/** Fields for creating a lesson. */
export interface CreateLessonPayload {
	title: string;
	order?: number;
	isPreview?: boolean;
	duration?: number;
}

/** Fields for updating a lesson (all optional). */
export type UpdateLessonPayload = Partial<CreateLessonPayload>;

/** A published course as returned by the public catalog list. */
export interface PublicCoursePayload {
	_id: string;
	title: string;
	slug: string;
	description: string;
	instructorName: string;
	thumbnailUrl: string;
	price: number;
	currency: string;
	isPublished: boolean;
	createdAt: string;
}

/** A lesson as exposed on the public course detail (no videoKey). */
export interface PublicLessonPayload {
	_id: string;
	sectionId: string;
	courseId: string;
	title: string;
	order: number;
	isPreview: boolean;
	duration: number;
}

/** A section with its public lessons, embedded in the course detail. */
export interface PublicSectionPayload {
	_id: string;
	courseId: string;
	title: string;
	order: number;
	lessons: PublicLessonPayload[];
}

/** A published course with its full public curriculum (no trailerKey/videoKey). */
export interface PublicCourseDetailPayload extends PublicCoursePayload {
	sections: PublicSectionPayload[];
}
