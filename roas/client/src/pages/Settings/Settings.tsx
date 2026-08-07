import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Breadcrumb } from '../../components/Breadcrumb';

const Settings = () => {
  return (
    <Box>
      <Breadcrumb />
      <Typography variant="h5" sx={{ mb: 2 }}>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary">
        System settings coming soon.
      </Typography>
    </Box>
  );
};

export default Settings;
