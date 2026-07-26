//* src/hooks/useCountdown.ts

import { useEffect, useState } from "react";

/**
 * A simple seconds countdown. Call `start(seconds)` to begin; `secondsLeft`
 * ticks down to 0 and stops. Used to mirror the resend cooldown on the button.
 */
const useCountdown = () => {
	const [secondsLeft, setSecondsLeft] = useState(0);

	useEffect(() => {
		if (secondsLeft <= 0) return;
		const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
		return () => clearTimeout(timer);
	}, [secondsLeft]);

	const start = (seconds: number) => setSecondsLeft(seconds);

	return { secondsLeft, start };
};

export default useCountdown;
