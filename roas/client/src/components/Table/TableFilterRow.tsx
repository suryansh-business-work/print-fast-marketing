import { useState, useCallback, useRef, useEffect, ChangeEvent } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { Column } from './DataTable';

interface TableFilterRowProps<T> {
  columns: Column<T>[];
  filters: Record<string, string>;
  onFilterChange: (field: string, value: string) => void;
  hasCheckbox?: boolean;
}

const TableFilterRow = <T,>({
  columns,
  filters,
  onFilterChange,
  hasCheckbox = false,
}: TableFilterRowProps<T>) => {
  const [localValues, setLocalValues] = useState<Record<string, string>>(filters);
  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    setLocalValues(filters);
  }, [filters]);

  const handleTextChange = useCallback(
    (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalValues((prev) => ({ ...prev, [field]: value }));
      if (timeoutsRef.current[field]) {
        clearTimeout(timeoutsRef.current[field]);
      }
      timeoutsRef.current[field] = setTimeout(() => {
        onFilterChange(field, value);
      }, 400);
    },
    [onFilterChange],
  );

  const handleSelectChange = useCallback(
    (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalValues((prev) => ({ ...prev, [field]: value }));
      onFilterChange(field, value);
    },
    [onFilterChange],
  );

  return (
    <TableRow>
      {hasCheckbox && <TableCell sx={{ py: 0.5 }} />}
      {columns.map((col) => {
        const field = String(col.id);

        if (!col.filterable) {
          return <TableCell key={field} sx={{ py: 0.5 }} />;
        }

        if (col.filterType === 'select' && col.filterOptions) {
          return (
            <TableCell key={field} sx={{ py: 0.5 }}>
              <TextField
                select
                size="small"
                fullWidth
                value={localValues[field] || ''}
                onChange={handleSelectChange(field)}
                sx={{ '& .MuiInputBase-root': { fontSize: '0.8rem' } }}
              >
                <MenuItem value="">All</MenuItem>
                {col.filterOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </TableCell>
          );
        }

        return (
          <TableCell key={field} sx={{ py: 0.5 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Filter..."
              value={localValues[field] || ''}
              onChange={handleTextChange(field)}
              sx={{ '& .MuiInputBase-root': { fontSize: '0.8rem' } }}
            />
          </TableCell>
        );
      })}
    </TableRow>
  );
};

export default TableFilterRow;
