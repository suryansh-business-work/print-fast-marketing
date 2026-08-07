import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import { FormikProps } from 'formik';
import { UserRole } from '../../types/user.types';

const ROUNDED_INPUT = { '& .MuiOutlinedInput-root': { borderRadius: '28px' } };

interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole.ADMIN_USER | UserRole.VENDOR_USER;
}

interface SignupFormProps {
  formik: FormikProps<SignupFormValues>;
  allowAdminSignup: boolean;
}

const SignupForm = ({ formik, allowAdminSignup }: SignupFormProps) => {
  return (
    <form onSubmit={formik.handleSubmit}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          name="firstName"
          placeholder="First Name"
          margin="normal"
          value={formik.values.firstName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
          helperText={formik.touched.firstName && formik.errors.firstName}
          sx={ROUNDED_INPUT}
        />
        <TextField
          fullWidth
          name="lastName"
          placeholder="Last Name"
          margin="normal"
          value={formik.values.lastName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched.lastName && formik.errors.lastName}
          sx={ROUNDED_INPUT}
        />
      </Box>
      <TextField
        fullWidth
        name="email"
        placeholder="Email Address"
        margin="normal"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        autoComplete="email"
        sx={ROUNDED_INPUT}
      />
      <TextField
        fullWidth
        name="password"
        placeholder="Password"
        type="password"
        margin="normal"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        autoComplete="new-password"
        sx={ROUNDED_INPUT}
      />
      <TextField
        fullWidth
        name="confirmPassword"
        placeholder="Confirm Password"
        type="password"
        margin="normal"
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
        autoComplete="new-password"
        sx={ROUNDED_INPUT}
      />
      <TextField
        fullWidth
        select
        name="role"
        label="Account Type"
        margin="normal"
        value={formik.values.role}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.role && Boolean(formik.errors.role)}
        helperText={formik.touched.role && formik.errors.role}
        sx={ROUNDED_INPUT}
      >
        <MenuItem value={UserRole.VENDOR_USER}>Vendor</MenuItem>
        {allowAdminSignup && <MenuItem value={UserRole.ADMIN_USER}>Admin</MenuItem>}
      </TextField>
      <Button
        fullWidth
        type="submit"
        variant="contained"
        size="large"
        disabled={formik.isSubmitting}
        sx={{ mt: 2, mb: 2, py: 1.5, borderRadius: '28px', fontSize: '1rem', fontWeight: 600 }}
      >
        {formik.isSubmitting ? <CircularProgress size={24} /> : 'Create Account'}
      </Button>
    </form>
  );
};

export default SignupForm;
