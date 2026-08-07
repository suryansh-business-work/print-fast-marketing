import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ISaveJobberCredentialsPayload } from '../../types/integration.types';
import * as integrationService from '../../services/integration.service';

const validationSchema = yup.object({
  clientId: yup.string().required('Client ID is required'),
  clientSecret: yup.string().required('Client Secret is required'),
  redirectUri: yup.string().url('Must be a valid URL'),
});

interface JobberDialogProps {
  open: boolean;
  vendorId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DOCS_URL = 'https://developer.getjobber.com/docs';

const JobberDialog = ({ open, vendorId, onClose, onSuccess }: JobberDialogProps) => {
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      clientId: '',
      clientSecret: '',
      redirectUri: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      try {
        const payload: ISaveJobberCredentialsPayload = {
          vendorId,
          clientId: values.clientId,
          clientSecret: values.clientSecret,
          ...(values.redirectUri ? { redirectUri: values.redirectUri } : {}),
        };
        const response = await integrationService.saveJobberCredentials(payload);
        if (response.success) {
          formik.resetForm();
          onSuccess();
        } else {
          setError(response.error?.message || 'Failed to save credentials');
        }
      } catch {
        setError('An error occurred while saving credentials');
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
      <DialogTitle>Connect Jobber</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Enter your Jobber app credentials below. After saving, you will be
            redirected to Jobber to authorize access.
          </Alert>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <JobberField
              name="clientId"
              label="Client ID"
              formik={formik}
              helperHint="Found in your Jobber Developer app settings."
            />
            <JobberField
              name="clientSecret"
              label="Client Secret"
              formik={formik}
              type="password"
              helperHint="Found in your Jobber Developer app settings."
            />
            <JobberField
              name="redirectUri"
              label="Redirect URI (Optional)"
              formik={formik}
              helperHint="Leave blank to use the default. Must match the URI configured in your Jobber app."
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Need help?{' '}
            <Link href={DOCS_URL} target="_blank" rel="noopener">
              Jobber Developer Docs
            </Link>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? <CircularProgress size={20} /> : 'Save & Connect'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

interface JobberFieldProps {
  name: string;
  label: string;
  type?: string;
  helperHint: string;
  formik: ReturnType<typeof useFormik<{ clientId: string; clientSecret: string; redirectUri: string }>>;
}

const JobberField = ({ name, label, type, helperHint, formik }: JobberFieldProps) => {
  const fieldName = name as keyof typeof formik.values;
  const touched = formik.touched[fieldName];
  const errorMsg = formik.errors[fieldName];

  return (
    <Box>
      <TextField
        fullWidth
        name={name}
        label={label}
        size="small"
        type={type}
        value={formik.values[fieldName]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={Boolean(touched && errorMsg)}
        helperText={(touched && errorMsg) || helperHint}
      />
    </Box>
  );
};

export default JobberDialog;
