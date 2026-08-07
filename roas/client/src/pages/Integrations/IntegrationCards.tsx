import Grid from '@mui/material/Grid2';
import IntegrationCard from './IntegrationCard';
import { IIntegration, IntegrationProvider, IntegrationStatus } from '../../types/integration.types';

const LOGOS = {
  serviceTitan: 'https://ik.imagekit.io/esdata1/roas/ServiceTitan.svg',
  jobber: 'https://ik.imagekit.io/esdata1/roas/jobber.png',
  serviceWare: 'https://ik.imagekit.io/esdata1/roas/serviceware.png',
};

interface IntegrationCardsProps {
  syncingIds: Set<string>;
  getStatus: (provider: IntegrationProvider) => IntegrationStatus | null;
  getIntegration: (provider: IntegrationProvider) => IIntegration | undefined;
  onStConnect: () => void;
  onJobberConnect: () => void;
  onDisconnect: (provider: IntegrationProvider) => void;
  onSettings: (provider: IntegrationProvider) => void;
  onSync: (provider: IntegrationProvider) => void;
}

const IntegrationCards = ({
  syncingIds,
  getStatus,
  getIntegration,
  onStConnect,
  onJobberConnect,
  onDisconnect,
  onSettings,
  onSync,
}: IntegrationCardsProps) => {
  const stIntegration = getIntegration(IntegrationProvider.SERVICE_TITAN);
  const jobberIntegration = getIntegration(IntegrationProvider.JOBBER);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <IntegrationCard
          name="Service Titan"
          logoUrl={LOGOS.serviceTitan}
          description="Connect your Service Titan account for automated job tracking and reporting."
          status={getStatus(IntegrationProvider.SERVICE_TITAN)}
          lastSyncAt={stIntegration?.lastSyncAt}
          isSyncing={stIntegration ? syncingIds.has(stIntegration.integrationId) : false}
          onConnect={onStConnect}
          onDisconnect={() => onDisconnect(IntegrationProvider.SERVICE_TITAN)}
          onSettings={() => onSettings(IntegrationProvider.SERVICE_TITAN)}
          onSync={() => onSync(IntegrationProvider.SERVICE_TITAN)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <IntegrationCard
          name="Jobber"
          logoUrl={LOGOS.jobber}
          description="Connect your Jobber account via OAuth for seamless job management."
          status={getStatus(IntegrationProvider.JOBBER)}
          lastSyncAt={jobberIntegration?.lastSyncAt}
          isSyncing={jobberIntegration ? syncingIds.has(jobberIntegration.integrationId) : false}
          onConnect={onJobberConnect}
          onDisconnect={() => onDisconnect(IntegrationProvider.JOBBER)}
          onSettings={() => onSettings(IntegrationProvider.JOBBER)}
          onSync={() => onSync(IntegrationProvider.JOBBER)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <IntegrationCard
          name="ServiceWare"
          logoUrl={LOGOS.serviceWare}
          description="ServiceWare integration for field service management."
          status={null}
          comingSoon
          onConnect={() => {}}
          onDisconnect={() => {}}
          onSettings={() => {}}
          onSync={() => {}}
        />
      </Grid>
    </Grid>
  );
};

export default IntegrationCards;
