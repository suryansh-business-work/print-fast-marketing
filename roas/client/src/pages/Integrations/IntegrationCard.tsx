import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import SettingsIcon from '@mui/icons-material/Settings';
import SyncIcon from '@mui/icons-material/Sync';
import { IntegrationStatus } from '../../types/integration.types';

interface IntegrationCardProps {
  name: string;
  logoUrl: string;
  description: string;
  status: IntegrationStatus | null;
  lastSyncAt?: string | null;
  comingSoon?: boolean;
  isSyncing?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSettings: () => void;
  onSync: () => void;
}

const IntegrationCard = ({
  name,
  logoUrl,
  description,
  status,
  lastSyncAt,
  comingSoon,
  isSyncing,
  onConnect,
  onDisconnect,
  onSettings,
  onSync,
}: IntegrationCardProps) => {
  const isConnected = status === IntegrationStatus.CONNECTED;
  const isPending = status === IntegrationStatus.PENDING;
  const isSvg = logoUrl.endsWith('.svg');

  const formatSyncDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'Never synced';
    return `Last sync: ${new Date(dateStr).toLocaleString()}`;
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        opacity: comingSoon ? 0.7 : 1,
      }}
    >
      {!comingSoon && (
        <Box sx={{ position: 'absolute', top: 4, left: 4 }}>
          <Tooltip
            title={isConnected ? 'Integration Settings' : 'Connect first to configure settings'}
          >
            <span>
              <IconButton
                size="small"
                disabled={!isConnected}
                onClick={onSettings}
                sx={{ color: 'text.secondary' }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}
      {comingSoon && (
        <Chip
          label="Coming Soon"
          size="small"
          color="warning"
          sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 600 }}
        />
      )}
      {isConnected && (
        <Chip
          icon={<CheckCircleIcon />}
          label="Connected"
          size="small"
          color="success"
          sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 600 }}
        />
      )}
      {isPending && !comingSoon && (
        <Chip
          label="Pending Authorization"
          size="small"
          color="info"
          sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 600 }}
        />
      )}
      <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 3 }}>
        <Box
          sx={{
            width: 120,
            height: 60,
            mx: 'auto',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            component="img"
            src={logoUrl}
            alt={`${name} logo`}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              ...(isSvg ? { width: 120, height: 60 } : {}),
            }}
          />
        </Box>
        <Typography variant="h6" gutterBottom>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        {isConnected && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {formatSyncDate(lastSyncAt)}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'center', pb: 2, gap: 1 }}>
        {comingSoon ? (
          <Button disabled size="small" variant="outlined">
            Coming Soon
          </Button>
        ) : isConnected ? (
          <>
            <Button
              size="small"
              variant="outlined"
              startIcon={isSyncing ? <CircularProgress size={16} /> : <SyncIcon />}
              onClick={onSync}
              disabled={isSyncing}
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<LinkOffIcon />}
              onClick={onDisconnect}
            >
              Disconnect
            </Button>
          </>
        ) : isPending ? (
          <>
            <Button size="small" variant="contained" onClick={onConnect}>
              Authorize
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<LinkOffIcon />}
              onClick={onDisconnect}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button size="small" variant="contained" onClick={onConnect}>
            Connect
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default IntegrationCard;
