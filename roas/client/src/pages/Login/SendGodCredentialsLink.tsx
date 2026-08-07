import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { getPublicConfig } from '../../services/config.service';
import { sendSuperAdminCredentials } from '../../services/auth.service';

const SendGodCredentialsLink = () => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await getPublicConfig();
        setVisible(response.data?.allowSendGodCredentials ?? false);
      } catch {
        setVisible(false);
      }
    };
    fetchConfig();
  }, []);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await sendSuperAdminCredentials();
      setSnackbar({
        open: true,
        message: response.message || 'Credentials sent to Super Admin email.',
        severity: 'success',
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setSnackbar({
        open: true,
        message: axiosErr.response?.data?.error?.message || 'Failed to send credentials.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (!visible) return null;

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 1 }}>
        <Link
          component="button"
          variant="body2"
          underline="hover"
          onClick={handleClick}
          sx={{
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {loading && <CircularProgress size={14} />}
          Send credentials for Super Admin
        </Link>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SendGodCredentialsLink;
