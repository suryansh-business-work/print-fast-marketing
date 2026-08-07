import { useState, useCallback, useMemo, ChangeEvent } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import SearchIcon from '@mui/icons-material/Search';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import TableFilterRow from './TableFilterRow';
import DataTableToolbar from './DataTableToolbar';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select';
  filterOptions?: { value: string; label: string }[];
  render?: (row: T) => React.ReactNode;
  minWidth?: number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  totalItems: number;
  page: number;
  rowsPerPage: number;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  searchValue: string;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSortChange: (field: string) => void;
  onSearchChange: (search: string) => void;
  filters?: Record<string, string>;
  onFiltersChange?: (filters: Record<string, string>) => void;
  isLoading?: boolean;
  getRowKey: (row: T) => string;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onBulkDelete?: (selectedIds: string[]) => void;
}

const DataTable = <T,>({
  columns,
  rows,
  totalItems,
  page,
  rowsPerPage,
  sortField,
  sortOrder,
  searchValue,
  onPageChange,
  onRowsPerPageChange,
  onSortChange,
  onSearchChange,
  filters,
  onFiltersChange,
  isLoading,
  getRowKey,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onBulkDelete,
}: DataTableProps<T>) => {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [filterKey, setFilterKey] = useState(0);

  const hasActiveFilters = filters && Object.values(filters).some((v) => v !== '');

  const selectedSet = useMemo(() => new Set(selectedRows), [selectedRows]);
  const allRowKeys = useMemo(() => rows.map(getRowKey), [rows, getRowKey]);
  const allSelected = rows.length > 0 && allRowKeys.every((k) => selectedSet.has(k));
  const someSelected = selectedRows.length > 0 && !allSelected;
  const colSpan = selectable ? columns.length + 1 : columns.length;

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? [] : allRowKeys);
  }, [allSelected, allRowKeys, onSelectionChange]);

  const handleSelectRow = useCallback(
    (key: string) => {
      if (!onSelectionChange) return;
      const next = selectedSet.has(key)
        ? selectedRows.filter((id) => id !== key)
        : [...selectedRows, key];
      onSelectionChange(next);
    },
    [selectedRows, selectedSet, onSelectionChange],
  );

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setLocalSearch(e.target.value);
      const timeout = setTimeout(() => {
        onSearchChange(e.target.value);
      }, 400);
      return () => clearTimeout(timeout);
    },
    [onSearchChange],
  );

  const handleFilterChange = useCallback(
    (field: string, value: string) => {
      if (!onFiltersChange || !filters) return;
      const updated = { ...filters };
      if (value) {
        updated[field] = value;
      } else {
        delete updated[field];
      }
      onFiltersChange(updated);
    },
    [filters, onFiltersChange],
  );

  const handleClearFilters = useCallback(() => {
    onFiltersChange?.({});
    setFilterKey((k) => k + 1);
  }, [onFiltersChange]);

  const handleBulkDelete = useCallback(() => {
    onBulkDelete?.(selectedRows);
  }, [onBulkDelete, selectedRows]);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          size="small"
          placeholder="Search..."
          value={localSearch}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        {hasActiveFilters && (
          <Tooltip title="Clear all filters">
            <IconButton size="small" onClick={handleClearFilters} color="primary">
              <FilterListOffIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      {selectable && (
        <DataTableToolbar
          selectedCount={selectedRows.length}
          onBulkDelete={onBulkDelete ? handleBulkDelete : undefined}
        />
      )}
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox" sx={{ fontWeight: 600 }}>
                  <Checkbox
                    indeterminate={someSelected}
                    checked={allSelected}
                    onChange={handleSelectAll}
                    size="small"
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell key={String(col.id)} sx={{ minWidth: col.minWidth, fontWeight: 600 }}>
                  {col.sortable !== false ? (
                    <TableSortLabel
                      active={sortField === col.id}
                      direction={sortField === col.id ? sortOrder : 'asc'}
                      onClick={() => onSortChange(String(col.id))}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
            {filters && onFiltersChange && (
              <TableFilterRow
                key={filterKey}
                columns={columns}
                filters={filters}
                onFilterChange={handleFilterChange}
                hasCheckbox={selectable}
              />
            )}
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={colSpan} align="center" sx={{ py: 4 }}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} align="center" sx={{ py: 4 }}>
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const key = getRowKey(row);
                const isSelected = selectedSet.has(key);
                return (
                  <TableRow hover key={key} selected={isSelected}>
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectRow(key)}
                          size="small"
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={String(col.id)}>
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[String(col.id)] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalItems}
        page={page}
        onPageChange={(_e, newPage) => onPageChange(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
};

export default DataTable;
