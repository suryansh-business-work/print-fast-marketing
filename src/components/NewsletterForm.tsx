import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';

const schema = Yup.object({
  email: Yup.string().trim().email('Enter a valid email').required('Email is required'),
});

export default function NewsletterForm() {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/20 px-5 py-3 text-sm text-white" role="status" aria-live="polite">
        <i className="fa-solid fa-circle-check text-brand-300" aria-hidden="true"></i>
        Subscribed — see you in your inbox.
      </p>
    );
  }

  return (
    <Formik
      initialValues={{ email: '' }}
      validationSchema={schema}
      onSubmit={async (_values, helpers) => {
        await new Promise((r) => setTimeout(r, 600));
        helpers.resetForm();
        setDone(true);
      }}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="flex flex-col sm:flex-row gap-3 lg:justify-end" noValidate>
          <div className="flex-1 lg:max-w-xs">
            <label className="sr-only" htmlFor="footer-email">
              Email address
            </label>
            <Field
              id="footer-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@business.com"
              className={`w-full rounded-full bg-white/5 border px-5 py-3 text-sm text-white placeholder-ink-400 focus:ring-brand-400 ${
                touched.email && errors.email
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-white/15 focus:border-brand-400'
              }`}
            />
            <ErrorMessage name="email" component="p" className="mt-1 text-xs text-red-300 px-3" />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary whitespace-nowrap disabled:opacity-60">
            {isSubmitting ? (
              <>
                Subscribing… <i className="fa-solid fa-spinner fa-spin text-xs" aria-hidden="true"></i>
              </>
            ) : (
              <>
                Subscribe <i className="fa-solid fa-paper-plane text-xs" aria-hidden="true"></i>
              </>
            )}
          </button>
        </Form>
      )}
    </Formik>
  );
}
