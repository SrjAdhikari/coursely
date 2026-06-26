//* src/utils/slug.ts

/**
 * Convert a title into a "slug" — the URL-safe version used to identify a
 * course in its web address.
 *
 * "The Complete React Course"
 *   -> "the-complete-react-course"
 *   -> coursely.app/courses/the-complete-react-course
 *
 * Lowercase, words joined by single hyphens, punctuation stripped. Accented
 * Latin letters are folded to ASCII (é → e). Falls back to "course" if nothing
 * slug-able is left.
 */
const slugify = (text: string): string => {
	const slug = text
		.normalize("NFKD") // decompose accented letters into base char + mark
		.replace(/\p{Mn}/gu, "") // strip the combining marks: é → e, û → u
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return slug || "course";
};

export { slugify };
