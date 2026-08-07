import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IIntegration, IntegrationProvider, IntegrationStatus } from '../../types/integration.types';
import { IVendor } from '../../types/vendor.types';
import * as integrationService from '../../services/integration.service';
import * as vendorService from '../../services/vendor.service';
import { useAuth } from '../../hooks/useAuth';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export const useIntegrations = () => {
  const { user } = useAuth();
  const isVendor = user?.role === 'vendor_user';
  const [searchParams, setSearchParams] = useSearchParams();
  const vendorIdParam = searchParams.get('vendorId') || '';
  const jobberConnected = searchParams.get('jobber') === 'connected';

  const [vendors, setVendors] = useState<IVendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState(
    isVendor && user?.vendorId ? user.vendorId : vendorIdParam,
  );
  const [integrations, setIntegrations] = useState<IIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stDialogOpen, setStDialogOpen] = useState(false);
  const [jobberDialogOpen, setJobberDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IIntegration | null>(null);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (jobberConnected) {
      setSnackbar({ open: true, message: 'Jobber connected successfully!', severity: 'success' });
      setSearchParams((prev) => {
        prev.delete('jobber');
        return prev;
      });
    }
  }, [jobberConnected, setSearchParams]);

  useEffect(() => {
    if (!isVendor) {
      vendorService.listAllActiveVendors().then((res) => {
        if (res.success && res.data) setVendors(res.data);
      });
    }
  }, [isVendor]);

  useEffect(() => {
    if (isVendor && user?.vendorId && !selectedVendorId) {
      setSelectedVendorId(user.vendorId);
    }
  }, [isVendor, user?.vendorId, selectedVendorId]);

  const fetchIntegrations = useCallback(async () => {
    if (!selectedVendorId) return;
    setIsLoading(true);
    try {
      const res = await integrationService.getVendorIntegrations(selectedVendorId);
      if (res.success && res.data) setIntegrations(res.data);
    } catch {
      /* handled */
    } finally {
      setIsLoading(false);
    }
  }, [selectedVendorId]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const getIntegration = (provider: IntegrationProvider): IIntegration | undefined =>
    integrations.find((i) => i.provider === provider);

  const getStatus = (provider: IntegrationProvider): IntegrationStatus | null => {
    const found = getIntegration(provider);
    return found ? found.status : null;
  };

  const handleVendorChange = (id: string) => {
    setSelectedVendorId(id);
    setSearchParams({ vendorId: id });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') =>
    setSnackbar({ open: true, message, severity });

  const handleDisconnect = async (provider: IntegrationProvider) => {
    try {
      const res = await integrationService.disconnectIntegration({
        vendorId: selectedVendorId,
        provider,
      });
      if (res.success) {
        showSnackbar('Disconnected successfully', 'success');
        fetchIntegrations();
      }
    } catch {
      showSnackbar('Failed to disconnect', 'error');
    }
  };

  const handleJobberConnect = async () => {
    // If integration exists with PENDING status, creds are already saved — go straight to OAuth
    const existing = getIntegration(IntegrationProvider.JOBBER);
    if (existing && existing.status === IntegrationStatus.PENDING) {
      try {
        const res = await integrationService.getJobberOAuthUrl(selectedVendorId);
        if (res.success && res.data) {
          const width = 600;
          const height = 700;
          const left = window.screenX + (window.outerWidth - width) / 2;
          const top = window.screenY + (window.outerHeight - height) / 2;
          window.open(res.data.url, 'jobber-oauth', `width=${width},height=${height},left=${left},top=${top}`);
        }
      } catch {
        showSnackbar('Failed to start OAuth. Please try again.', 'error');
      }
      return;
    }
    setJobberDialogOpen(true);
  };

  const handleJobberCredentialsSaved = async () => {
    setJobberDialogOpen(false);
    await fetchIntegrations();
    // Immediately trigger OAuth flow after credentials are saved
    try {
      const res = await integrationService.getJobberOAuthUrl(selectedVendorId);
      if (res.success && res.data) {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        window.open(res.data.url, 'jobber-oauth', `width=${width},height=${height},left=${left},top=${top}`);
      }
    } catch {
      showSnackbar('Credentials saved but failed to start OAuth. Try the Connect button again.', 'error');
    }
  };

  const handleSettings = (provider: IntegrationProvider) => {
    const integration = getIntegration(provider);
    if (integration) {
      setSelectedIntegration(integration);
      setSettingsDialogOpen(true);
    }
  };

  const handleSync = async (provider: IntegrationProvider) => {
    const integration = getIntegration(provider);
    if (!integration) return;
    setSyncingIds((prev) => new Set(prev).add(integration.integrationId));
    try {
      const res = await integrationService.triggerSync(integration.integrationId);
      if (res.success && res.data) {
        showSnackbar(`Sync complete: ${res.data.jobs} jobs, ${res.data.invoices} invoices`, 'success');
        fetchIntegrations();
      }
    } catch {
      showSnackbar('Sync failed', 'error');
    } finally {
      setSyncingIds((prev) => {
        const next = new Set(prev);
        next.delete(integration.integrationId);
        return next;
      });
    }
  };

  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  return {
    isVendor,
    vendors,
    selectedVendorId,
    integrations,
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
  };
};
