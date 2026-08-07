import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  IIntegration,
  IntegrationProvider,
  IUpdateIntegrationSettingsPayload,
} from '../../types/integration.types';
import * as integrationService from '../../services/integration.service';
import { ServiceTitanSettingsFields, JobberSettingsFields } from './SettingsFields';

interface IntegrationSettingsDialogProps {
  open: boolean;
  integration: IIntegration | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ST_DOCS_URL = 'https://developer.servicetitan.io/docs/get-going-manage-client-id-and-secret/';
const JOBBER_DOCS_URL = 'https://developer.getjobber.com/docs/build-your-first-app/get-started';

const stValidationSchema = yup.object({
  tenantId: yup.string().optional(),
  clientId: yup.string().optional(),
  clientSecret: yup.string().optional(),
  environment: yup.string().oneOf(['production', 'integration']).optional(),
});

const IntegrationSettingsDialog = ({
  open,
  integration,
  onClose,
  onSuccess,
}: IntegrationSettingsDialogProps) => {
  const [error, setError] = useState('');
  const isServiceTitan = integration?.provider === IntegrationProvider.SERVICE_TITAN;

  const formik = useFormik({
    initialValues: {
      tenantId: '',
      clientId: '',
      clientSecret: '',
      environment: integration?.environment || 'production',
    },
    validationSchema: isServiceTitan ? stValidationSchema : undefined,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      if (!integration) return;
      setError('');
      try {
        const payload: IUpdateIntegrationSettingsPayload = {};
        if (values.tenantId) payload.tenantId = values.tenantId;
        if (values.clientId) payload.clientId = values.clientId;
        if (values.clientSecret) payload.clientSecret = values.clientSecret;
        if (values.environment)
          payload.environment = values.environment as 'production' | 'integration';

        const response = await integrationService.updateIntegrationSettings(
          integration.integrationId,
          payload,
        );
        if (response.success) {
          formik.resetForm();
          onSuccess();
        } else {
          setError(response.error?.message || 'Failed to update settings');
        }
      } catch {
        setError('An error occurred while updating settings');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setError('');
    onClose();
  };

  const providerName = isServiceTitan ? 'Service Titan' : 'Jobber';
  const docsUrl = isServiceTitan ? ST_DOCS_URL : JOBBER_DOCS_URL;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{providerName} Settings</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Alert severity="info" sx={{ mb: 2 }}>
            Only fill in fields you want to update. Leave fields empty to keep existing values.
          </Alert>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {isServiceTitan ? (
              <ServiceTitanSettingsFields formik={formik} />
            ) : (
              <JobberSettingsFields formik={formik} />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            For help, visit the{' '}
            <Link href={docsUrl} target="_blank" rel="noopener">
              {providerName} Developer Docs
            </Link>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? <CircularProgress size={20} /> : 'Save Settings'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default IntegrationSettingsDialog;
