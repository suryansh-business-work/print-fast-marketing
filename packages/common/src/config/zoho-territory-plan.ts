// ============================================================================
// Zoho Forms wiring for the Territory Plan form on the direct mail + social
// media landing page (/lp/direct-mail-social-media-marketing/).
//
// Same transport as `zoho-contact.ts`, so read its header first: the browser
// posts straight at the published form's `htmlRecords/submit` endpoint, cannot
// read Zoho's reply, and a rejected record looks exactly like a stored one.
// The target here is the form "PF Landing Page (Oct 2026 - New site)". Every
// field name and option value below was checked on 2026-10-28 with the 409
// probe described in `zoho-contact.ts`, and cross-checked against the form's
// exported HTML. What the probe showed beyond the export:
//
// - Radio and dropdown values must match Zoho's option text exactly. The
//   page's earlier "First week of December" was refused outright.
// - The phone number must be digits only; "(555) 010-0000" is refused.
// - The email needs a dot in its domain, and so does the website. The website
//   does not need a scheme: "example.com" is accepted.
// - A stored record is answered 302 to the form's thank-you redirect,
//   https://www.print-fast.com/thank-you.html, which 404s. The browser follows
//   that redirect out of sight, so a 404 in the console after a submit is that
//   page, not Zoho refusing the record (a refusal is a 409).
// ============================================================================

import { appendZohoPhone, splitPhone } from './zoho-contact';

const env = (import.meta.env ?? {}) as Record<string, string | undefined>;

/** `.../formperma/<key>/htmlRecords/submit` — override per environment. */
export const ZOHO_TERRITORY_PLAN_FORM_ACTION =
  env.PUBLIC_ZOHO_TERRITORY_PLAN_FORM_URL ||
  'https://forms.zohopublic.com/printfastllc/form/PFLandingPageOct2026Newsite/formperma/nnPubVO5Ur1tDN4b2lBs5M5sjqvJfI60En9Ug2i0w8g/htmlRecords/submit';

/** The option lists, spelled exactly as Zoho stores them. The page renders these verbatim. */
export const ZOHO_TRADES = [
  'HVAC',
  'Plumbing',
  'Electrical',
  'Roofing',
  'Landscaping',
  'Pest control',
  'Painting',
  'House cleaning',
  'Fencing',
  'Pool',
  'Garage door',
  'Other home service',
] as const;

export const ZOHO_LANDING_WINDOWS = ['First week of Dec.', 'Right after New Year', 'Spring push', 'Not sure yet'] as const;

export const ZOHO_AD_CHANNELS = [
  'Meta (Facebook and Instagram)',
  'Google and YouTube',
  'ChatGPT ads',
  'Just the mail for now',
] as const;

/** The channel that rules out the other three. */
export const ZOHO_MAIL_ONLY_CHANNEL: (typeof ZOHO_AD_CHANNELS)[number] = 'Just the mail for now';

export const ZOHO_AD_SPEND = [
  'Not sure yet',
  'Under $500',
  '$500 to $1,000',
  '$1,000 to $2,500',
  '$2,500 to $5,000',
  '$5,000+',
] as const;

/**
 * One Territory Plan request. Mandatory in Zoho: trade, towns, landing window,
 * both halves of the name, email, phone, company and the terms box.
 */
export interface TerritoryPlanInput {
  trade: string;
  towns: string;
  landing: string;
  channels: string[];
  spend?: string;
  firstName: string;
  lastName: string;
  email: string;
  /** As typed: formatting and a leading "+code" are both fine. */
  phone: string;
  company: string;
  /** Optional in Zoho, but validated by it when present. */
  website?: string;
  consent: boolean;
  /** Page the lead came from, query string included, for `zf_referrer_name`. */
  pageUrl?: string;
  /** Google Ads click ID, for `zc_gad` when the form's CRM integration tracks it. */
  gclid?: string;
}

/** Maps the form's values onto Zoho's field names. Exported for testing. */
export const buildTerritoryPlanFormData = (input: TerritoryPlanInput): FormData => {
  const data = new FormData();

  data.append('zf_referrer_name', input.pageUrl ?? '');
  data.append('zf_redirect_url', '');
  data.append('zc_gad', input.gclid ?? '');

  data.append('Dropdown', input.trade);
  data.append('SingleLine1', input.towns.trim());
  data.append('Radio', input.landing);
  for (const channel of input.channels) data.append('Checkbox', channel);
  if (input.spend) data.append('Dropdown1', input.spend);

  data.append('Name_First', input.firstName.trim());
  data.append('Name_Last', input.lastName.trim());
  data.append('Email1', input.email.trim());
  appendZohoPhone(data, splitPhone(input.phone));
  data.append('SingleLine', input.company.trim());

  // Zoho 409s on a website it cannot parse, so a blank one sends no field at all.
  const website = input.website?.trim();
  if (website) data.append('Website', website);

  if (input.consent) data.append('TermsConditions', 'on');

  return data;
};

/**
 * Sends one request to Zoho without leaving the page. `no-cors` for the reason
 * given on `submitContactToZoho`: resolves once the request is sent, throws
 * only when it could not be sent at all.
 */
export const submitTerritoryPlanToZoho = async (input: TerritoryPlanInput): Promise<void> => {
  await fetch(ZOHO_TERRITORY_PLAN_FORM_ACTION, {
    method: 'POST',
    mode: 'no-cors',
    credentials: 'omit',
    body: buildTerritoryPlanFormData(input),
  });
};
