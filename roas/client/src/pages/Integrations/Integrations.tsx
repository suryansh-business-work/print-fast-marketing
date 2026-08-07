import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { Breadcrumb } from '../../components/Breadcrumb';
import IntegrationCards from './IntegrationCards';
import ServiceTitanDialog from './ServiceTitanDialog';
import JobberDialog from './JobberDialog';
import IntegrationSettingsDialog from './IntegrationSettingsDialog';
import { useIntegrations } from './useIntegrations';

const Integrations = () => {
  const {
    isVendor,
    vendors,
    selectedVendorId,
    isLoading,
    stDialogOpen,
    setStDialogOpen,
    jobberDialogOpen,
    setJobberDialogOpen,
    settingsDialogOpen,
    setSettingsDialogOpen,
    selectedIntegration,
    setSelectedIntegration,
    syncingIds,
    snackbar,
    closeSnackbar,
    getStatus,
    getIntegration,
    handleVendorChange,
    handleDisconnect,
    handleJobberConnect,
    handleJobberCredentialsSaved,
    handleSettings,
    handleSync,
    fetchIntegrations,
    showSnackbar,
  } = useIntegrations();

  return (
    <Box>
      <Breadcrumb />
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Integrations
      </Typography>

      {!isVendor && (
        <TextField
          select
          label="Select Vendor"
          value={selectedVendorId}
          onChange={(e) => handleVendorChange(e.target.value)}
          size="small"
          sx={{ mb: 3, minWidth: 280 }}
        >
          {vendors.map((v) => (
            <MenuItem key={v.vendorId} value={v.vendorId}>
              {v.name}
            </MenuItem>
          ))}
        </TextField>
      )}

      {!selectedVendorId && !isVendor && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please select a vendor to manage integrations.
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : selectedVendorId ? (
        <IntegrationCards
          syncingIds={syncingIds}
          getStatus={getStatus}
          getIntegration={getIntegration}
          onStConnect={() => setStDialogOpen(true)}
          onJobberConnect={handleJobberConnect}
          onDisconnect={handleDisconnect}
          onSettings={handleSettings}
          onSync={handleSync}
        />
      ) : null}

      <ServiceTitanDialog
        open={stDialogOpen}
        vendorId={selectedVendorId}
        onClose={() => setStDialogOpen(false)}
        onSuccess={() => {
          setStDialogOpen(false);
          showSnackbar('Service Titan connected!', 'success');
          fetchIntegrations();
        }}
      />

      <JobberDialog
        open={jobberDialogOpen}
        vendorId={selectedVendorId}
        onClose={() => setJobberDialogOpen(false)}
        onSuccess={handleJobberCredentialsSaved}
      />

      <IntegrationSettingsDialog
        open={settingsDialogOpen}
        integration={selectedIntegration}
        onClose={() => {
          setSettingsDialogOpen(false);
          setSelectedIntegration(null);
        }}
        onSuccess={() => {
          setSettingsDialogOpen(false);
          setSelectedIntegration(null);
          showSnackbar('Settings updated!', 'success');
          fetchIntegrations();
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Integrations;
