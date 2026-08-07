import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Breadcrumb } from '../../components/Breadcrumb';
import { DataTable, Column } from '../../components/Table';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { IUserDetail, ICreateUserResponse, UserRole } from '../../types/user.types';
import * as userService from '../../services/user.service';
import CreateUserDialog from './CreateUserDialog';
import EditUserDialog from './EditUserDialog';
import PasswordRevealDialog from './PasswordRevealDialog';

const Users = () => {
  const [rows, setRows] = useState<IUserDetail[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [createdUserData, setCreatedUserData] = useState<ICreateUserResponse | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IUserDetail | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IUserDetail | null>(null);
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userService.listUsers({
        page: page + 1, limit: rowsPerPage, sort: sortField, order: sortOrder,
        search: search || undefined, filters,
      });
      if (response.success && response.data) {
        setRows(response.data.items);
        setTotalItems(response.data.totalItems);
      }
    } catch { /* interceptor */ } finally { setIsLoading(false); }
  }, [page, rowsPerPage, sortField, sortOrder, search, filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSortChange = (field: string) => {
    if (field === sortField) { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }
    else { setSortField(field); setSortOrder('asc'); }
  };

  const handleEdit = (row: IUserDetail) => { setEditTarget(row); setEditDialogOpen(true); };
  const handleDelete = (row: IUserDetail) => { setDeleteTarget(row); setConfirmOpen(true); };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await userService.bulkDeactivateUsers([deleteTarget.userId]);
      showSnackbar('User deactivated successfully', 'success');
      setConfirmOpen(false); setDeleteTarget(null); fetchUsers();
    } catch { showSnackbar('Failed to deactivate user', 'error'); }
    finally { setIsDeleting(false); }
  };

  const handleBulkDelete = (ids: string[]) => { setBulkDeleteIds(ids); setConfirmBulkOpen(true); };

  const handleConfirmBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await userService.bulkDeactivateUsers(bulkDeleteIds);
      showSnackbar(`${bulkDeleteIds.length} user(s) deactivated`, 'success');
      setConfirmBulkOpen(false); setBulkDeleteIds([]); setSelectedRows([]); fetchUsers();
    } catch { showSnackbar('Failed to deactivate users', 'error'); }
    finally { setIsDeleting(false); }
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false); setEditTarget(null);
    showSnackbar('User updated successfully', 'success'); fetchUsers();
  };

  const handleCreateSuccess = (response: ICreateUserResponse) => {
    setCreateDialogOpen(false); setCreatedUserData(response);
    if (response.generatedPassword) { setPasswordDialogOpen(true); }
    showSnackbar('User created successfully', 'success'); fetchUsers();
  };

  const columns: Column<IUserDetail>[] = [
    { id: 'firstName', label: 'First Name', minWidth: 120, filterable: true, filterType: 'text' },
    { id: 'lastName', label: 'Last Name', minWidth: 120, filterable: true, filterType: 'text' },
    { id: 'email', label: 'Email', minWidth: 200, filterable: true, filterType: 'text' },
    {
      id: 'role', label: 'Role', minWidth: 120, filterable: true, filterType: 'select',
      filterOptions: [
        { value: UserRole.GOD_USER, label: 'God User' },
        { value: UserRole.ADMIN_USER, label: 'Admin User' },
        { value: UserRole.VENDOR_USER, label: 'Vendor User' },
      ],
      render: (row) => {
        const label = row.role.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return <Chip label={label} size="small" color="primary" variant="outlined" />;
      },
    },
    {
      id: 'isActive', label: 'Status', minWidth: 100, filterable: true, filterType: 'select',
      filterOptions: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }],
      render: (row) => (
        <Chip label={row.isActive ? 'Active' : 'Inactive'} size="small" color={row.isActive ? 'success' : 'default'} />
      ),
    },
    { id: 'createdAt', label: 'Created', minWidth: 120, render: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      id: 'actions', label: 'Actions', sortable: false, minWidth: 100,
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(row)}><DeleteIcon fontSize="small" color="error" /></IconButton></Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Breadcrumb />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Users</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>Create User</Button>
      </Box>
      <DataTable columns={columns} rows={rows} totalItems={totalItems} page={page} rowsPerPage={rowsPerPage}
        sortField={sortField} sortOrder={sortOrder} searchValue={search} onPageChange={setPage}
        onRowsPerPageChange={(rpp) => { setRowsPerPage(rpp); setPage(0); }}
        onSortChange={handleSortChange} onSearchChange={(s) => { setSearch(s); setPage(0); }}
        filters={filters} onFiltersChange={(f) => { setFilters(f); setPage(0); }}
        isLoading={isLoading} getRowKey={(row) => row.userId}
        selectable selectedRows={selectedRows} onSelectionChange={setSelectedRows} onBulkDelete={handleBulkDelete}
      />
      <CreateUserDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} onSuccess={handleCreateSuccess} />
      <EditUserDialog open={editDialogOpen} user={editTarget} onClose={() => { setEditDialogOpen(false); setEditTarget(null); }} onSuccess={handleEditSuccess} />
      {createdUserData?.generatedPassword && (
        <PasswordRevealDialog open={passwordDialogOpen}
          onClose={() => { setPasswordDialogOpen(false); setCreatedUserData(null); }}
          password={createdUserData.generatedPassword} email={createdUserData.email} />
      )}
      <ConfirmDialog open={confirmOpen} title="Deactivate User"
        message={`Are you sure you want to deactivate "${deleteTarget?.firstName} ${deleteTarget?.lastName}"?`}
        confirmLabel="Deactivate" isLoading={isDeleting} onConfirm={handleConfirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }} />
      <ConfirmDialog open={confirmBulkOpen} title="Deactivate Users"
        message={`Are you sure you want to deactivate ${bulkDeleteIds.length} user(s)?`}
        confirmLabel="Deactivate All" isLoading={isDeleting} onConfirm={handleConfirmBulkDelete}
        onCancel={() => { setConfirmBulkOpen(false); setBulkDeleteIds([]); }} />
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Users;
