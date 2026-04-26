import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';

export interface ContactFormReactProps {
  variant?: 'general' | 'review';
  title?: string;
  subtitle?: string;
  phone?: string;
  phoneHref?: string;
  email?: string;
}

interface FormValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  contactMethod: 'Email' | 'Phone' | 'Either';
  service: string;
  message: string;
  consent: boolean;
}

const phoneRegex = /^[+]?[\s.\-()0-9]{7,20}$/;

const buildSchema = (variant: 'general' | 'review') =>
  Yup.object({
    name: Yup.string().trim().min(2, 'Please enter your full name').max(80, 'Name is too long').required('Name is required'),
    email: Yup.string().trim().email('Enter a valid email address').required('Email is required'),
    phone: Yup.string().trim().matches(phoneRegex, 'Enter a valid phone number').notRequired(),
    company: Yup.string().trim().min(2, 'Company name is too short').max(120, 'Company name is too long').required('Company is required'),
    website:
      variant === 'review'
        ? Yup.string().trim().url('Enter a valid URL (include https://)').required('Website URL is required for the review')
        : Yup.string().trim().url('Enter a valid URL (include https://)').notRequired(),
    contactMethod: Yup.mixed<'Email' | 'Phone' | 'Either'>().oneOf(['Email', 'Phone', 'Either']).required(),
    service: Yup.string().required('Please pick a service'),
    message: Yup.string().trim().min(10, 'Tell us a bit more (10+ chars)').max(2000, 'Please keep it under 2000 chars').required('Message is required'),
    consent: Yup.boolean().oneOf([true], 'Please accept the privacy notice'),
  });

const inputClass =
  'mt-2 w-full rounded-xl border-ink-200 bg-white text-ink-900 placeholder-ink-400 focus:border-brand-500 focus:ring-brand-500';
const inputErrorClass = 'border-red-400 focus:border-red-500 focus:ring-red-500';
const labelClass = 'text-sm font-medium text-ink-800';
const errorClass = 'mt-1 text-xs font-medium text-red-600';

const services = [
  'Digital Marketing Services',
  'Managed Social Media',
  'Organic Digital Marketing',
  'Video Marketing',
  'Free Digital Review',
  'Other / Not sure',
];

export default function ContactFormReact({
  variant = 'general',
  title = 'Get your free strategy session',
  subtitle = "Tell us about your business — we'll come back within 1 business day with next steps.",
  phone,
  phoneHref,
  email,
}: ContactFormReactProps) {
  const [submitted, setSubmitted] = useState(false);

  const initialValues: FormValues = {
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    contactMethod: 'Email',
    service: variant === 'review' ? 'Free Digital Review' : '',
    message: '',
    consent: false,
  };

  const handleSubmit = async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
    // Replace with real endpoint when ready (e.g., /api/lead, HubSpot, Formspree)
    await new Promise((r) => setTimeout(r, 900));
    // eslint-disable-next-line no-console
    console.log('[contact-form] submit', values);
    helpers.resetForm();
    setSubmitted(true);
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

      <Formik initialValues={initialValues} validationSchema={buildSchema(variant)} onSubmit={handleSubmit}>
        {({ isSubmitting, errors, touched }) => {
          const cls = (field: keyof FormValues) =>
            `${inputClass} ${touched[field] && errors[field] ? inputErrorClass : ''}`;
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
                <span className={labelClass}>Phone</span>
                <Field name="phone" type="tel" autoComplete="tel" placeholder="(555) 123-4567" className={cls('phone')} />
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
                <Field as="select" name="service" className={cls('service')}>
                  <option value="">Select a service…</option>
                  {services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="service" component="p" className={errorClass} />
              </label>

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

              <label className="sm:col-span-2 flex items-start gap-3 text-sm text-ink-600">
                <Field
                  type="checkbox"
                  name="consent"
                  className="mt-1 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                />
                <span>
                  I agree to the privacy policy and consent to be contacted about my enquiry. We never sell your data.
                </span>
              </label>
              <ErrorMessage name="consent" component="p" className={`${errorClass} sm:col-span-2 -mt-3`} />

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
