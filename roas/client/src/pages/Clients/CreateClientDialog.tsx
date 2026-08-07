import { useState, useCallback, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { IVendorOption } from '../../types/vendor.types';
import * as vendorService from '../../services/vendor.service';
import * as clientService from '../../services/client.service';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/user.types';

interface CreateClientDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Client name is required').max(200),
  email: Yup.string().email('Invalid email').required('Email is required').max(200),
  label: Yup.string().max(100),
  category: Yup.string().max(100),
  tag: Yup.string().max(100),
  vendor: Yup.string().required('Vendor is required'),
});

const CreateClientDialog = ({ open, onClose, onSuccess }: CreateClientDialogProps) => {
  const { user, hasRole } = useAuth();
  const [vendors, setVendors] = useState<IVendorOption[]>([]);
  const [error, setError] = useState('');

  const isVendor = hasRole(UserRole.VENDOR_USER);

  useEffect(() => {
    if (open && !isVendor) {
      vendorService.listAllActiveVendors().then((res) => {
        if (res.success && res.data) {
          setVendors(
            res.data.map((v) => ({ vendorId: v.vendorId, name: v.name })),
          );
        }
      });
    }
  }, [open, isVendor]);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      label: '',
      category: '',
      tag: '',
      vendor: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setError('');
        const vendorId = isVendor ? (user?.vendorId || '') : values.vendor;
        const response = await clientService.createClient({
          name: values.name,
          email: values.email,
          label: values.label || undefined,
          category: values.category || undefined,
          tag: values.tag || undefined,
          vendor: vendorId,
        });
        if (response.success) {
          resetForm();
          onSuccess();
          onClose();
        }
      } catch (err) {
        const error = err as { response?: { data?: { error?: { message?: string } } } };
        setError(error.response?.data?.error?.message || 'Failed to create client');
      }
    },
  });

  const handleClose = useCallback(() => {
    formik.resetForm();
    setError('');
    onClose();
  }, [formik, onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Client</DialogTitle>
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
            {!isVendor && (
              <TextField
                select
                label="Vendor"
                name="vendor"
                value={formik.values.vendor}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.vendor && Boolean(formik.errors.vendor)}
                helperText={formik.touched.vendor && formik.errors.vendor}
                fullWidth
                required
              >
                <MenuItem value="">Select Vendor</MenuItem>
                {vendors.map((v) => (
                  <MenuItem key={v.vendorId} value={v.vendorId}>
                    {v.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateClientDialog;
