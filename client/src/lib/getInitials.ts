//* src/lib/getInitials.ts

/**
 * Returns up to two uppercase initials from a user's name.
 * e.g., "Suraj Adhikari" → "SA", "suraj" → "SU"
 */
const getInitials = (name: string) => {
	const trimmed = name.trim();
	const words = trimmed.split(/\s+/);

	const initials =
		words.length >= 2 ? words[0][0] + words[1][0] : trimmed.slice(0, 2);

	return initials.toUpperCase();
};

export default getInitials;
