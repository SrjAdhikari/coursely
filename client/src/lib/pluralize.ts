//* src/lib/pluralize.ts

/** "<count> <noun>", pluralizing the noun (+"s") when count ≠ 1. */
const pluralize = (count: number, noun: string): string =>
	`${count} ${count === 1 ? noun : `${noun}s`}`;

/** Just the noun, pluralized (+"s") when count ≠ 1, count is rendered separately. */
export const pluralizeNoun = (count: number, noun: string): string =>
	count === 1 ? noun : `${noun}s`;

export default pluralize;
