//* src/lib/stripe.ts

import Stripe from "stripe";
import envConfig from "../constants/env";

const { STRIPE_SECRET_KEY } = envConfig;

// Single shared Stripe client (mirrors lib/r2.ts): constructed once from env so
// the secret key is read at import time and the SDK reuses one HTTP agent. The
// account's pinned API version is used (no apiVersion override needed).
const stripe = new Stripe(STRIPE_SECRET_KEY);

export default stripe;
