import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Checkbox,
  MenuItem,
  Box,
  Typography,
  styled,
  Tooltip,
  Alert,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';


const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '& .MuiTableCell-head': {
    fontWeight: 'bold',
    fontSize: '1rem',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
}));

const ActivosModal = ({ open, onClose, assetsList, selectedAssets, onAssetsSelected, isGestionar }) => {
  const [filters, setFilters] = useState({
    codigo: '',
    ubicacion: '',
    proveedor: '',
    marca: '',
    categoria: '',
    estado: ''
  });
  const [page, setPage] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [localSelectedAssets, setLocalSelectedAssets] = useState(selectedAssets);
  const [assetsToDelete, setAssetsToDelete] = useState([]);
  const hasChanges = localSelectedAssets.some(id => !selectedAssets.includes(id)) || assetsToDelete.length > 0;

  const getUniqueValues = (field) => {
    return [...new Set(assetsList.map(asset => asset[field]))];
  };

  const getFilteredAssets = () => {
    return assetsList.filter(asset => {
      return (
        asset.COD_ACT.toLowerCase().includes(filters.codigo.toLowerCase()) &&
        asset.UBI_ACT.toLowerCase().includes(filters.ubicacion.toLowerCase()) &&
        (asset.NOM_PRO || '').toLowerCase().includes(filters.proveedor.toLowerCase()) &&
        asset.MAR_ACT.toLowerCase().includes(filters.marca.toLowerCase()) &&
        asset.CAT_ACT.toLowerCase().includes(filters.categoria.toLowerCase()) &&
        asset.EST_ACT.toLowerCase().includes(filters.estado.toLowerCase())
      );
    });
  };

  const getPaginatedAssets = () => {
    const filteredAssets = getFilteredAssets();
    return filteredAssets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0);
  };

  const clearAllFilters = () => {
    setFilters({
      codigo: '',
      ubicacion: '',
      proveedor: '',
      marca: '',
      categoria: '',
      estado: ''
    });
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAssetToggle = (assetId) => {
    
    setLocalSelectedAssets(prev => {
      if (prev.includes(assetId)) {
        return prev.filter(id => id !== assetId);
      } else {
        return [...prev, assetId];
      }
    });
  };

  const handleRemoveToggle = (assetId) => {
    setAssetsToDelete(prev => {
      if (prev.includes(assetId)) {
        return prev.filter(id => id !== assetId);
      } else {
        return [...prev, assetId];
      }
    });
  };

  const handleDeleteCheckboxChange = (event, assetId) => {
    const checked = event.target.checked;
    const associatedAssets = assetsList.filter(asset => asset.isAssociated);
    if (checked) {
      const updatedAssetsToDelete = [...assetsToDelete, assetId];
      const remainingAssociatedAssets = associatedAssets.filter(
        asset => !updatedAssetsToDelete.includes(asset.ID_ACT)
      );
      if (remainingAssociatedAssets.length === 0) {
        setErrorMessage('No puedes eliminar el último activo asociado.');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
        return; 
      }
      setAssetsToDelete(updatedAssetsToDelete);
    } else {
      setAssetsToDelete(prev => prev.filter(id => id !== assetId));
    }
  };
  

  const handleSave = () => {
    if (filteredAssets.length === 1 && assetsToDelete.includes(filteredAssets[0].ID_ACT)) {
      alert('No se puede eliminar el último activo asociado.');
      return;
    }
  
    onAssetsSelected(localSelectedAssets, assetsToDelete);
    onClose();
  };
  

  const filteredAssets = getFilteredAssets();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
       {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
      <DialogTitle>
        <Typography>Seleccionar Activos</Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Código"
            size="small"
            value={filters.codigo}
            onChange={(e) => handleFilterChange('codigo', e.target.value)}
          />
          <TextField
            label="Ubicación"
            size="small"
            value={filters.ubicacion}
            onChange={(e) => handleFilterChange('ubicacion', e.target.value)}
          />
          <TextField
            label="Proveedor"
            size="small"
            value={filters.proveedor}
            onChange={(e) => handleFilterChange('proveedor', e.target.value)}
          />
          <TextField
            select
            label="Marca"
            size="small"
            value={filters.marca}
            onChange={(e) => handleFilterChange('marca', e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {getUniqueValues('MAR_ACT').map(marca => (
              <MenuItem key={marca} value={marca}>{marca}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Categoría"
            size="small"
            value={filters.categoria}
            onChange={(e) => handleFilterChange('categoria', e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {getUniqueValues('CAT_ACT').map(categoria => (
              <MenuItem key={categoria} value={categoria}>{categoria}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Estado"
            size="small"
            value={filters.estado}
            onChange={(e) => handleFilterChange('estado', e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {getUniqueValues('EST_ACT').map(estado => (
              <MenuItem key={estado} value={estado}>{estado}</MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            onClick={clearAllFilters}
            startIcon={<ClearIcon />}
            sx={{
              minWidth: '150px',
              ml: 'auto',
              borderColor: (theme) => theme.palette.grey[300],
              color: (theme) => theme.palette.grey[700],
              '&:hover': {
                borderColor: (theme) => theme.palette.grey[400],
                backgroundColor: (theme) => theme.palette.grey[100],
              },
            }}
          >
            Limpiar Filtros
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <StyledTableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <strong>{isGestionar ? 'Añadir' : 'Seleccionar'}</strong>
                </TableCell>
                {isGestionar && (
                  <TableCell padding="checkbox">
                    <strong>Eliminar</strong>
                  </TableCell>
                )}
                <TableCell>Código</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Marca</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Proveedor</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {getPaginatedAssets().map((asset) => (
                <TableRow
                  key={asset.ID_ACT}
                  hover
                  onClick={isGestionar ? null : () => handleAssetToggle(asset.ID_ACT)}
                  role="checkbox"
                  aria-checked={localSelectedAssets.includes(asset.ID_ACT)}
                  selected={localSelectedAssets.includes(asset.ID_ACT)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={localSelectedAssets.includes(asset.ID_ACT)}
                      onChange={() => handleAssetToggle(asset.ID_ACT)}
                      disabled={
                        asset.isAssociated ||
                        asset.EST_DET_MANT === "Finalizado"
                      }
                    />
                  </TableCell>
                  {isGestionar && (
                    <TableCell padding="checkbox">
                      <Tooltip
                        title={!asset.isDeletable ? 'No se puede eliminar: Tiene actividades o componentes disponibles.' : ''}
                        arrow
                      >
                        <span>
                          <Checkbox
                            checked={assetsToDelete.includes(asset.ID_ACT)}
                            onChange={(e) => handleDeleteCheckboxChange(e, asset.ID_ACT)}
                            color="primary"
                            disabled={!asset.isDeletable}
                          />
                        </span>
                      </Tooltip>
                    </TableCell>
                  )}
                  <StyledTableCell>{asset.COD_ACT}</StyledTableCell>
                  <StyledTableCell>{asset.NOM_ACT}</StyledTableCell>
                  <StyledTableCell>{asset.MAR_ACT}</StyledTableCell>
                  <StyledTableCell>{asset.CAT_ACT}</StyledTableCell>
                  <StyledTableCell>{asset.UBI_ACT}</StyledTableCell>
                  <StyledTableCell>{asset.NOM_PRO || '-'}</StyledTableCell>
                  <StyledTableCell>{asset.EST_ACT}</StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredAssets.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={!hasChanges}>
          {isGestionar ? 'Guardar Cambios' : 'Agregar Seleccionados'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivosModal;
