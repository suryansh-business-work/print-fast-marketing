// ============================================================================
// Zoho Forms wiring for the shared contact form.
//
// Both sites ship as static HTML behind nginx, so there is no server of ours to
// relay a lead through. The browser therefore posts straight at Zoho's
// `htmlRecords/submit` endpoint — the exact endpoint (and the exact field
// names) of the published form "Contact Us (Aug 2026 - New site)". Only the
// transport lives here; the visible form is React + Formik in our own design,
// but it asks for the same fields, in the same order, with the same labels, so
// nothing has to be translated on the way out.
//
// Zoho names fields positionally (`SingleLine`, `MultiLine1`, `MultipleChoice1`)
// and RENUMBERS THEM WHENEVER THE FORM IS EDITED. That is not theoretical: an
// edit to the form renamed `Email` to `Email1` and `PhoneNumber1_*` to
// `PhoneNumber_*`, and because the browser cannot read Zoho's reply (see
// `submitContactToZoho`), every lead was answered 409, stored nowhere, and the
// visitor thanked anyway. Re-export the form from Zoho and re-check every name
// below after any change to it.
//
// How to re-verify without filling the CRM with junk: post a payload that
// deliberately omits `TermsConditions`. Zoho then always answers 409 and stores
// nothing, yet its error page still names every *other* field it rejected — so
// one failing request tells you whether a field name, an option value or a
// dialling code is accepted. Everything asserted below was checked that way
// against the live endpoint on 2026-08-25, and cross-checked against the form's
// own exported HTML.
// ============================================================================

import { COUNTRY_DIAL_CODES } from '@data/country-codes';

const env = (import.meta.env ?? {}) as Record<string, string | undefined>;

/** `.../formperma/<key>/htmlRecords/submit` — override per environment. */
export const ZOHO_CONTACT_FORM_ACTION =
  env.PUBLIC_ZOHO_CONTACT_FORM_URL ||
  'https://forms.zohopublic.com/printfastllc/form/ContactUsAug2026Newsite/formperma/xPJfC4lKg6QWWlgZba7taYCYFhB4IZiLqRtKoU7NGLw/htmlRecords/submit';

/**
 * The two option lists, spelled exactly as Zoho stores them. Zoho validates
 * both multi-selects against its own list and rejects the entire record over a
 * single unrecognised string, so the form renders these verbatim rather than
 * mapping labels of our own onto them — there is nothing in between to drift.
 */
export const ZOHO_CONTACT_METHODS = ['Phone', 'Email'] as const;

export const ZOHO_SERVICES = [
  'SEO',
  'Social media marketing',
  'PPC (Pay-per-click)',
  'Email Marketing',
  'Website Creation',
  'Direct Mail & Digital Combined',
  'Print-related services/products',
] as const;

const DEFAULT_COUNTRY_CODE = '+1';

/**
 * Zoho validates the dialling code against its own country list: a made-up
 * "+999" comes back 409 "Phone" with nothing stored. The field is not pinned to
 * "+1" though — all 78 distinct codes our dropdown can emit were swept against
 * the live endpoint and every one was accepted, so the code the visitor picked
 * goes through as dialled. This set guards the one path the dropdown does not
 * control: a visitor typing "+xxx …" into the number box.
 */
const ZOHO_ACCEPTED_COUNTRY_CODES = new Set(COUNTRY_DIAL_CODES.map((country) => country.dial));

/** Zoho rejects a record whose mandatory field is blank. */
const MANDATORY_PLACEHOLDER = '-';

/**
 * The form carries a mandatory "Terms and Conditions" tick box that its own
 * exported HTML predates: leave it out — or send anything other than the
 * browser's default "on", "off" very much included — and Zoho answers 409
 * "Terms and Conditions" and stores nothing.
 */
const TERMS_FIELD = 'TermsConditions';
const TERMS_ACCEPTED = 'on';

/**
 * One lead, in the same shape the visible form collects it. Mandatory here
 * means mandatory in Zoho: its `zf_MandArray` lists both halves of the name,
 * the email, both phone components, the company and both multi-selects — plus
 * the terms box the export predates.
 */
export interface ZohoContactInput {
  firstName: string;
  lastName: string;
  email: string;
  /** National number, as typed next to the dial-code dropdown. */
  phone: string;
  /** Dial code the visitor picked, e.g. "+1". Falls back to reading it off `phone`. */
  phoneCountryCode?: string;
  company: string;
  /** Optional in Zoho, but URL-validated by it when present. */
  website?: string;
  /** "How shall we contact you" — one or both of `ZOHO_CONTACT_METHODS`. */
  contactMethods: string[];
  /** "What service(s) are you interested in?" — any of `ZOHO_SERVICES`. */
  services: string[];
  /** "Please specify your requirements…" — optional in Zoho. */
  requirements?: string;
  /** "Is there any additional information…" — optional in Zoho. */
  additionalInfo?: string;
  consent: boolean;
  /**
   * Page the lead came from. Goes into `zf_referrer_name`, Zoho's own tracking
   * column, so sales sees the source without anything of ours being written
   * into the visitor's two free-text answers.
   */
  pageUrl?: string;
}

/**
 * Zoho's phone field is split into a country code and a number. The dropdown
 * normally supplies the code, so this only has to cope with a visitor who
 * ignores it and types the whole thing into the number box: an explicit `+xx`
 * prefix wins, otherwise anything past the trailing ten digits is the code,
 * otherwise US.
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

const resolvePhone = (input: ZohoContactInput) => {
  if (input.phoneCountryCode && !input.phone.trim().startsWith('+')) {
    return { countryCode: input.phoneCountryCode, number: input.phone.replace(/\D/g, '') };
  }
  return splitPhone(input.phone);
};

/** Maps our form values onto Zoho's field names. Exported for testing. */
export const buildZohoFormData = (input: ZohoContactInput): FormData => {
  const { countryCode, number } = resolvePhone(input);
  const data = new FormData();

  // Zoho's own hidden trio — present in its generated HTML, so keep them.
  data.append('zf_referrer_name', input.pageUrl ?? '');
  data.append('zf_redirect_url', '');
  data.append('zc_gad', '');

  data.append('Name_First', input.firstName.trim() || MANDATORY_PLACEHOLDER);
  data.append('Name_Last', input.lastName.trim() || MANDATORY_PLACEHOLDER);
  data.append('Email1', input.email.trim());

  const codeAccepted = ZOHO_ACCEPTED_COUNTRY_CODES.has(countryCode);
  data.append('PhoneNumber_countrycodeval', codeAccepted ? countryCode : DEFAULT_COUNTRY_CODE);
  data.append('PhoneNumber_countrycode', codeAccepted ? number : `${countryCode.replace(/\D/g, '')}${number}`);

  data.append('SingleLine', input.company.trim());

  // Zoho URL-validates this one and 409s on anything that is not a URL, so a
  // visitor who left the optional website blank sends no field at all.
  const website = input.website?.trim();
  if (website) data.append('Website', website);

  // Both multi-selects: Zoho reads repeated keys, exactly like a native
  // <select multiple> would send.
  for (const method of input.contactMethods) data.append('MultipleChoice', method);
  for (const service of input.services) data.append('MultipleChoice1', service);

  const requirements = input.requirements?.trim();
  if (requirements) data.append('MultiLine', requirements);

  const additionalInfo = input.additionalInfo?.trim();
  if (additionalInfo) data.append('MultiLine1', additionalInfo);

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
