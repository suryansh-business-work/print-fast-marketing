import { useLocation, Link as RouterLink } from 'react-router-dom';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Users',
  vendors: 'Vendors',
  reports: 'Reports',
  profile: 'Profile',
  settings: 'Settings',
  campaigns: 'Campaigns',
  integrations: 'Integrations',
  products: 'Products & Services',
  postcards: 'Postcards',
  clients: 'Clients',
  'roas-dashboard': 'ROAS Dashboard',
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs aria-label="breadcrumb">
        <Link component={RouterLink} to="/dashboard" underline="hover" color="inherit">
          Home
        </Link>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = routeLabels[value] || value.charAt(0).toUpperCase() + value.slice(1);

          return isLast ? (
            <Typography color="text.primary" key={to}>
              {label}
            </Typography>
          ) : (
            <Link component={RouterLink} to={to} underline="hover" color="inherit" key={to}>
              {label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumb;
