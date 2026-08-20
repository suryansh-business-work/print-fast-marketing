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
// Zoho names fields positionally (`SingleLine`, `MultiLine1`, `MultipleChoice1`),
// which means ADDING OR REORDERING FIELDS INSIDE ZOHO RENAMES THEM and values
// start landing in the wrong column — or get dropped. When the form changes,
// re-export its HTML from Zoho and re-check every name below.
//
// Three things the endpoint told us that no export mentions, each confirmed by
// posting live records against it:
//   * a mandatory "Terms and Conditions" tick box exists (see TERMS_FIELD);
//   * the phone field only accepts the "+1" dial code (see the country codes
//     below);
//   * the phone field is marked unique, so Zoho refuses a second lead that
//     reuses a stored number. The browser cannot see that rejection (below),
//     so the visitor is thanked while the record is dropped — the fix lives in
//     Zoho: switch "No duplicate values" off for the phone field.
// ============================================================================

const env = (import.meta.env ?? {}) as Record<string, string | undefined>;

/** `.../formperma/<key>/htmlRecords/submit` — override per environment. */
export const ZOHO_CONTACT_FORM_ACTION =
  env.PUBLIC_ZOHO_CONTACT_FORM_URL ||
  'https://forms.zohopublic.com/printfastllc/form/ContactUsAug2026Newsite/formperma/xPJfC4lKg6QWWlgZba7taYCYFhB4IZiLqRtKoU7NGLw/htmlRecords/submit';

/**
 * Every choice the Zoho field "What service are you interested in?" accepts.
 * Zoho validates multi-selects against its own option list, so a value that is
 * not spelled exactly like this risks the whole record being rejected.
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
 * Zoho's phone field is locked to a single country code: send anything but
 * "+1" and the whole submission comes back 409 "Enter a valid country code"
 * with nothing stored — an invisible failure, since the browser cannot read
 * that response. So a foreign number is filed under "+1" with its country
 * digits kept in front of the number (Zoho accepts any length there) and the
 * string the visitor actually typed repeated in the notes.
 *
 * Open the field up in Zoho (phone field → allow international country codes)
 * and this list is all that needs to grow.
 */
const ZOHO_ACCEPTED_COUNTRY_CODES = ['+1'];

/** Zoho rejects a record whose mandatory field is blank. */
const MANDATORY_PLACEHOLDER = '-';

/**
 * The live form carries a mandatory "Terms and Conditions" tick box that the
 * exported HTML predates — leave it out and Zoho answers 409 "You must accept
 * the terms and conditions" and stores nothing. It is a plain checkbox with no
 * value attribute, so the only string it accepts is the browser default "on".
 * Our own consent checkbox is what ticks it.
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

/** "Either" ticks both boxes on Zoho's multi-select. */
const mapContactMethod = (method: ZohoContactInput['contactMethod']): string[] =>
  method === 'Either' ? ['Phone', 'Email'] : [method];

const mapService = (serviceLabel: string): readonly string[] =>
  SERVICE_MAP[serviceLabel.trim().toLowerCase()] ?? SERVICE_FALLBACK;

/**
 * Zoho only has two free-text boxes and both are mandatory. The visitor's own
 * message fills the first; everything our form collects that Zoho has no field
 * for (the exact service label, plan, website, source page) fills the second.
 */
const buildNotes = (input: ZohoContactInput, phoneAsEntered?: string): string => {
  const lines = [
    ['Service of interest', input.service],
    ['Pricing plan', input.plan],
    ['Website', input.website],
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

  data.append('Name_First', first || MANDATORY_PLACEHOLDER);
  data.append('Name_Last', last || MANDATORY_PLACEHOLDER);
  data.append('Email', input.email.trim());

  const codeAccepted = ZOHO_ACCEPTED_COUNTRY_CODES.includes(countryCode);
  data.append('PhoneNumber1_countrycodeval', codeAccepted ? countryCode : DEFAULT_COUNTRY_CODE);
  data.append('PhoneNumber1_countrycode', codeAccepted ? number : `${countryCode.replace(/\D/g, '')}${number}`);

  // "How shall we contact you" and the services list are multi-selects: Zoho
  // reads repeated keys, exactly like a native <select multiple> would send.
  for (const method of mapContactMethod(input.contactMethod)) data.append('MultipleChoice', method);

  data.append('SingleLine', input.company.trim());

  for (const service of mapService(input.service)) data.append('MultipleChoice1', service);

  data.append('MultiLine', input.message.trim() || MANDATORY_PLACEHOLDER);
  data.append(
    'MultiLine1',
    // Only worth a line when Zoho could not store the number as dialled.
    buildNotes(input, codeAccepted ? undefined : `${countryCode} ${number}`) || MANDATORY_PLACEHOLDER,
  );

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
 * give up is reading Zoho's answer, which is why the field mapping above was
 * verified against the live endpoint rather than assumed.
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
