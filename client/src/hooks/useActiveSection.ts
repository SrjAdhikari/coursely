//* src/hooks/useActiveSection.ts

import { useEffect, useState } from "react";

/**
 * Scroll-spy hook. Watches the given section ids with an Intersection Observer
 * and returns the id of the one currently in view (the topmost when several
 * overlap), or null when none is — e.g. at the top of the page. Powers the
 * active state of anchor-based navigation. No-ops without IntersectionObserver.
 */
const useActiveSection = (sectionIds: string[]) => {
	const [activeId, setActiveId] = useState<string | null>(null);

	useEffect(() => {
		if (!("IntersectionObserver" in window)) return;

		const sections = sectionIds
			.map((id) => document.getElementById(id))
			.filter((element): element is HTMLElement => element !== null);

		if (sections.length === 0) return;

		// Track each section's visibility; active = first in document order that
		// is currently within the detection band below the sticky header.
		const visibility = new Map<string, boolean>();

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					visibility.set(entry.target.id, entry.isIntersecting);
				});

				const topmostVisible = sectionIds.find((id) => visibility.get(id));
				setActiveId(topmostVisible ?? null);
			},
			{ rootMargin: "-72px 0px -55% 0px" },
		);

		sections.forEach((section) => observer.observe(section));
		return () => observer.disconnect();
	}, [sectionIds]);

	return activeId;
};

export default useActiveSection;
