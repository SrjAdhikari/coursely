//* src/templates/emails/_components.ts

import { brand } from "./_base";

/** Body paragraph — consistent size, line-height, spacing. */
const paragraph = (text: string): string =>
	`<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: ${brand.textColor};">${text}</p>`;

/** Secondary / muted paragraph — for explanatory text below the main point. */
const mutedParagraph = (text: string): string =>
	`<p style="margin: 16px 0 0; font-size: 13px; line-height: 1.6; color: ${brand.mutedColor};">${text}</p>`;

/**
 * Primary call-to-action button. Centered, brand-colored, wide tap target —
 * the single action every transactional email asks the reader to take.
 */
const ctaButton = (href: string, label: string): string => `
<div style="text-align: center; margin: 28px 0;">
	<a href="${href}" style="display: inline-block; padding: 14px 28px; background-color: ${brand.primaryColor}; border-radius: 8px; font-size: 15px; font-weight: 600; color: ${brand.primaryForeground}; text-decoration: none;">${label}</a>
</div>`;

/**
 * Brand-tinted callout for security-relevant information — draws the eye without alarming the reader.
 * Use for expiration notes, "if this wasn't you" guidance, etc.
 */
const infoCallout = (message: string): string => `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0; background-color: ${brand.alertBg}; border-left: 3px solid ${brand.alertBorder}; border-radius: 4px;">
	<tr>
		<td style="padding: 12px 16px; font-size: 14px; line-height: 1.6; color: ${brand.alertText};">${message}</td>
	</tr>
</table>`;

export { paragraph, mutedParagraph, ctaButton, infoCallout };
