import { useEffect, useState } from 'react';
import {
  findContactPlanOption,
  findContactServiceOption,
  getCheckoutHref,
  type ContactPlanOption,
  type ContactServiceOption,
} from '@data/pricing';

export default function CheckoutReadyCTA() {
  const [service, setService] = useState<ContactServiceOption | undefined>();
  const [plan, setPlan] = useState<ContactPlanOption | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedService = findContactServiceOption(params.get('service')) ?? findContactServiceOption('managed-social-media');
    const selectedPlan = findContactPlanOption(selectedService, params.get('plan')) ?? selectedService?.plans[0];

    setService(selectedService);
    setPlan(selectedPlan);
  }, []);

  const href = getCheckoutHref(service?.slug ?? 'managed-social-media', plan?.slug);

  return (
    <section className="card p-6 sm:p-8 bg-ink-900 text-white relative overflow-hidden" aria-labelledby="checkout-ready-title">
      <span aria-hidden="true" className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand-500/30 blur-3xl"></span>
      <div className="relative grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">Ready to pay?</p>
          <h3 id="checkout-ready-title" className="mt-2 text-2xl font-display font-bold text-white">
            Pay for your plan when you are ready.
          </h3>
          <p className="mt-2 text-sm text-ink-300">
            If you are an existing customer looking to upgrade your plan, you can choose this option too
          </p>
        </div>
        <a href={href} className="btn-primary justify-center whitespace-nowrap">
          Continue to checkout <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
        </a>
      </div>
    </section>
  );
}