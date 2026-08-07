import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';

interface DataTableToolbarProps {
  selectedCount: number;
  onBulkDelete?: () => void;
}

const DataTableToolbar = ({ selectedCount, onBulkDelete }: DataTableToolbarProps) => {
  if (selectedCount === 0) return null;

  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography color="primary" variant="subtitle2">
        {selectedCount} row{selectedCount > 1 ? 's' : ''} selected
      </Typography>
      {onBulkDelete && (
        <Tooltip title="Delete selected">
          <Button
            size="small"
            color="error"
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={onBulkDelete}
          >
            Delete Selected
          </Button>
        </Tooltip>
      )}
    </Box>
  );
};

export default DataTableToolbar;
