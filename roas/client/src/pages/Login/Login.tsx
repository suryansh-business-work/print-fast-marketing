import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from '../../components/AuthLayout';
import SendGodCredentialsLink from './SendGodCredentialsLink';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        await login(values.email, values.password);
        navigate('/dashboard');
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosErr.response?.data?.error?.message || 'Login failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <AuthLayout subtitle="Log in to access your dashboard.">
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Welcome Back
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="email"
          name="email"
          placeholder="Email Address"
          margin="normal"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          autoComplete="email"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '28px' } }}
        />
        <TextField
          fullWidth
          id="password"
          name="password"
          placeholder="Password"
          type="password"
          margin="normal"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          autoComplete="current-password"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '28px' } }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5, mb: 1 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
            Forgot password?
          </Link>
        </Box>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={formik.isSubmitting}
          sx={{
            mt: 1,
            mb: 2,
            py: 1.5,
            borderRadius: '28px',
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          {formik.isSubmitting ? <CircularProgress size={24} /> : 'Log In'}
        </Button>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          component={RouterLink}
          to="/signup"
          sx={{
            mb: 3,
            py: 1.5,
            borderRadius: '28px',
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          Request Demo or Sign Up
        </Button>
      </form>

      <SendGodCredentialsLink />

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
        <Link variant="caption" color="text.secondary" underline="hover" href="#">
          Privacy Policy
        </Link>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <LockOutlinedIcon sx={{ fontSize: 14 }} /> Secured by SSL
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
        <Box
          component="img"
          src="https://ik.imagekit.io/esdata1/roas/print-fast.png"
          alt="Print Fast"
          sx={{ height: 32, mb: 0.5 }}
        />
        <Typography variant="caption" color="text.secondary">
          Property of Print Fast
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default Login;
