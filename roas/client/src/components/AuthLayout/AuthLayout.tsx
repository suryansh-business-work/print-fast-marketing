import Box from '@mui/material/Box';
import { ReactNode } from 'react';
import AuthBranding from './AuthBranding';

interface AuthLayoutProps {
  children: ReactNode;
  subtitle?: string;
}

const AuthLayout = ({ children, subtitle }: AuthLayoutProps) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {/* Left Branding Panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <AuthBranding subtitle={subtitle} />
      </Box>

      {/* Right Form Panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          minHeight: { xs: '100vh', md: 'auto' },
          p: { xs: 3, sm: 4, md: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
