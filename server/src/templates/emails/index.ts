//* src/templates/emails/index.ts

/**
 * Barrel re-export all transactional email templates.
 * Import like: `import { VERIFY_EMAIL_TEMPLATE } from "../templates/emails";`
 */

export { default as PASSWORD_RESET_EMAIL_TEMPLATE } from "./passwordReset";
export { default as VERIFY_EMAIL_TEMPLATE } from "./verifyEmail";
