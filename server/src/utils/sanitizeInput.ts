//* src/utils/sanitizeInput.ts

import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

/**
 * Strip ALL HTML/script from a free-text value, keeping only the visible text —
 * a defense-in-depth layer against stored XSS sitting behind zod + Mongoose.
 */
const sanitizeInput = (input: unknown): string => {
	if (typeof input !== "string") return "";
	const cleaned = purify.sanitize(input, {
		ALLOWED_TAGS: [],
		ALLOWED_ATTR: [],
	});

	// Trim because stripping tags can leave edge whitespace ("<b> Al </b>" -> " Al ").
	return cleaned.trim();
};

export default sanitizeInput;
