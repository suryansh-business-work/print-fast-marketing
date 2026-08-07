import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { ICampaignWeek } from '../../types/campaign.types';

interface WeekChipsProps {
  weeks: ICampaignWeek[];
  selectedWeekNumber: number;
  onWeekSelect: (weekNumber: number) => void;
}

const formatWeekDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

const WeekChips = ({ weeks, selectedWeekNumber, onWeekSelect }: WeekChipsProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        py: 1,
        px: 0.5,
        '&::-webkit-scrollbar': { height: 6 },
        '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: 'grey.400' },
      }}
    >
      {weeks.map((week) => {
        const isSelected = week.weekNumber === selectedWeekNumber;
        return (
          <Chip
            key={week.weekNumber}
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 0.5 }}>
                <Box sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Week {week.weekNumber}</Box>
                <Box sx={{ fontSize: '0.75rem' }}>{formatWeekDate(week.inHomesWeekOf)}</Box>
                <Box sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                  {week.mailingQuantity.toLocaleString()}
                </Box>
              </Box>
            }
            onClick={() => onWeekSelect(week.weekNumber)}
            variant={isSelected ? 'filled' : 'outlined'}
            color={isSelected ? 'primary' : 'default'}
            sx={{
              height: 'auto',
              minWidth: 120,
              '& .MuiChip-label': { px: 2, py: 0.5 },
              cursor: 'pointer',
            }}
          />
        );
      })}
    </Box>
  );
};

export default WeekChips;
