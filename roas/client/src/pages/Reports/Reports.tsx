import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Breadcrumb } from '../../components/Breadcrumb';

const Reports = () => {
  return (
    <Box>
      <Breadcrumb />
      <Typography variant="h5" sx={{ mb: 2 }}>
        Reports
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Reports and analytics coming soon.
      </Typography>
    </Box>
  );
};

export default Reports;
