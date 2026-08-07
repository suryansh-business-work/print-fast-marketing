import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import { useFormik } from 'formik';

interface SettingsFieldsProps {
  formik: ReturnType<typeof useFormik<{
    tenantId: string;
    clientId: string;
    clientSecret: string;
    environment: string;
  }>>;
}

export const ServiceTitanSettingsFields = ({ formik }: SettingsFieldsProps) => (
  <>
    <TextField
      fullWidth
      name="tenantId"
      label="Tenant ID"
      size="small"
      placeholder="Leave empty to keep current"
      value={formik.values.tenantId}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      helperText="Your ServiceTitan tenant identifier"
    />
    <TextField
      fullWidth
      name="clientId"
      label="Client ID"
      size="small"
      placeholder="Leave empty to keep current"
      value={formik.values.clientId}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      helperText="API application Client ID"
    />
    <TextField
      fullWidth
      name="clientSecret"
      label="Client Secret"
      size="small"
      type="password"
      placeholder="Leave empty to keep current"
      value={formik.values.clientSecret}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      helperText="API application Client Secret"
    />
    <TextField
      select
      fullWidth
      name="environment"
      label="Environment"
      size="small"
      value={formik.values.environment}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      helperText="ServiceTitan environment"
    >
      <MenuItem value="production">Production</MenuItem>
      <MenuItem value="integration">Integration</MenuItem>
    </TextField>
  </>
);

export const JobberSettingsFields = ({ formik }: SettingsFieldsProps) => (
  <>
    <TextField
      fullWidth
      name="clientId"
      label="Client ID"
      size="small"
      placeholder="Leave empty to keep current"
      value={formik.values.clientId}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      helperText="Your Jobber app Client ID"
    />
    <TextField
      fullWidth
      name="clientSecret"
      label="Client Secret"
      size="small"
      type="password"
      placeholder="Leave empty to keep current"
      value={formik.values.clientSecret}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      helperText="Your Jobber app Client Secret"
    />
    <Alert severity="info" sx={{ mt: 1 }}>
      After updating credentials you may need to disconnect and reconnect via
      OAuth for changes to take effect.
    </Alert>
  </>
);
