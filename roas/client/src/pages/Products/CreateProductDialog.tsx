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
import * as productService from '../../services/product.service';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/user.types';

interface CreateProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Product name is required').max(200),
  description: Yup.string().max(2000),
  vendor: Yup.string().required('Vendor is required'),
});

const CreateProductDialog = ({ open, onClose, onSuccess }: CreateProductDialogProps) => {
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
      description: '',
      vendor: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setError('');
        const vendorId = isVendor ? (user?.vendorId || '') : values.vendor;
        const response = await productService.createProduct({
          name: values.name,
          description: values.description || undefined,
          vendor: vendorId,
        });
        if (response.success) {
          resetForm();
          onSuccess();
          onClose();
        }
      } catch (err) {
        const error = err as { response?: { data?: { error?: { message?: string } } } };
        setError(error.response?.data?.error?.message || 'Failed to create product');
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
      <DialogTitle>Create Product / Service</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Product Name"
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
              label="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              fullWidth
              multiline
              rows={3}
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

export default CreateProductDialog;
