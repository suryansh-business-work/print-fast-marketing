import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import UploadIcon from '@mui/icons-material/Upload';
import { Breadcrumb } from '../../components/Breadcrumb';
import { ICampaignDetail, ICampaignWeek } from '../../types/campaign.types';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/user.types';
import * as campaignService from '../../services/campaign.service';
import CampaignSnapshot from './CampaignSnapshot';
import CampaignPostcard from './CampaignPostcard';
import CampaignMap from './CampaignMap';
import WeekChips from './WeekChips';

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const canManage = hasRole(UserRole.GOD_USER, UserRole.ADMIN_USER);

  const [campaign, setCampaign] = useState<ICampaignDetail | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<ICampaignWeek | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const fetchCampaign = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await campaignService.getCampaignById(id);
      if (response.success && response.data) {
        setCampaign(response.data);
        if (response.data.weeks.length > 0) {
          setSelectedWeek(response.data.weeks[0]);
        }
      } else {
        setError(response.error?.message || 'Failed to load campaign');
      }
    } catch {
      setError('An error occurred while loading the campaign');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const handleWeekSelect = (weekNumber: number) => {
    if (!campaign) return;
    const week = campaign.weeks.find((w) => w.weekNumber === weekNumber) || null;
    setSelectedWeek(week);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !id) return;
    try {
      const response = await campaignService.uploadPostcardPdf(id, e.target.files[0]);
      if (response.success && response.data) {
        setCampaign(response.data);
        setSnackbar({ open: true, message: 'PDF uploaded successfully', severity: 'success' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Failed to upload PDF', severity: 'error' });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !campaign) {
    return (
      <Box>
        <Breadcrumb />
        <Alert severity="error">{error || 'Campaign not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumb />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">{campaign.name}</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {campaign.vendor.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left section: Snapshot + Postcard */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3 }}>
            <CampaignSnapshot campaign={campaign} selectedWeek={selectedWeek} />
            <CampaignPostcard postcardImageUrl={campaign.postcardImageUrl} />
            {canManage && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  startIcon={<UploadIcon />}
                >
                  Upload Postcard PDF
                  <input type="file" hidden accept="application/pdf" onChange={handlePdfUpload} />
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right section: Map + Week chips */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, minHeight: 350 }}>
              <CampaignMap
                latitude={campaign.latitude}
                longitude={campaign.longitude}
                address={campaign.address}
                city={campaign.city}
                state={campaign.state}
                zipCode={campaign.zipCode}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <WeekChips
                weeks={campaign.weeks}
                selectedWeekNumber={selectedWeek?.weekNumber ?? 1}
                onWeekSelect={handleWeekSelect}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CampaignDetail;
