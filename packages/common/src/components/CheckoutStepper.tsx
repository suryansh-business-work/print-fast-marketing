import { useEffect, useState } from 'react';
import { Formik, Form, type FormikErrors, type FormikTouched } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  CONTACT_SERVICE_OPTIONS,
  findContactPlanOption,
  findContactServiceOption,
  type ContactPlanOption,
  type ContactServiceOption,
} from '@data/pricing';

const steps = ['Plan Selection', 'Contact & Billing Information', 'Confirmation', 'Payment Gateway'];

const checkoutServices = CONTACT_SERVICE_OPTIONS.filter(
  (service) => !['free-digital-review', 'other-not-sure'].includes(service.slug)
);

const defaultService = checkoutServices.find((service) => service.slug === 'managed-social-media') ?? checkoutServices[0];
const phoneRegex = /^[+]?[-.()\s0-9]{7,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const postalCodeRegex = /^(?:\d{5}(?:-\d{4})?|\d{6})$/;

const checkoutTheme = createTheme({
  palette: {
    primary: {
      main: '#58b022',
      dark: '#44881d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f59e0b',
    },
    text: {
      primary: '#16181f',
      secondary: '#525a70',
    },
    background: {
      paper: '#ffffff',
      default: '#f6f7f9',
    },
    divider: '#eceef2',
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: {
      fontFamily: '"Plus Jakarta Sans", Inter, system-ui, sans-serif',
      letterSpacing: 0,
    },
    h5: {
      fontFamily: '"Plus Jakarta Sans", Inter, system-ui, sans-serif',
      letterSpacing: 0,
    },
    h6: {
      fontFamily: '"Plus Jakarta Sans", Inter, system-ui, sans-serif',
      letterSpacing: 0,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: 0,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: '0.7rem 1.35rem',
          boxShadow: 'none',
        },
        contained: {
          boxShadow: '0 10px 30px -12px rgba(111, 209, 46, 0.35)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderColor: '#eceef2',
          boxShadow: '0 10px 30px -12px rgba(111, 209, 46, 0.12)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#525a70',
          fontWeight: 600,
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          '&.Mui-active, &.Mui-completed': {
            color: '#58b022',
          },
        },
      },
    },
  },
});

interface CheckoutValues {
  serviceSlug: string;
  planSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

const getDefaultPlanSlug = (service: ContactServiceOption) => service.plans[0]?.slug ?? '';

const createInitialValues = (): CheckoutValues => ({
  serviceSlug: defaultService.slug,
  planSlug: getDefaultPlanSlug(defaultService),
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  city: '',
  state: '',
  zip: '',
});

const getServiceBySlug = (slug: string) => checkoutServices.find((service) => service.slug === slug) ?? defaultService;

const getPlanBySlug = (service: ContactServiceOption, slug: string) =>
  service.plans.find((plan) => plan.slug === slug) ?? service.plans[0];

const getPriceLabel = (plan?: ContactPlanOption) => {
  if (!plan?.price) return 'Custom quote';
  return `${plan.price}${plan.period ? ` ${plan.period}` : ''}`;
};

const createCheckoutId = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `PF-${stamp}-${suffix}`;
};

const parseStep = (value: string | null) => {
  const step = Number.parseInt(value ?? '1', 10);
  if (Number.isNaN(step)) return 0;
  return Math.min(Math.max(step, 1), steps.length) - 1;
};

const checkoutSchema = Yup.object({
  serviceSlug: Yup.string()
    .oneOf(checkoutServices.map((service) => service.slug), 'Select a valid service')
    .required('Please select a service'),
  planSlug: Yup.string().test('plan-required', 'Please select a plan', function (value) {
    const service = getServiceBySlug(this.parent.serviceSlug);
    if (service.plans.length === 0) return true;
    return Boolean(value && service.plans.some((plan) => plan.slug === value));
  }),
  firstName: Yup.string().trim().min(2, 'First name is too short').max(60, 'First name is too long').required('First name is required'),
  lastName: Yup.string().trim().min(2, 'Last name is too short').max(60, 'Last name is too long').required('Last name is required'),
  email: Yup.string().trim().email('Enter a valid email address').matches(emailRegex, 'Enter a valid email address').required('Email is required'),
  phone: Yup.string().trim().matches(phoneRegex, 'Enter a valid phone number').required('Phone is required'),
  company: Yup.string().trim().max(120, 'Company name is too long').notRequired(),
  address: Yup.string().trim().min(5, 'Enter a complete billing address').max(160, 'Address is too long').required('Billing address is required'),
  city: Yup.string().trim().min(2, 'City is too short').max(80, 'City is too long').required('City is required'),
  state: Yup.string().trim().min(2, 'State is required').max(40, 'State is too long').required('State is required'),
  zip: Yup.string().trim().matches(postalCodeRegex, 'Enter a valid ZIP or PIN code').required('ZIP / PIN code is required'),
});

const planStepFields: (keyof CheckoutValues)[] = ['serviceSlug', 'planSlug'];
const billingStepFields: (keyof CheckoutValues)[] = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip'];

const getStepFields = (step: number) => {
  if (step === 0) return planStepFields;
  if (step === 1) return billingStepFields;
  return [];
};

const getTouchedForFields = (fields: (keyof CheckoutValues)[]) =>
  fields.reduce((nextTouched, field) => ({ ...nextTouched, [field]: true }), {} as FormikTouched<CheckoutValues>);

function CheckoutUrlSync({ checkoutId, activeStep, values }: { checkoutId: string; activeStep: number; values: CheckoutValues }) {
  useEffect(() => {
    if (!checkoutId) return;

    const params = new URLSearchParams(window.location.search);
    params.set('checkout', checkoutId);
    params.set('step', String(activeStep + 1));
    params.set('service', values.serviceSlug);
    if (values.planSlug) {
      params.set('plan', values.planSlug);
    } else {
      params.delete('plan');
    }

    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }, [activeStep, checkoutId, values.planSlug, values.serviceSlug]);

  return null;
}

export default function CheckoutStepper() {
  const [checkoutId, setCheckoutId] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [initialValues, setInitialValues] = useState<CheckoutValues>(() => createInitialValues());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedService = findContactServiceOption(params.get('service'));
    const service = checkoutServices.find((option) => option.slug === requestedService?.slug) ?? defaultService;
    const requestedPlan = findContactPlanOption(service, params.get('plan'));

    setCheckoutId(params.get('checkout') || createCheckoutId());
    setActiveStep(parseStep(params.get('step')));
    setInitialValues((current) => ({
      ...current,
      serviceSlug: service.slug,
      planSlug: requestedPlan?.slug ?? getDefaultPlanSlug(service),
    }));
  }, []);

  const goBack = () => setActiveStep((current) => Math.max(current - 1, 0));

  const hasStepErrors = (errors: FormikErrors<CheckoutValues>, fields: (keyof CheckoutValues)[]) =>
    fields.some((field) => Boolean(errors[field]));

  return (
    <ThemeProvider theme={checkoutTheme}>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={checkoutSchema}
        onSubmit={(_, helpers) => helpers.setSubmitting(false)}
      >
      {({ values, errors, touched, setFieldValue, setFieldTouched, setTouched, validateForm }) => {
        const selectedService = getServiceBySlug(values.serviceSlug);
        const selectedPlan = getPlanBySlug(selectedService, values.planSlug);
        const fieldError = (field: keyof CheckoutValues) => Boolean(touched[field] && errors[field]);
        const helperText = (field: keyof CheckoutValues) => (touched[field] && errors[field] ? String(errors[field]) : ' ');

        const goNext = async () => {
          const fields = getStepFields(activeStep);
          const validationErrors = await validateForm();

          if (hasStepErrors(validationErrors, fields)) {
            setTouched({ ...touched, ...getTouchedForFields(fields) }, false);
            return;
          }

          setActiveStep((current) => Math.min(current + 1, steps.length - 1));
        };

        const handleServiceChange = (event: SelectChangeEvent<string>) => {
          const nextService = getServiceBySlug(event.target.value);
          setFieldValue('serviceSlug', nextService.slug);
          setFieldValue('planSlug', getDefaultPlanSlug(nextService));
          setFieldTouched('serviceSlug', true, false);
          setFieldTouched('planSlug', false, false);
          setActiveStep(0);
        };

        const handlePlanChange = (event: SelectChangeEvent<string>) => {
          setFieldValue('planSlug', event.target.value);
          setFieldTouched('planSlug', true, false);
          setActiveStep(0);
        };

        const textFieldProps = (field: keyof CheckoutValues, label: string, required = true, type = 'text') => ({
          name: field,
          label,
          type,
          value: values[field],
          onChange: (event: React.ChangeEvent<HTMLInputElement>) => setFieldValue(field, event.target.value),
          onBlur: () => setFieldTouched(field, true),
          error: fieldError(field),
          helperText: helperText(field),
          required,
        });

        const renderPlanSelection = () => {
          const visiblePlans: ContactPlanOption[] = selectedService.plans.length
            ? selectedService.plans
            : [{ slug: '', label: 'Custom Quote', price: 'Custom quote', description: 'We will prepare pricing after reviewing your requirements.' }];

          return (
            <Stack spacing={3}>
              <Alert severity="info">
                Choose a service and plan. The checkout URL will stay synced with your plan selection and checkout ID.
              </Alert>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                <FormControl fullWidth error={fieldError('serviceSlug')}>
                  <InputLabel id="checkout-service-label">Service</InputLabel>
                  <Select
                    labelId="checkout-service-label"
                    name="serviceSlug"
                    value={values.serviceSlug}
                    label="Service"
                    onChange={handleServiceChange}
                    onBlur={() => setFieldTouched('serviceSlug', true)}
                  >
                    {checkoutServices.map((service) => (
                      <MenuItem key={service.slug} value={service.slug}>
                        {service.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{helperText('serviceSlug')}</FormHelperText>
                </FormControl>

                <FormControl fullWidth disabled={selectedService.plans.length === 0} error={fieldError('planSlug')}>
                  <InputLabel id="checkout-plan-label">Plan</InputLabel>
                  <Select
                    labelId="checkout-plan-label"
                    name="planSlug"
                    value={values.planSlug}
                    label="Plan"
                    onChange={handlePlanChange}
                    onBlur={() => setFieldTouched('planSlug', true)}
                  >
                    {selectedService.plans.length === 0 ? (
                      <MenuItem value="">Custom quote</MenuItem>
                    ) : (
                      selectedService.plans.map((plan) => (
                        <MenuItem key={plan.slug} value={plan.slug}>
                          {plan.label}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  <FormHelperText>{helperText('planSlug')}</FormHelperText>
                </FormControl>
              </Box>

              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' } }}>
                {visiblePlans.map((plan) => {
                  const selected = selectedPlan?.slug === plan.slug || (!selectedPlan && plan.slug === '');
                  return (
                    <Card
                      key={plan.slug || 'custom'}
                      variant="outlined"
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setFieldValue('planSlug', plan.slug);
                        setFieldTouched('planSlug', true, false);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          setFieldValue('planSlug', plan.slug);
                          setFieldTouched('planSlug', true, false);
                        }
                      }}
                      sx={{
                        cursor: 'pointer',
                        borderColor: selected ? 'primary.main' : 'divider',
                        boxShadow: selected ? '0 18px 50px -24px rgba(88, 176, 34, 0.65)' : 'none',
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                          <Typography variant="h6" component="h3">
                            {plan.label}
                          </Typography>
                          {selected && <Chip color="primary" size="small" label="Selected" />}
                        </Stack>
                        <Typography variant="h5" component="p" sx={{ mt: 1, fontWeight: 800 }}>
                          {getPriceLabel(plan)}
                        </Typography>
                        {plan.description && (
                          <Typography color="text.secondary" sx={{ mt: 1 }}>
                            {plan.description}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Stack>
          );
        };

        const renderBilling = () => (
          <Stack spacing={3}>
            <Alert severity="success">Plan selected: {selectedService.label} / {selectedPlan?.label ?? 'Custom quote'}.</Alert>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <TextField {...textFieldProps('firstName', 'First name')} />
              <TextField {...textFieldProps('lastName', 'Last name')} />
              <TextField {...textFieldProps('email', 'Email', true, 'email')} />
              <TextField {...textFieldProps('phone', 'Phone', true, 'tel')} />
              <TextField {...textFieldProps('company', 'Company', false)} />
              <TextField {...textFieldProps('address', 'Billing address')} />
              <TextField {...textFieldProps('city', 'City')} />
              <TextField {...textFieldProps('state', 'State')} />
              <TextField {...textFieldProps('zip', 'ZIP / PIN code')} />
            </Box>
          </Stack>
        );

        const renderConfirmation = () => (
          <Stack spacing={2}>
            <Alert severity="info">Review the checkout request before moving to payment status.</Alert>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="overline" color="text.secondary">Checkout</Typography>
                  <Typography variant="h6">{checkoutId}</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography><strong>Service:</strong> {selectedService.label}</Typography>
                  <Typography><strong>Plan:</strong> {selectedPlan?.label ?? 'Custom quote'}</Typography>
                  <Typography><strong>Price:</strong> {getPriceLabel(selectedPlan)}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="overline" color="text.secondary">Contact & Billing</Typography>
                  <Typography variant="h6">{values.firstName} {values.lastName}</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography>{values.email}</Typography>
                  <Typography>{values.phone}</Typography>
                  {values.company && <Typography>{values.company}</Typography>}
                  <Typography>{values.address}</Typography>
                  <Typography>{values.city}, {values.state} {values.zip}</Typography>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        );

        const renderPayment = () => (
          <Stack spacing={2}>
            <Alert severity="warning">Payment gateway coming soon. Your checkout request is ready for payment setup.</Alert>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="overline" color="text.secondary">Payment status</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Coming soon</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Checkout ID {checkoutId} is synced in the URL. Use it to reference this request with the PrintFast team.
                </Typography>
                <Button href={`/contact-us/?service=${encodeURIComponent(values.serviceSlug)}${values.planSlug ? `&plan=${encodeURIComponent(values.planSlug)}` : ''}#contact-form`} variant="contained" sx={{ mt: 3 }}>
                  Contact us for payment setup
                </Button>
              </CardContent>
            </Card>
          </Stack>
        );

        const stepContent = [renderPlanSelection(), renderBilling(), renderConfirmation(), renderPayment()][activeStep];

        return (
          <Form noValidate>
            <CheckoutUrlSync checkoutId={checkoutId} activeStep={activeStep} values={values} />
            <Card variant="outlined" sx={{ borderRadius: '16px', overflow: 'hidden' }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                <Stack spacing={4}>
                  <Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                      <Box>
                        <Typography variant="overline" color="primary">Secure checkout request</Typography>
                        <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>Select a service and continue</Typography>
                      </Box>
                      <Chip label={checkoutId || 'Creating checkout ID...'} color="primary" variant="outlined" />
                    </Stack>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      Current price: <strong>{getPriceLabel(selectedPlan)}</strong>
                    </Typography>
                  </Box>

                  <Stepper activeStep={activeStep} alternativeLabel sx={{ display: { xs: 'none', md: 'flex' } }}>
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>

                  <Box>{stepContent}</Box>

                  <Divider />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
                    <Button type="button" onClick={goBack} disabled={activeStep === 0} variant="outlined">
                      Back
                    </Button>
                    {activeStep < steps.length - 1 ? (
                      <Button type="button" onClick={goNext} variant="contained">
                        {activeStep === 0 ? 'Continue to Contact & Billing' : activeStep === 1 ? 'Review Confirmation' : 'Proceed to Payment Status'}
                      </Button>
                    ) : (
                      <Button href={`/checkout/?checkout=${encodeURIComponent(checkoutId)}&step=1&service=${encodeURIComponent(values.serviceSlug)}${values.planSlug ? `&plan=${encodeURIComponent(values.planSlug)}` : ''}`} variant="outlined">
                        Start another checkout
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Form>
        );
      }}
      </Formik>
    </ThemeProvider>
  );
}
