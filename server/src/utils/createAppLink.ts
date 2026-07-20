//* src/utils/createAppLink.ts

import envConfig from "../constants/env";

const { APP_ORIGIN } = envConfig;

/** Build a client-side link that carries a one-time token. */
const createAppLink = (path: string, token: string): string => {
	const link = `${APP_ORIGIN}/${path}?token=${token}`;
	return link;
};

export default createAppLink;
