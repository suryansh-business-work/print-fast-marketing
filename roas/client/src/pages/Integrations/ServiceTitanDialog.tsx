import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { IConnectServiceTitanPayload } from '../../types/integration.types';
import * as integrationService from '../../services/integration.service';

const validationSchema = yup.object({
  tenantId: yup.string().required('Tenant ID is required'),
  clientId: yup.string().required('Client ID is required'),
  clientSecret: yup.string().required('Client Secret is required'),
  environment: yup
    .string()
    .oneOf(['production', 'integration'])
    .required('Environment is required'),
});

interface ServiceTitanDialogProps {
  open: boolean;
  vendorId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const INFO_URL = 'https://developer.servicetitan.io/docs/get-going-manage-client-id-and-secret/';

const ServiceTitanDialog = ({ open, vendorId, onClose, onSuccess }: ServiceTitanDialogProps) => {
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      tenantId: '',
      clientId: '',
      clientSecret: '',
      environment: 'production' as 'production' | 'integration',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      try {
        const payload: IConnectServiceTitanPayload = { vendorId, ...values };
        const response = await integrationService.connectServiceTitan(payload);
        if (response.success) {
          formik.resetForm();
          onSuccess();
        } else {
          setError(response.error?.message || 'Failed to connect');
        }
      } catch {
        setError('An error occurred while connecting');
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Connect Service Titan</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <TextField
                fullWidth
                name="tenantId"
                label="Tenant ID"
                size="small"
                value={formik.values.tenantId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.tenantId && Boolean(formik.errors.tenantId)}
                helperText={formik.touched.tenantId && formik.errors.tenantId}
              />
              <FieldInfoLink />
            </Box>
            <Box>
              <TextField
                fullWidth
                name="clientId"
                label="Client ID"
                size="small"
                value={formik.values.clientId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.clientId && Boolean(formik.errors.clientId)}
                helperText={formik.touched.clientId && formik.errors.clientId}
              />
              <FieldInfoLink />
            </Box>
            <Box>
              <TextField
                fullWidth
                name="clientSecret"
                label="Client Secret"
                size="small"
                type="password"
                value={formik.values.clientSecret}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.clientSecret && Boolean(formik.errors.clientSecret)}
                helperText={formik.touched.clientSecret && formik.errors.clientSecret}
              />
              <FieldInfoLink />
            </Box>
            <Box>
              <TextField
                select
                fullWidth
                name="environment"
                label="Environment"
                size="small"
                value={formik.values.environment}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.environment && Boolean(formik.errors.environment)}
                helperText={
                  (formik.touched.environment && formik.errors.environment) || 'Environment to use.'
                }
              >
                <MenuItem value="production">Production</MenuItem>
                <MenuItem value="integration">Integration</MenuItem>
              </TextField>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? <CircularProgress size={20} /> : 'Connect'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const FieldInfoLink = () => (
  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
    For more information visit{' '}
    <Link href={INFO_URL} target="_blank" rel="noopener">
      ServiceTitan Developer Docs
    </Link>
  </Typography>
);

export default ServiceTitanDialog;
