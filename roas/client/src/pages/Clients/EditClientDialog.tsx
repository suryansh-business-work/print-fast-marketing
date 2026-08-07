import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { IClient } from '../../types/client.types';
import * as clientService from '../../services/client.service';

interface EditClientDialogProps {
  open: boolean;
  client: IClient | null;
  onClose: () => void;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Client name is required').max(200),
  email: Yup.string().email('Invalid email').required('Email is required').max(200),
  label: Yup.string().max(100),
  category: Yup.string().max(100),
  tag: Yup.string().max(100),
});

const EditClientDialog = ({ open, client, onClose, onSuccess }: EditClientDialogProps) => {
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: { name: '', email: '', label: '', category: '', tag: '' },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      if (!client) return;
      setError('');
      try {
        const response = await clientService.updateClient(client.clientId, {
          name: values.name,
          email: values.email,
          label: values.label || undefined,
          category: values.category || undefined,
          tag: values.tag || undefined,
        });
        if (response.success) {
          onSuccess();
        }
      } catch (err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosErr.response?.data?.error?.message || 'Failed to update client');
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (client && open) {
      formik.setValues({
        name: client.name,
        email: client.email,
        label: client.label,
        category: client.category,
        tag: client.tag,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, open]);

  const handleClose = () => {
    formik.resetForm();
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Client</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Client Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              fullWidth
              required
            />
            <TextField
              label="Label"
              name="label"
              value={formik.values.label}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.label && Boolean(formik.errors.label)}
              helperText={formik.touched.label && formik.errors.label}
              fullWidth
            />
            <TextField
              label="Category"
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.category && Boolean(formik.errors.category)}
              helperText={formik.touched.category && formik.errors.category}
              fullWidth
            />
            <TextField
              label="Tag"
              name="tag"
              value={formik.values.tag}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.tag && Boolean(formik.errors.tag)}
              helperText={formik.touched.tag && formik.errors.tag}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={formik.isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            startIcon={formik.isSubmitting ? <CircularProgress size={20} /> : undefined}
          >
            {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditClientDialog;
