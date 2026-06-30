//* src/lib/stripe.ts

import Stripe from "stripe";
import envConfig from "../constants/env";

const { STRIPE_SECRET_KEY } = envConfig;

// Single shared Stripe client (mirrors lib/r2.ts): constructed once from env so
// the secret key is read at import time and the SDK reuses one HTTP agent. Pin the
// API version the installed SDK targets so runtime responses + TS types stay deterministic.
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2026-06-24.dahlia" });

export default stripe;
