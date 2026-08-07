import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ICampaignListItem, PRODUCT_OPTIONS } from '../../types/campaign.types';
import * as campaignService from '../../services/campaign.service';

interface EditCampaignDialogProps {
  open: boolean;
  campaign: ICampaignListItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Campaign name is required').max(200),
  description: Yup.string().max(1000),
  currentProduct: Yup.string().required('Product is required'),
});

const EditCampaignDialog = ({ open, campaign, onClose, onSuccess }: EditCampaignDialogProps) => {
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: { name: '', description: '', currentProduct: '' },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      if (!campaign) return;
      setError('');
      try {
        const response = await campaignService.updateCampaign(campaign.campaignId, {
          name: values.name,
          description: values.description || undefined,
          currentProduct: values.currentProduct,
        });
        if (response.success) {
          onSuccess();
        }
      } catch (err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosErr.response?.data?.error?.message || 'Failed to update campaign');
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (campaign && open) {
      formik.setValues({
        name: campaign.name,
        description: campaign.description || '',
        currentProduct: campaign.currentProduct,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign, open]);

  const handleClose = () => {
    formik.resetForm();
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Campaign</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Campaign Name"
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
            <TextField
              select
              label="Product"
              name="currentProduct"
              value={formik.values.currentProduct}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.currentProduct && Boolean(formik.errors.currentProduct)}
              helperText={formik.touched.currentProduct && formik.errors.currentProduct}
              fullWidth
              required
            >
              {PRODUCT_OPTIONS.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
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

export default EditCampaignDialog;
