// ============================================================================
// Zoho Forms wiring for the shared contact form.
//
// Both sites ship as static HTML behind nginx, so there is no server of ours to
// relay a lead through. The browser therefore posts straight at Zoho's
// `htmlRecords/submit` endpoint — the exact endpoint (and the exact field
// names) of the published form "Contact Us (Aug 2026 - New site)". Only the
// transport and the field mapping live here; the visible form stays React +
// Formik, so the design is untouched.
//
// Zoho names fields positionally (`SingleLine`, `MultiLine1`, `MultipleChoice1`)
// and RENUMBERS THEM WHENEVER THE FORM IS EDITED. That is not theoretical: an
// edit to the form renamed `Email` to `Email1` and `PhoneNumber1_*` to
// `PhoneNumber_*`, and because the browser cannot read Zoho's reply (see
// `submitContactToZoho`), every lead was answered 409, stored nowhere, and the
// visitor thanked anyway. Re-verify every name below after any form change.
//
// How to re-verify without filling the CRM with junk: post a payload that
// deliberately omits `TermsConditions`. Zoho then always answers 409 and stores
// nothing, yet its error page still names every *other* field it rejected — so
// one failing request tells you whether a field name, an option value or a
// dialling code is accepted. Everything asserted below was checked that way
// against the live endpoint on 2026-08-25.
// ============================================================================

import { COUNTRY_DIAL_CODES } from '@data/country-codes';

const env = (import.meta.env ?? {}) as Record<string, string | undefined>;

/** `.../formperma/<key>/htmlRecords/submit` — override per environment. */
export const ZOHO_CONTACT_FORM_ACTION =
  env.PUBLIC_ZOHO_CONTACT_FORM_URL ||
  'https://forms.zohopublic.com/printfastllc/form/ContactUsAug2026Newsite/formperma/xPJfC4lKg6QWWlgZba7taYCYFhB4IZiLqRtKoU7NGLw/htmlRecords/submit';

/**
 * Every choice the Zoho field "What service(s) are you interested in?" accepts.
 * Zoho validates the multi-select against its own option list and rejects the
 * whole record over a single unrecognised string, so these are spelled exactly
 * as Zoho stores them — all seven confirmed accepted in one live submission.
 */
const ZOHO_SERVICE = {
  seo: 'SEO',
  social: 'Social media marketing',
  ppc: 'PPC (Pay-per-click)',
  email: 'Email Marketing',
  website: 'Website Creation',
  directMail: 'Direct Mail & Digital Combined',
  print: 'Print-related services/products',
} as const;

/**
 * Our dropdown is richer than Zoho's, so each of our labels collapses onto the
 * closest Zoho option(s). Nothing is lost: the label the visitor actually picked
 * is always written verbatim into the notes field as well.
 */
const SERVICE_MAP: Record<string, readonly string[]> = {
  'digital marketing services': [ZOHO_SERVICE.seo, ZOHO_SERVICE.social],
  'managed social media': [ZOHO_SERVICE.social],
  'direct mail & digital combined': [ZOHO_SERVICE.directMail],
  'organic digital marketing': [ZOHO_SERVICE.seo],
  'pay-per-click advertising': [ZOHO_SERVICE.ppc],
  'email marketing': [ZOHO_SERVICE.email],
  'website creation': [ZOHO_SERVICE.website],
  'video marketing': [ZOHO_SERVICE.social],
  'free digital review': [ZOHO_SERVICE.seo, ZOHO_SERVICE.social],
  'other / not sure': [ZOHO_SERVICE.print],
};

/** Zoho needs at least one choice — print is the house speciality. */
const SERVICE_FALLBACK = [ZOHO_SERVICE.print];

const DEFAULT_COUNTRY_CODE = '+1';

/**
 * Zoho validates the dialling code against its own country list: a made-up
 * "+999" comes back 409 "Phone" with nothing stored. The field is no longer
 * pinned to "+1" though — all 78 distinct codes our dropdown can emit were
 * swept against the live endpoint and every one was accepted, so the code the
 * visitor picked now goes through as dialled. This set guards the one path the
 * dropdown does not control: a visitor typing "+xxx …" into the number box.
 */
const ZOHO_ACCEPTED_COUNTRY_CODES = new Set(COUNTRY_DIAL_CODES.map((country) => country.dial));

/** Zoho rejects a record whose mandatory field is blank. */
const MANDATORY_PLACEHOLDER = '-';

/**
 * The form carries a mandatory "Terms and Conditions" tick box: leave it out —
 * or send anything other than the browser's default "on", "off" very much
 * included — and Zoho answers 409 "Terms and Conditions" and stores nothing.
 * The visitor ticking our own consent box is what ticks it.
 */
const TERMS_FIELD = 'TermsConditions';
const TERMS_ACCEPTED = 'on';

export interface ZohoContactInput {
  name: string;
  email: string;
  /** National number, as typed next to the dial-code dropdown. */
  phone: string;
  /** Dial code the visitor picked, e.g. "+1". Falls back to reading it off `phone`. */
  phoneCountryCode?: string;
  company: string;
  website?: string;
  contactMethod: 'Email' | 'Phone' | 'Either';
  service: string;
  plan?: string;
  message: string;
  consent: boolean;
  /** Page the lead came from — recorded so sales knows what they were reading. */
  pageUrl?: string;
  /** Value for Zoho's `zf_referrer_name` tracking field. */
  referrer?: string;
}

/** "Jane Van Doe" → first "Jane", last "Van Doe" (Zoho stores the two apart). */
export const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts.shift() ?? '';
  return { first, last: parts.join(' ') };
};

/**
 * Zoho's phone field is split into a country code and a number. Visitors type
 * one string, so pull the code back out: an explicit `+xx` prefix wins,
 * otherwise anything past the trailing ten digits is the code, otherwise US.
 */
export const splitPhone = (rawPhone: string) => {
  const trimmed = rawPhone.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return { countryCode: DEFAULT_COUNTRY_CODE, number: '' };

  const prefixed = trimmed.match(/^\+(\d{1,3})[\s.\-(]/);
  if (prefixed) {
    return { countryCode: `+${prefixed[1]}`, number: digits.slice(prefixed[1].length) };
  }

  if (digits.length > 10) {
    const codeLength = Math.min(digits.length - 10, 3);
    return { countryCode: `+${digits.slice(0, codeLength)}`, number: digits.slice(codeLength) };
  }

  return { countryCode: DEFAULT_COUNTRY_CODE, number: digits };
};

/**
 * The dropdown supplies the dial code, so the box beside it is the national
 * number. A visitor who ignores the dropdown and types "+44 20…" anyway still
 * gets what they meant: an explicit prefix in the number wins.
 */
const resolvePhone = (input: ZohoContactInput) => {
  if (input.phoneCountryCode && !input.phone.trim().startsWith('+')) {
    return { countryCode: input.phoneCountryCode, number: input.phone.replace(/\D/g, '') };
  }
  return splitPhone(input.phone);
};

/**
 * "Either" ticks both boxes on Zoho's multi-select. It is not an option Zoho
 * knows about, and forwarding it verbatim is a 409.
 */
const mapContactMethod = (method: ZohoContactInput['contactMethod']): string[] =>
  method === 'Either' ? ['Phone', 'Email'] : [method];

const mapService = (serviceLabel: string): readonly string[] =>
  SERVICE_MAP[serviceLabel.trim().toLowerCase()] ?? SERVICE_FALLBACK;

/**
 * Everything our form collects that Zoho has no column for — the exact service
 * label, the pricing plan, the page the lead came from. The box is optional, so
 * an empty one is left off the record rather than padded with a placeholder.
 */
const buildNotes = (input: ZohoContactInput, phoneAsEntered?: string): string => {
  const lines = [
    ['Service of interest', input.service],
    ['Pricing plan', input.plan],
    ['Preferred contact method', input.contactMethod],
    ['Phone as entered', phoneAsEntered],
    ['Submitted from', input.pageUrl],
  ] as const;

  return lines
    .filter(([, value]) => Boolean(value && String(value).trim()))
    .map(([label, value]) => `${label}: ${String(value).trim()}`)
    .join('\n');
};

/** Maps our form values onto Zoho's field names. Exported for testing. */
export const buildZohoFormData = (input: ZohoContactInput): FormData => {
  const { first, last } = splitName(input.name);
  const { countryCode, number } = resolvePhone(input);
  const data = new FormData();

  // Zoho's own hidden trio — present in its generated HTML, so keep them.
  data.append('zf_referrer_name', input.referrer ?? '');
  data.append('zf_redirect_url', '');
  data.append('zc_gad', '');

  // Mandatory, every one of them: both halves of the name, email, phone,
  // company, both multi-selects and the terms tick box. Website and the two
  // free-text boxes are the only optional fields on the form.
  data.append('Name_First', first || MANDATORY_PLACEHOLDER);
  data.append('Name_Last', last || MANDATORY_PLACEHOLDER);
  data.append('Email1', input.email.trim());

  const codeAccepted = ZOHO_ACCEPTED_COUNTRY_CODES.has(countryCode);
  data.append('PhoneNumber_countrycodeval', codeAccepted ? countryCode : DEFAULT_COUNTRY_CODE);
  data.append('PhoneNumber_countrycode', codeAccepted ? number : `${countryCode.replace(/\D/g, '')}${number}`);

  // "How shall we contact you" and the services list are multi-selects: Zoho
  // reads repeated keys, exactly like a native <select multiple> would send.
  for (const method of mapContactMethod(input.contactMethod)) data.append('MultipleChoice', method);

  data.append('SingleLine', input.company.trim());

  for (const service of mapService(input.service)) data.append('MultipleChoice1', service);

  // Zoho URL-validates this one and 409s on anything that is not a URL, so only
  // a value our own schema already vetted reaches it — and a visitor who left
  // the optional website blank sends no field at all.
  const website = input.website?.trim();
  if (website) data.append('Website', website);

  const message = input.message.trim();
  if (message) data.append('MultiLine', message);

  const notes = buildNotes(
    input,
    // Only worth a line when Zoho could not store the number as dialled.
    codeAccepted ? undefined : `${countryCode} ${number}`,
  );
  if (notes) data.append('MultiLine1', notes);

  if (input.consent) data.append(TERMS_FIELD, TERMS_ACCEPTED);

  return data;
};

/**
 * Sends one lead to Zoho, in place — the visitor never leaves the page and no
 * iframe or Zoho markup is embedded anywhere.
 *
 * `no-cors` is not a workaround, it is the only option: Zoho serves this
 * endpoint without CORS headers, so a readable response was never available to
 * a browser. The POST itself still arrives and the record is stored — multipart
 * form data is a CORS-safelisted body, so no preflight is involved. What we
 * give up is reading Zoho's answer, which is why the mapping above is verified
 * against the live endpoint rather than assumed: from in here a rejected record
 * is invisible, and looks exactly like a stored one.
 *
 * Resolves once the request has left the browser; throws when it could not be
 * sent at all (offline, DNS failure, a blocking extension).
 */
export const submitContactToZoho = async (input: ZohoContactInput): Promise<void> => {
  await fetch(ZOHO_CONTACT_FORM_ACTION, {
    method: 'POST',
    mode: 'no-cors',
    credentials: 'omit',
    body: buildZohoFormData(input),
  });
};
