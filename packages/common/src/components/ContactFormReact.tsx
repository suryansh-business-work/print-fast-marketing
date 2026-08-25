import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useEffect, useId, useState, type ChangeEvent } from 'react';
import {
  CONTACT_SERVICE_OPTIONS,
  findContactPlanOption,
  findContactServiceOption,
} from '@data/pricing';
import {
  COMMON_COUNTRY_ISOS,
  COUNTRY_DIAL_CODES,
  DEFAULT_PHONE_COUNTRY,
  countryFlag,
  dialCodeFor,
} from '@data/country-codes';
import { submitContactToZoho } from '@config/zoho-contact';
import { SITE_URLS } from '@config/sites';

export interface ContactFormReactProps {
  variant?: 'general' | 'review';
  title?: string;
  subtitle?: string;
  phone?: string;
  phoneHref?: string;
  email?: string;
  /** Target of the "Terms and Conditions" link on the consent tick. */
  termsHref?: string;
  /** Target of the "Privacy Policy" link on the consent tick. */
  privacyHref?: string;
}

interface FormValues {
  name: string;
  email: string;
  /** ISO-2 of the country picked in the dial-code dropdown. */
  phoneCountry: string;
  phone: string;
  company: string;
  website: string;
  contactMethod: 'Email' | 'Phone' | 'Either';
  service: string;
  plan: string;
  message: string;
  consent: boolean;
  captcha: string;
}

// The dial code now lives in its own dropdown, so the box beside it holds the
// national number only — digits and the usual human separators.
const phoneRegex = /^[\s.\-()0-9]{7,20}$/;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const emptyToUndefined = (value: unknown, originalValue: unknown) => (originalValue === '' ? undefined : value);
// Zoho stores the name in two columns and treats both — plus the phone — as
// mandatory, so the form has to insist on them or the record is rejected.
const fullNameRegex = /^\S+(\s+\S+)+$/;
const buildSchema = (variant: 'general' | 'review', captchaAnswer: number) =>
  Yup.object({
    name: Yup.string().trim().min(2, 'Please enter your full name').max(80, 'Name is too long').matches(fullNameRegex, 'Please enter your first and last name').required('Name is required'),
    email: Yup.string().trim().email('Enter a valid email address').matches(emailRegex, 'Enter a valid email address').required('Email is required'),
    phoneCountry: Yup.string().required(),
    phone: Yup.string().trim().matches(phoneRegex, 'Enter a valid phone number').required('Phone is required'),
    company: Yup.string().trim().min(2, 'Company name is too short').max(120, 'Company name is too long').required('Company is required'),
    website:
      variant === 'review'
        ? Yup.string().trim().url('Enter a valid URL (include https://)').required('Website URL is required for the review')
        : Yup.string().transform(emptyToUndefined).trim().url('Enter a valid URL (include https://)').notRequired(),
    contactMethod: Yup.mixed<'Email' | 'Phone' | 'Either'>().oneOf(['Email', 'Phone', 'Either']).required(),
    service: Yup.string().required('Please pick a service'),
    plan: Yup.string().notRequired(),
    message: Yup.string().trim().min(10, 'Tell us a bit more (10+ chars)').max(2000, 'Please keep it under 2000 chars').required('Message is required'),
    // Zoho refuses the whole record unless its terms box is ticked, so this is
    // a hard gate rather than a nicety.
    consent: Yup.boolean().oneOf([true], 'Please accept the terms and conditions'),
    captcha: Yup.string()
      .trim()
      .required('Please answer the question')
      .test('captcha', 'That is not the right answer — try again', (value) => Number(value) === captchaAnswer),
  });

const inputClass =
  'mt-2 w-full rounded-xl border-ink-200 bg-white text-ink-900 placeholder-ink-400 focus:border-brand-500 focus:ring-brand-500';
// Same look as `inputClass`, minus the width and top margin the flex row owns.
const countrySelectClass =
  'w-[8.5rem] shrink-0 rounded-xl border-ink-200 bg-white text-ink-900 focus:border-brand-500 focus:ring-brand-500';
const phoneInputClass =
  'w-full min-w-0 rounded-xl border-ink-200 bg-white text-ink-900 placeholder-ink-400 focus:border-brand-500 focus:ring-brand-500';
const captchaInputClass =
  'w-24 rounded-xl border-ink-200 bg-white text-center font-semibold text-ink-900 placeholder-ink-400 focus:border-brand-500 focus:ring-brand-500';
const inputErrorClass = 'border-red-400 focus:border-red-500 focus:ring-red-500';
const labelClass = 'text-sm font-medium text-ink-800';
const errorClass = 'mt-1 text-xs font-medium text-red-600';
const consentLinkClass = 'font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800';

// Both policies live on the marketing site, and only it has a privacy page, so
// these default to absolute URLs. `mainHref` cannot stand in here: it keys off
// `PUBLIC_SITE_ID`, which the Astro pages see but this client bundle does not,
// so on the shop it would collapse to a same-site path that 404s. The wrapper
// resolves the pair properly and passes it down.
const DEFAULT_TERMS_HREF = `${SITE_URLS.main}/terms-of-use/`;
const DEFAULT_PRIVACY_HREF = `${SITE_URLS.main}/privacy-policy/`;

const services = CONTACT_SERVICE_OPTIONS.map((service) => service.label);

/** Two small addends — big enough to beat a naive bot, easy enough to do in your head. */
const createCaptcha = () => ({
  a: 2 + Math.floor(Math.random() * 8),
  b: 2 + Math.floor(Math.random() * 8),
});

/** Fixed on first render so the server-rendered markup and the hydrated markup agree. */
const INITIAL_CAPTCHA = { a: 3, b: 4 };

/** Common markets first, then everyone else — both groups already alphabetical. */
const commonCountries = COMMON_COUNTRY_ISOS.map((iso) =>
  COUNTRY_DIAL_CODES.find((country) => country.iso === iso),
).filter((country) => country !== undefined);
const otherCountries = COUNTRY_DIAL_CODES.filter((country) => !COMMON_COUNTRY_ISOS.includes(country.iso));

/** Dial code first so it survives the dropdown clipping its own width. */
const countryOptionLabel = (iso: string, name: string, dial: string) => `${dial} ${countryFlag(iso)} ${name}`;

const createInitialValues = (variant: 'general' | 'review'): FormValues => ({
  name: '',
  email: '',
  phoneCountry: DEFAULT_PHONE_COUNTRY,
  phone: '',
  company: '',
  website: '',
  contactMethod: 'Email',
  service: variant === 'review' ? 'Free Digital Review' : '',
  plan: '',
  message: '',
  consent: false,
  captcha: '',
});

const getPlanOptionsForService = (serviceLabel: string) =>
  CONTACT_SERVICE_OPTIONS.find((service) => service.label === serviceLabel)?.plans ?? [];

export default function ContactFormReact({
  variant = 'general',
  title = 'Get your free strategy session',
  subtitle = "Tell us about your business — we'll come back within 1 business day with next steps.",
  phone,
  phoneHref,
  email,
  termsHref = DEFAULT_TERMS_HREF,
  privacyHref = DEFAULT_PRIVACY_HREF,
}: ContactFormReactProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState(INITIAL_CAPTCHA);
  const [initialValues, setInitialValues] = useState<FormValues>(() => createInitialValues(variant));
  const captchaId = useId();
  const consentId = useId();

  useEffect(() => {
    // Randomised after mount, never during render — SSR has no idea which sum
    // the browser will pick, and a mismatch would blow up hydration.
    setCaptcha(createCaptcha());

    const params = new URLSearchParams(window.location.search);
    const serviceOption = findContactServiceOption(params.get('service'));
    const planOption = findContactPlanOption(serviceOption, params.get('plan'));

    if (!serviceOption && !planOption) return;

    setInitialValues((current) => ({
      ...current,
      service: serviceOption?.label ?? current.service,
      plan: planOption?.label ?? '',
    }));
  }, []);

  const handleSubmit = async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
    setSubmitError(null);
    try {
      await submitContactToZoho({
        name: values.name,
        email: values.email,
        phone: values.phone,
        phoneCountryCode: dialCodeFor(values.phoneCountry),
        company: values.company,
        website: values.website,
        contactMethod: values.contactMethod,
        service: values.service,
        plan: values.plan,
        message: values.message,
        consent: values.consent,
        pageUrl: window.location.href,
        referrer: window.location.pathname,
      });
      helpers.resetForm();
      setCaptcha(createCaptcha());
      setSubmitted(true);
    } catch {
      // The values stay on screen so a retry costs the visitor nothing.
      setSubmitError(
        email
          ? `We could not send your message just now. Please try again, or email us at ${email}.`
          : 'We could not send your message just now. Please try again in a moment.',
      );
    }
  };

  if (submitted) {
    return (
      <div className="card p-8 sm:p-10 text-center" role="status" aria-live="polite">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600 text-xl">
          <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
        </span>
        <h3 className="heading-md mt-5">Thanks — your request is in.</h3>
        <p className="mt-3 text-ink-600 max-w-md mx-auto">
          A senior strategist will reach out within 1 business day. In a hurry?
          {phone && phoneHref && (
            <>
              {' '}
              Call us at{' '}
              <a href={phoneHref} className="font-semibold text-brand-700 hover:text-brand-800">
                {phone}
              </a>
              .
            </>
          )}
        </p>
        <button type="button" onClick={() => setSubmitted(false)} className="btn-outline mt-6">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="card p-6 sm:p-8 lg:p-10 ring-1 ring-ink-100" data-reveal>
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h3 className="heading-md">{title}</h3>
          <p className="mt-2 text-ink-600">{subtitle}</p>
        </div>
        {(phone || email) && (
          <div className="flex flex-col items-start gap-1 text-sm">
            {phone && phoneHref && (
              <a href={phoneHref} className="font-semibold text-brand-700 hover:text-brand-800">
                <i className="fa-solid fa-phone mr-2" aria-hidden="true"></i>
                {phone}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="text-ink-500 hover:text-ink-800">
                <i className="fa-solid fa-envelope mr-2" aria-hidden="true"></i>
                {email}
              </a>
            )}
          </div>
        )}
      </div>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={buildSchema(variant, captcha.a + captcha.b)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched, values, setFieldValue }) => {
          const cls = (field: keyof FormValues) =>
            `${inputClass} ${touched[field] && errors[field] ? inputErrorClass : ''}`;
          const planOptions = getPlanOptionsForService(values.service);
          return (
            <Form className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2" noValidate>
              <label className="block">
                <span className={labelClass}>
                  Name<span className="text-brand-600">*</span>
                </span>
                <Field name="name" type="text" autoComplete="name" placeholder="Jane Doe" className={cls('name')} />
                <ErrorMessage name="name" component="p" className={errorClass} />
              </label>

              <label className="block">
                <span className={labelClass}>
                  Email<span className="text-brand-600">*</span>
                </span>
                <Field name="email" type="email" autoComplete="email" placeholder="you@business.com" className={cls('email')} />
                <ErrorMessage name="email" component="p" className={errorClass} />
              </label>

              <label className="block">
                <span className={labelClass}>
                  Phone<span className="text-brand-600">*</span>
                </span>
                <div className="mt-2 flex gap-2">
                  <Field
                    as="select"
                    name="phoneCountry"
                    aria-label="Country dialling code"
                    className={`${countrySelectClass} ${touched.phone && errors.phone ? inputErrorClass : ''}`}
                  >
                    <optgroup label="Common">
                      {commonCountries.map((country) => (
                        <option key={country.iso} value={country.iso}>
                          {countryOptionLabel(country.iso, country.name, country.dial)}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="All countries">
                      {otherCountries.map((country) => (
                        <option key={country.iso} value={country.iso}>
                          {countryOptionLabel(country.iso, country.name, country.dial)}
                        </option>
                      ))}
                    </optgroup>
                  </Field>
                  <Field
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="(555) 123-4567"
                    className={`${phoneInputClass} ${touched.phone && errors.phone ? inputErrorClass : ''}`}
                  />
                </div>
                <ErrorMessage name="phone" component="p" className={errorClass} />
              </label>

              <label className="block">
                <span className={labelClass}>
                  Company<span className="text-brand-600">*</span>
                </span>
                <Field name="company" type="text" autoComplete="organization" placeholder="Acme HVAC" className={cls('company')} />
                <ErrorMessage name="company" component="p" className={errorClass} />
              </label>

              <label className="block sm:col-span-2">
                <span className={labelClass}>
                  Website {variant === 'review' && <span className="text-brand-600">*</span>}
                </span>
                <Field name="website" type="url" placeholder="https://example.com" className={cls('website')} />
                <ErrorMessage name="website" component="p" className={errorClass} />
              </label>

              <label className="block">
                <span className={labelClass}>Preferred contact method</span>
                <Field as="select" name="contactMethod" className={cls('contactMethod')}>
                  <option>Email</option>
                  <option>Phone</option>
                  <option>Either</option>
                </Field>
              </label>

              <label className="block">
                <span className={labelClass}>
                  Service of interest<span className="text-brand-600">*</span>
                </span>
                <Field
                  as="select"
                  name="service"
                  className={cls('service')}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    setFieldValue('service', event.target.value);
                    setFieldValue('plan', '');
                  }}
                >
                  <option value="">Select a service…</option>
                  {services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="service" component="p" className={errorClass} />
              </label>

              {planOptions.length > 0 && (
                <div className="block sm:col-span-2">
                  <span className={labelClass}>Pricing plan</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {planOptions.map((plan) => {
                      const selected = values.plan === plan.label;
                      return (
                        <button
                          key={plan.slug}
                          type="button"
                          onClick={() => setFieldValue('plan', plan.label)}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                            selected
                              ? 'bg-brand-600 text-white shadow-soft'
                              : 'bg-ink-50 text-ink-700 ring-1 ring-ink-200 hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-200'
                          }`}
                          aria-pressed={selected}
                        >
                          {selected && <i className="fa-solid fa-check text-xs" aria-hidden="true"></i>}
                          {plan.label}
                        </button>
                      );
                    })}
                  </div>
                  <Field type="hidden" name="plan" />
                </div>
              )}

              <label className="block sm:col-span-2">
                <span className={labelClass}>
                  How can we help?<span className="text-brand-600">*</span>
                </span>
                <Field
                  as="textarea"
                  name="message"
                  rows={4}
                  placeholder="Tell us about your goals, services, and current challenges…"
                  className={cls('message')}
                />
                <ErrorMessage name="message" component="p" className={errorClass} />
              </label>

              <div className="sm:col-span-2 rounded-2xl bg-ink-50 ring-1 ring-ink-200 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <label htmlFor={captchaId} className={labelClass}>
                      Security check<span className="text-brand-600">*</span>
                    </label>
                    <div className="mt-2 flex items-center gap-3">
                      <span
                        className="inline-flex select-none items-center gap-2 rounded-xl bg-white px-4 py-2 text-lg font-bold tabular-nums text-ink-900 ring-1 ring-ink-200"
                        aria-hidden="true"
                      >
                        {captcha.a} <span className="text-brand-600">+</span> {captcha.b}{' '}
                        <span className="text-ink-400">=</span>
                      </span>
                      <Field
                        id={captchaId}
                        name="captcha"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="?"
                        aria-label={`What is ${captcha.a} plus ${captcha.b}?`}
                        className={`${captchaInputClass} ${touched.captcha && errors.captcha ? inputErrorClass : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCaptcha(createCaptcha());
                          setFieldValue('captcha', '');
                        }}
                        className="grid h-11 w-11 place-items-center rounded-xl bg-white text-ink-500 ring-1 ring-ink-200 transition-colors hover:text-brand-600 hover:ring-brand-300"
                        aria-label="Give me a different question"
                        title="New question"
                      >
                        <i className="fa-solid fa-rotate-right text-sm" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-ink-500 max-w-[15rem]">
                    <i className="fa-solid fa-robot text-brand-600" aria-hidden="true"></i> Quick sum to prove you are
                    human — it keeps bots out of our inbox.
                  </p>
                </div>
                <ErrorMessage name="captcha" component="p" className={errorClass} />
              </div>

              {/*
                This tick is also what accepts Zoho's own mandatory "Terms and
                Conditions" box, so the wording has to name them — see
                `@config/zoho-contact`. The checkbox sits beside the label
                rather than inside it: a wrapping label would swallow clicks
                meant for the two links.
              */}
              <div className="sm:col-span-2 flex items-start gap-3 text-sm text-ink-600">
                <Field
                  id={consentId}
                  type="checkbox"
                  name="consent"
                  className="mt-1 h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor={consentId}>
                  I accept the{' '}
                  <a href={termsHref} target="_blank" rel="noopener noreferrer" className={consentLinkClass}>
                    Terms and Conditions
                  </a>{' '}
                  and the{' '}
                  <a href={privacyHref} target="_blank" rel="noopener noreferrer" className={consentLinkClass}>
                    Privacy Policy
                  </a>
                  , and consent to be contacted about my enquiry. We never sell your data.
                </label>
              </div>
              <ErrorMessage name="consent" component="p" className={`${errorClass} sm:col-span-2 -mt-3`} />

              {submitError && (
                <p
                  className="sm:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200"
                  role="alert"
                >
                  <i className="fa-solid fa-triangle-exclamation mr-2" aria-hidden="true"></i>
                  {submitError}
                </p>
              )}

              <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-xs text-ink-500">
                  <i className="fa-solid fa-shield-halved text-brand-600" aria-hidden="true"></i> We respect your privacy. No spam — ever.
                </p>
                <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSubmitting ? (
                    <>
                      Sending… <i className="fa-solid fa-spinner fa-spin text-xs" aria-hidden="true"></i>
                    </>
                  ) : (
                    <>
                      Submit <i className="fa-solid fa-paper-plane text-xs" aria-hidden="true"></i>
                    </>
                  )}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
