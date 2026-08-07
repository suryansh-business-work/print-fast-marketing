import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid2';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ICreateCampaignPayload, PAYMENT_DAYS, PRODUCT_OPTIONS } from '../../types/campaign.types';
import { IVendor } from '../../types/vendor.types';
import * as campaignService from '../../services/campaign.service';
import * as vendorService from '../../services/vendor.service';

const validationSchema = yup.object({
  vendor: yup.string().required('Vendor is required'),
  name: yup.string().required('Campaign name is required').max(200),
  description: yup.string().max(2000),
  currentProduct: yup.string().required('Current product is required').max(100),
  totalMailingQuantity: yup.number().integer().min(1, 'Must be at least 1').required('Required'),
  totalWeeks: yup
    .number()
    .integer()
    .min(1, 'Min 1 week')
    .max(52, 'Max 52 weeks')
    .required('Required'),
  startDate: yup.string().required('Start date is required'),
  paymentDay: yup.string().required('Payment day is required'),
  nextScheduledProduct: yup.string().max(100),
  nextScheduledArtworkDueDate: yup.string(),
  address: yup.string().required('Address is required').max(300),
  city: yup.string().required('City is required').max(100),
  state: yup.string().required('State is required').max(50),
  zipCode: yup.string().required('Zip code is required').max(10),
});

interface CreateCampaignDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCampaignDialog = ({ open, onClose, onSuccess }: CreateCampaignDialogProps) => {
  const [vendors, setVendors] = useState<IVendor[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      vendorService.listAllActiveVendors().then((res) => {
        if (res.success && res.data) {
          setVendors(res.data);
        }
      });
    }
  }, [open]);

  const formik = useFormik<ICreateCampaignPayload>({
    initialValues: {
      vendor: '',
      name: '',
      description: '',
      currentProduct: '',
      totalMailingQuantity: 0,
      totalWeeks: 4,
      startDate: '',
      paymentDay: 'Monday',
      nextScheduledProduct: '',
      nextScheduledArtworkDueDate: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError('');
      try {
        const payload: ICreateCampaignPayload = { ...values };
        if (!payload.nextScheduledArtworkDueDate) {
          delete payload.nextScheduledArtworkDueDate;
        }
        const response = await campaignService.createCampaign(payload);
        if (response.success) {
          formik.resetForm();
          onSuccess();
        } else {
          setError(response.error?.message || 'Failed to create campaign');
        }
      } catch {
        setError('An error occurred while creating the campaign');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Campaign</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Vendor"
                name="vendor"
                value={formik.values.vendor}
                onChange={formik.handleChange}
                error={formik.touched.vendor && Boolean(formik.errors.vendor)}
                helperText={formik.touched.vendor && formik.errors.vendor}
              >
                {vendors.map((v) => (
                  <MenuItem key={v.vendorId} value={v.vendorId}>
                    {v.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Campaign Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                multiline
                rows={2}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Current Product"
                name="currentProduct"
                value={formik.values.currentProduct}
                onChange={formik.handleChange}
                error={formik.touched.currentProduct && Boolean(formik.errors.currentProduct)}
                helperText={formik.touched.currentProduct && formik.errors.currentProduct}
              >
                {PRODUCT_OPTIONS.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Total Mailing Quantity"
                name="totalMailingQuantity"
                type="number"
                value={formik.values.totalMailingQuantity}
                onChange={formik.handleChange}
                error={
                  formik.touched.totalMailingQuantity && Boolean(formik.errors.totalMailingQuantity)
                }
                helperText={
                  formik.touched.totalMailingQuantity && formik.errors.totalMailingQuantity
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Total Weeks"
                name="totalWeeks"
                type="number"
                value={formik.values.totalWeeks}
                onChange={formik.handleChange}
                error={formik.touched.totalWeeks && Boolean(formik.errors.totalWeeks)}
                helperText={formik.touched.totalWeeks && formik.errors.totalWeeks}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formik.values.startDate}
                onChange={formik.handleChange}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                helperText={formik.touched.startDate && formik.errors.startDate}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Payment Day"
                name="paymentDay"
                value={formik.values.paymentDay}
                onChange={formik.handleChange}
                error={formik.touched.paymentDay && Boolean(formik.errors.paymentDay)}
                helperText={formik.touched.paymentDay && formik.errors.paymentDay}
              >
                {PAYMENT_DAYS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Next Scheduled Product"
                name="nextScheduledProduct"
                value={formik.values.nextScheduledProduct}
                onChange={formik.handleChange}
              >
                <MenuItem value="">None</MenuItem>
                {PRODUCT_OPTIONS.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Next Scheduled Artwork Due Date"
                name="nextScheduledArtworkDueDate"
                type="date"
                value={formik.values.nextScheduledArtworkDueDate}
                onChange={formik.handleChange}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formik.values.city}
                onChange={formik.handleChange}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formik.values.state}
                onChange={formik.handleChange}
                error={formik.touched.state && Boolean(formik.errors.state)}
                helperText={formik.touched.state && formik.errors.state}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Zip Code"
                name="zipCode"
                value={formik.values.zipCode}
                onChange={formik.handleChange}
                error={formik.touched.zipCode && Boolean(formik.errors.zipCode)}
                helperText={formik.touched.zipCode && formik.errors.zipCode}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateCampaignDialog;
