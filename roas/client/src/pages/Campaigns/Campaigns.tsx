import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Breadcrumb } from '../../components/Breadcrumb';
import { DataTable, Column } from '../../components/Table';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ICampaignListItem, PRODUCT_OPTIONS } from '../../types/campaign.types';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/user.types';
import * as campaignService from '../../services/campaign.service';
import CreateCampaignDialog from './CreateCampaignDialog';
import EditCampaignDialog from './EditCampaignDialog';

const Campaigns = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canManage = hasRole(UserRole.GOD_USER, UserRole.ADMIN_USER);

  const [rows, setRows] = useState<ICampaignListItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ICampaignListItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ICampaignListItem | null>(null);
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleEdit = (row: ICampaignListItem) => { setEditTarget(row); setEditDialogOpen(true); };
  const handleDelete = (row: ICampaignListItem) => { setDeleteTarget(row); setConfirmOpen(true); };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await campaignService.bulkDeactivateCampaigns([deleteTarget.campaignId]);
      showSnackbar('Campaign deactivated successfully', 'success');
      setConfirmOpen(false); setDeleteTarget(null); fetchCampaigns();
    } catch { showSnackbar('Failed to deactivate campaign', 'error'); }
    finally { setIsDeleting(false); }
  };

  const handleBulkDelete = (ids: string[]) => { setBulkDeleteIds(ids); setConfirmBulkOpen(true); };

  const handleConfirmBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await campaignService.bulkDeactivateCampaigns(bulkDeleteIds);
      showSnackbar(`${bulkDeleteIds.length} campaign(s) deactivated`, 'success');
      setConfirmBulkOpen(false); setBulkDeleteIds([]); setSelectedRows([]); fetchCampaigns();
    } catch { showSnackbar('Failed to deactivate campaigns', 'error'); }
    finally { setIsDeleting(false); }
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false); setEditTarget(null);
    showSnackbar('Campaign updated successfully', 'success'); fetchCampaigns();
  };

  const columns: Column<ICampaignListItem>[] = [
    { id: 'name', label: 'Campaign Name', minWidth: 180, filterable: true, filterType: 'text' },
    { id: 'vendorName', label: 'Vendor', minWidth: 150, filterable: true, filterType: 'text' },
    {
      id: 'currentProduct', label: 'Product', minWidth: 180, filterable: true, filterType: 'select',
      filterOptions: PRODUCT_OPTIONS.map((p) => ({ value: p, label: p })),
    },
    { id: 'totalMailingQuantity', label: 'Total Qty', minWidth: 100 },
    { id: 'totalWeeks', label: 'Weeks', minWidth: 80 },
    { id: 'startDate', label: 'Start Date', minWidth: 120, render: (row) => new Date(row.startDate).toLocaleDateString() },
    {
      id: 'isActive', label: 'Status', minWidth: 100, filterable: true, filterType: 'select',
      filterOptions: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }],
      render: (row) => (<Chip label={row.isActive ? 'Active' : 'Inactive'} size="small" color={row.isActive ? 'success' : 'default'} />),
    },
    {
      id: 'actions', label: 'Actions', sortable: false, minWidth: 130,
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Details"><IconButton size="small" onClick={() => navigate(`/campaigns/${row.campaignId}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          {canManage && (
            <>
              <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(row)}><DeleteIcon fontSize="small" color="error" /></IconButton></Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await campaignService.listCampaigns({
        page: page + 1, limit: rowsPerPage, sort: sortField, order: sortOrder,
        search: search || undefined, filters,
      });
      if (response.success && response.data) {
        setRows(response.data.items); setTotalItems(response.data.totalItems);
      }
    } catch { /* interceptor */ } finally { setIsLoading(false); }
  }, [page, rowsPerPage, sortField, sortOrder, search, filters]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleSortChange = (field: string) => {
    if (field === sortField) { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }
    else { setSortField(field); setSortOrder('asc'); }
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    showSnackbar('Campaign created successfully', 'success'); fetchCampaigns();
  };

  return (
    <Box>
      <Breadcrumb />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Campaigns</Typography>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>Create Campaign</Button>
        )}
      </Box>
      <DataTable columns={columns} rows={rows} totalItems={totalItems} page={page} rowsPerPage={rowsPerPage}
        sortField={sortField} sortOrder={sortOrder} searchValue={search} onPageChange={setPage}
        onRowsPerPageChange={(rpp) => { setRowsPerPage(rpp); setPage(0); }}
        onSortChange={handleSortChange} onSearchChange={(s) => { setSearch(s); setPage(0); }}
        filters={filters} onFiltersChange={(f) => { setFilters(f); setPage(0); }}
        isLoading={isLoading} getRowKey={(row) => row.campaignId}
        selectable selectedRows={selectedRows} onSelectionChange={setSelectedRows} onBulkDelete={handleBulkDelete}
      />
      {canManage && (
        <CreateCampaignDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} onSuccess={handleCreateSuccess} />
      )}
      <EditCampaignDialog open={editDialogOpen} campaign={editTarget}
        onClose={() => { setEditDialogOpen(false); setEditTarget(null); }} onSuccess={handleEditSuccess} />
      <ConfirmDialog open={confirmOpen} title="Deactivate Campaign"
        message={`Are you sure you want to deactivate "${deleteTarget?.name}"?`}
        confirmLabel="Deactivate" isLoading={isDeleting} onConfirm={handleConfirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }} />
      <ConfirmDialog open={confirmBulkOpen} title="Deactivate Campaigns"
        message={`Are you sure you want to deactivate ${bulkDeleteIds.length} campaign(s)?`}
        confirmLabel="Deactivate All" isLoading={isDeleting} onConfirm={handleConfirmBulkDelete}
        onCancel={() => { setConfirmBulkOpen(false); setBulkDeleteIds([]); }} />
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Campaigns;
