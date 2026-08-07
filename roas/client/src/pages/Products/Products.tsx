import { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataTable, Column } from '../../components/Table';
import { Breadcrumb } from '../../components/Breadcrumb';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { IProduct } from '../../types/product.types';
import * as productService from '../../services/product.service';
import CreateProductDialog from './CreateProductDialog';
import EditProductDialog from './EditProductDialog';

const Products = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IProduct | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IProduct | null>(null);
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await productService.listProducts({
        page: page + 1, limit: rowsPerPage, sort: sortField, order: sortOrder,
        search: search || undefined, filters,
      });
      if (response.success && response.data) {
        setProducts(response.data.items); setTotalItems(response.data.totalItems);
      }
    } catch { /* silent */ } finally { setIsLoading(false); }
  }, [page, rowsPerPage, sortField, sortOrder, search, filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSortChange = useCallback((field: string) => {
    if (sortField === field) { setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc')); }
    else { setSortField(field); setSortOrder('asc'); }
  }, [sortField]);

  const handleEdit = (row: IProduct) => { setEditTarget(row); setEditDialogOpen(true); };
  const handleDelete = (row: IProduct) => { setDeleteTarget(row); setConfirmOpen(true); };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await productService.bulkDeactivateProducts([deleteTarget.productId]);
      showSnackbar('Product deactivated successfully', 'success');
      setConfirmOpen(false); setDeleteTarget(null); fetchProducts();
    } catch { showSnackbar('Failed to deactivate product', 'error'); }
    finally { setIsDeleting(false); }
  };

  const handleBulkDelete = (ids: string[]) => { setBulkDeleteIds(ids); setConfirmBulkOpen(true); };

  const handleConfirmBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await productService.bulkDeactivateProducts(bulkDeleteIds);
      showSnackbar(`${bulkDeleteIds.length} product(s) deactivated`, 'success');
      setConfirmBulkOpen(false); setBulkDeleteIds([]); setSelectedRows([]); fetchProducts();
    } catch { showSnackbar('Failed to deactivate products', 'error'); }
    finally { setIsDeleting(false); }
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false); setEditTarget(null);
    showSnackbar('Product updated successfully', 'success'); fetchProducts();
  };

  const columns: Column<IProduct>[] = [
    { id: 'name', label: 'Name', filterable: true, filterType: 'text', minWidth: 150 },
    { id: 'description', label: 'Description', sortable: false, minWidth: 200 },
    { id: 'vendorName', label: 'Vendor', sortable: false, minWidth: 120 },
    {
      id: 'isActive', label: 'Status', minWidth: 100, filterable: true, filterType: 'select',
      filterOptions: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }],
      render: (row) => (<Chip label={row.isActive ? 'Active' : 'Inactive'} color={row.isActive ? 'success' : 'default'} size="small" />),
    },
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Products & Services</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>Add Product</Button>
      </Box>
      <DataTable columns={columns} rows={products} totalItems={totalItems} page={page} rowsPerPage={rowsPerPage}
        sortField={sortField} sortOrder={sortOrder} searchValue={search} onPageChange={setPage}
        onRowsPerPageChange={(rpp) => { setRowsPerPage(rpp); setPage(0); }}
        onSortChange={handleSortChange} onSearchChange={(s) => { setSearch(s); setPage(0); }}
        filters={filters} onFiltersChange={(f) => { setFilters(f); setPage(0); }}
        isLoading={isLoading} getRowKey={(row) => row.productId}
        selectable selectedRows={selectedRows} onSelectionChange={setSelectedRows} onBulkDelete={handleBulkDelete}
      />
      <CreateProductDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSuccess={fetchProducts} />
      <EditProductDialog open={editDialogOpen} product={editTarget}
        onClose={() => { setEditDialogOpen(false); setEditTarget(null); }} onSuccess={handleEditSuccess} />
      <ConfirmDialog open={confirmOpen} title="Deactivate Product"
        message={`Are you sure you want to deactivate "${deleteTarget?.name}"?`}
        confirmLabel="Deactivate" isLoading={isDeleting} onConfirm={handleConfirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }} />
      <ConfirmDialog open={confirmBulkOpen} title="Deactivate Products"
        message={`Are you sure you want to deactivate ${bulkDeleteIds.length} product(s)?`}
        confirmLabel="Deactivate All" isLoading={isDeleting} onConfirm={handleConfirmBulkDelete}
        onCancel={() => { setConfirmBulkOpen(false); setBulkDeleteIds([]); }} />
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Products;
