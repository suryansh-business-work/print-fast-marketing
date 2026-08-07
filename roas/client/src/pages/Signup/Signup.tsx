import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/user.types';
import { getPublicConfig } from '../../services/config.service';
import { AuthLayout } from '../../components/AuthLayout';
import SignupForm from './SignupForm';

const validationSchema = Yup.object({
  firstName: Yup.string().max(50, 'Max 50 characters').required('First name is required'),
  lastName: Yup.string().max(50, 'Max 50 characters').required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .min(8, 'At least 8 characters')
    .matches(/[A-Z]/, 'Must contain an uppercase letter')
    .matches(/[a-z]/, 'Must contain a lowercase letter')
    .matches(/[0-9]/, 'Must contain a number')
    .matches(/[^A-Za-z0-9]/, 'Must contain a special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  role: Yup.string()
    .oneOf([UserRole.ADMIN_USER, UserRole.VENDOR_USER])
    .required('Role is required'),
});

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [allowAdminSignup, setAllowAdminSignup] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await getPublicConfig();
        if (response.success && response.data) {
          setAllowAdminSignup(response.data.allowAdminSignup);
        }
      } catch {
        // Default to false if config fetch fails
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.VENDOR_USER as UserRole.ADMIN_USER | UserRole.VENDOR_USER,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        await signup(values);
        navigate('/dashboard');
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosErr.response?.data?.error?.message || 'Signup failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (configLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthLayout subtitle="Create an account to get started.">
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Create Account
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <SignupForm formik={formik} allowAdminSignup={allowAdminSignup} />

      <Typography variant="body2" align="center">
        Already have an account?{' '}
        <Link component={RouterLink} to="/login">
          Sign In
        </Link>
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
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

export default Signup;
