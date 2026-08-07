import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import config from '../../config/config';

interface CampaignMapProps {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const CampaignMap = ({ latitude, longitude, address, city, state, zipCode }: CampaignMapProps) => {
  const hasCoordinates = latitude !== 0 && longitude !== 0;
  const apiKey = config.googleMapsApiKey;

  if (!apiKey) {
    return (
      <Box
        sx={{
          height: '100%',
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderRadius: 1,
        }}
      >
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Google Maps API key not configured
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {address}, {city}, {state} {zipCode}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!hasCoordinates) {
    return (
      <Box
        sx={{
          height: '100%',
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderRadius: 1,
        }}
      >
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No coordinates available for this campaign
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {address}, {city}, {state} {zipCode}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', minHeight: 300, borderRadius: 1, overflow: 'hidden' }}>
      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: '100%', height: '100%', minHeight: 300 }}
          defaultCenter={{ lat: latitude, lng: longitude }}
          defaultZoom={13}
          gestureHandling="cooperative"
          disableDefaultUI={false}
        >
          <Marker position={{ lat: latitude, lng: longitude }} />
        </Map>
      </APIProvider>
    </Box>
  );
};

export default CampaignMap;
