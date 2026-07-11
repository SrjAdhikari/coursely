//* src/hooks/useScrollReveal.ts

import { useEffect } from "react";

/**
 * A custom React hook that reveals elements on scroll using the Intersection Observer API.
 * It observes elements with the class "reveal-on-scroll" and adds the class "is-visible"
 * when they enter the viewport. If Intersection Observer is not supported, it will
 * immediately reveal all elements.
 */
const useScrollReveal = () => {
	useEffect(() => {
		const elements =
			document.querySelectorAll<HTMLElement>(".reveal-on-scroll");

		if (!("IntersectionObserver" in window)) {
			elements.forEach((element) => element.classList.add("is-visible"));
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-visible");
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
		);

		elements.forEach((element) => observer.observe(element));
		return () => observer.disconnect();
	}, []);
};

export default useScrollReveal;
