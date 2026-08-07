import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { Breadcrumb } from '../../components/Breadcrumb';

const ROASDashboard = () => {
  return (
    <Box>
      <Breadcrumb />
      <Typography variant="h4" sx={{ mb: 3 }}>
        ROAS Dashboard
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Coming Soon
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          ROAS analytics and reporting will be available here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ROASDashboard;
