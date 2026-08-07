import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { ICampaignDetail, ICampaignWeek } from '../../types/campaign.types';

interface CampaignSnapshotProps {
  campaign: ICampaignDetail;
  selectedWeek: ICampaignWeek | null;
}

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const SnapshotRow = ({ label, value }: { label: string; value: string | number }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value}
    </Typography>
  </Box>
);

const CampaignSnapshot = ({ campaign, selectedWeek }: CampaignSnapshotProps) => {
  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Snapshot
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <SnapshotRow label="Current Product" value={campaign.currentProduct} />
      <SnapshotRow
        label="Total Mailing Quantity"
        value={campaign.totalMailingQuantity.toLocaleString()}
      />
      <SnapshotRow label="Week" value={selectedWeek ? selectedWeek.weekNumber : 1} />
      <SnapshotRow
        label="In Homes Week Of"
        value={selectedWeek ? formatDate(selectedWeek.inHomesWeekOf) : '—'}
      />
      <SnapshotRow
        label="This Week's Mailing Quantity"
        value={selectedWeek ? selectedWeek.mailingQuantity.toLocaleString() : '—'}
      />
      <SnapshotRow
        label="This Week's Total Payments"
        value={selectedWeek ? formatCurrency(selectedWeek.totalPayments) : '—'}
      />
      <SnapshotRow label="Payment Day" value={campaign.paymentDay} />
      <SnapshotRow label="Next Scheduled Product" value={campaign.nextScheduledProduct || '—'} />
      <SnapshotRow
        label="Next Scheduled Artwork Due Date"
        value={formatDate(campaign.nextScheduledArtworkDueDate)}
      />
    </Box>
  );
};

export default CampaignSnapshot;
