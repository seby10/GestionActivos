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

const ActivosModal = ({ open, onClose, assetsList, selectedAssets, onAssetsSelected }) => {
  const [filters, setFilters] = useState({
    codigo: '',
    ubicacion: '',
    proveedor: '',
    marca: '',
    categoria: '',
    estado: ''
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [localSelectedAssets, setLocalSelectedAssets] = useState(selectedAssets);

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

  // Limpiar todos los filtros
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

  // Manejar guardado de selección
  const handleSave = () => {
    onAssetsSelected(localSelectedAssets);
    onClose();
  };

  const filteredAssets = getFilteredAssets();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
            select
            label="Ubicación"
            size="small"
            value={filters.ubicacion}
            onChange={(e) => handleFilterChange('ubicacion', e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {getUniqueValues('UBI_ACT').map(ubicacion => (
              <MenuItem key={ubicacion} value={ubicacion}>{ubicacion}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Proveedor"
            size="small"
            value={filters.proveedor}
            onChange={(e) => handleFilterChange('proveedor', e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {getUniqueValues('NOM_PRO').map(proveedor => (
              <MenuItem key={proveedor} value={proveedor}>{proveedor}</MenuItem>
            ))}
          </TextField>
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
                  <Checkbox
                    indeterminate={
                      localSelectedAssets.length > 0 && 
                      localSelectedAssets.length < filteredAssets.length
                    }
                    checked={
                      filteredAssets.length > 0 && 
                      localSelectedAssets.length === filteredAssets.length
                    }
                    onChange={() => {
                      const filteredIds = filteredAssets.map(asset => asset.ID_ACT);
                      if (localSelectedAssets.length === filteredIds.length) {
                        setLocalSelectedAssets([]);
                      } else {
                        setLocalSelectedAssets(filteredIds);
                      }
                    }}
                  />
                </TableCell>
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
                  onClick={() => handleAssetToggle(asset.ID_ACT)}
                  role="checkbox"
                  aria-checked={localSelectedAssets.includes(asset.ID_ACT)}
                  selected={localSelectedAssets.includes(asset.ID_ACT)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={localSelectedAssets.includes(asset.ID_ACT)}
                      onChange={() => handleAssetToggle(asset.ID_ACT)}
                    />
                  </TableCell>
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
          sx={{
            ".MuiTablePagination-toolbar": {
              minHeight: "52px",
              alignItems: "center",
              pr: 2,
              pl: 2,
            },
            ".MuiTablePagination-selectLabel": {
              m: 0,
            },
            ".MuiTablePagination-displayedRows": {
              m: 0,
            },
            ".MuiTablePagination-select": {
              mr: 2,
            },
            ".MuiTablePagination-actions": {
              ml: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>
          Agregar Seleccionados
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivosModal;