import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Box,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Checkbox,
  Paper,
  MenuItem,
  Alert,
  Snackbar,
  styled
} from "@mui/material";
import { Visibility, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { mantenimientosServices } from '../services/mantenimientosServices.js';

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '& .MuiTableCell-head': {
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: '1rem'
  }
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2)
}));

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-EC', {
    timeZone: 'America/Guayaquil',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

// Componente de fila de mantenimiento
const MaintenanceRow = ({ maintenance, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [canFinish, setCanFinish] = useState(false);
  const [finishLoading, setFinishLoading] = useState(false);// Cambiado a false por defecto

  const handleToggle = async () => {
    if (!open) {
      setLoadingAssets(true);
      try {
        const fetchedAssets = await mantenimientosServices.getMaintenanceDetails(maintenance.ID_MANT);
        setAssets(fetchedAssets);
        const allInMaintenance = fetchedAssets.every(asset => asset.EST_DET_MANT === 'Finalizado');
        setCanFinish(allInMaintenance);
      } catch (error) {
        console.error('Error loading maintenance details:', error);
      } finally {
        setLoadingAssets(false);
      }
    }
    setOpen(!open);
  };

  const handleFinishMaintenance = async () => {
    setFinishLoading(true);
    try {
      await mantenimientosServices.finishMaintenance(maintenance.ID_MANT);
      onUpdate();
    } catch (error) {
      console.error('Error finishing maintenance:', error);
    } finally {
      setFinishLoading(false);
    }
  };

  const getFinishButtonColor = () => {
    if (maintenance.ESTADO_MANT === 'Finalizado') return 'success';
    if (canFinish) return 'primary';
    return 'inherit';
  };

  const getFinishButtonText = () => {
    if (finishLoading) return 'Finalizando...';
    if (maintenance.ESTADO_MANT === 'Finalizado') return 'Finalizado';
    if (!canFinish) return 'Finalizar';
    return 'Finalizar';
  };

  return (
    <>
      <TableRow hover>
        <StyledTableCell>
          <IconButton
            size="small"
            onClick={handleToggle}
            sx={{ transition: 'transform 0.3s' }}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </StyledTableCell>
        <StyledTableCell>{maintenance.COD_MANT}</StyledTableCell>
        <StyledTableCell>{maintenance.DESC_MANT}</StyledTableCell>
        <StyledTableCell>{formatDate(maintenance.FEC_INI_MANT)}</StyledTableCell>
        <StyledTableCell>{maintenance.ID_TEC_INT === null ? maintenance.NOM_PRO : maintenance.NOM_USU}</StyledTableCell>
        <StyledTableCell>
          <Typography
            variant="body2"
            sx={{
              backgroundColor: maintenance.ID_TEC_INT === null ? '#ff9800' : '#4caf50',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            {maintenance.ID_TEC_INT === null ? 'EXTERNO' : 'INTERNO'}
          </Typography>
        </StyledTableCell>
        <StyledTableCell>
          <Typography
            variant="body2"
            sx={{
              backgroundColor: maintenance.ESTADO_MANT === 'Finalizado' ? '#4caf50' : '#2196f3',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            {maintenance.ESTADO_MANT}
          </Typography>
        </StyledTableCell>
        <StyledTableCell>
          <Button
            onClick={handleFinishMaintenance}
            disabled={!canFinish || maintenance.ESTADO_MANT === 'Finalizado' || finishLoading}
            variant={maintenance.ESTADO_MANT === 'Finalizado' ? "outlined" : "contained"}
            color={getFinishButtonColor()}
            sx={{
              minWidth: '100px',
              position: 'relative',
              '&.Mui-disabled': {
                backgroundColor: maintenance.ESTADO_MANT === 'Finalizado' ? 'transparent' : '#e0e0e0',
                border: maintenance.ESTADO_MANT === 'Finalizado' ? '1px solid #4caf50' : 'none',
                color: maintenance.ESTADO_MANT === 'Finalizado' ? '#4caf50' : 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            {finishLoading ? (
              <CircularProgress
                size={24}
                sx={{
                  color: getFinishButtonColor(),
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px'
                }}
              />
            ) : null}
            {getFinishButtonText()}
          </Button>
        </StyledTableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                Activos en Mantenimiento
              </Typography>
              {loadingAssets ? (
                <CircularProgress />
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Codigo</StyledTableCell>
                      <StyledTableCell>Nombre</StyledTableCell>
                      <StyledTableCell>Marca</StyledTableCell>
                      <StyledTableCell>Categoría</StyledTableCell>
                      <StyledTableCell>Ubicación</StyledTableCell>
                      <StyledTableCell>Estado</StyledTableCell>
                      <StyledTableCell>Acciones</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.ID_ACT}>
                        <TableCell>{asset.COD_ACT}</TableCell>
                        <TableCell>{asset.NOM_ACT}</TableCell>
                        <TableCell>{asset.MAR_ACT}</TableCell>
                        <TableCell>{asset.NOM_ACT}</TableCell>
                        <TableCell>{asset.UBI_ACT}</TableCell>
                        <TableCell>{asset.EST_DET_MANT}</TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => openActivityModal(asset)}
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const ExpandableTable = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [technicalType, setTechnicalType] = useState('internal');
  const [internalUsers, setInternalUsers] = useState([]);
  const [externalProviders, setExternalProviders] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [newMaintenance, setNewMaintenance] = useState({
    codigo: "",
    descripcion: "",
    fechaInicio: "",
    tecnicoAsignado: "",
    tipoTecnico: "internal",
    activos: [],
  });
  const [assetsList, setAssetsList] = useState([]);
  const [filterCode, setFilterCode] = useState('');
  const [filterTechnician, setFilterTechnician] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  //const [filterType, setFilterType] = useState('');

  const showAlert = (message, severity = 'error') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const validateFields = () => {
    const requiredFields = {
      codigo: 'Código',
      descripcion: 'Descripción',
      fechaInicio: 'Fecha de Inicio',
      tecnicoAsignado: 'Técnico Asignado'
    };

    const emptyFields = Object.entries(requiredFields)
      .filter(([key]) => !newMaintenance[key])
      .map(([_, label]) => label);

    if (emptyFields.length > 0) {
      showAlert(`Por favor complete los siguientes campos: ${emptyFields.join(', ')}`);
      return false;
    }

    if (newMaintenance.activos.length === 0) {
      showAlert('Debe seleccionar al menos un activo');
      return false;
    }

    return true;
  };

  const getFilteredMaintenances = () => {
    return maintenances.filter(maintenance => {
      const matchCode = maintenance.COD_MANT.toLowerCase().includes(filterCode.toLowerCase());
      const matchTechnician = (maintenance.NOM_PRO || maintenance.NOM_USU || '').toLowerCase().includes(filterTechnician.toLowerCase());
      const matchDate = !filterDate || maintenance.FEC_INI_MANT.includes(filterDate);
      const matchStatus = !filterStatus || maintenance.ESTADO_MANT.toLowerCase() === filterStatus.toLowerCase();
      //const matchType = !filterType || maintenance.ESTADO_MANT.toLowerCase() === filterStatus.toLowerCase();

      return matchCode && matchTechnician && matchDate && matchStatus;
    });
  };

  const fetchTechnicians = async (type) => {
    try {
      if (type === 'internal') {
        const users = await mantenimientosServices.getInternalUsers();
        setInternalUsers(users);
      } else {
        const providers = await mantenimientosServices.getExternalProviders();
        setExternalProviders(providers);
      }
    } catch (error) {
      console.error(`Error fetching ${type} technicians:`, error);
    }
  };

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const [maintenancesData, assetsData] = await Promise.all([
        mantenimientosServices.getMaintenances(),
        mantenimientosServices.getAvailableAssets()
      ]);
      setMaintenances(maintenancesData);
      setAssetsList(assetsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([
        fetchMaintenances(),
        fetchTechnicians('internal')
      ]);
    };

    fetchInitialData();
  }, []);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewMaintenance({
      codigo: "",
      descripcion: "",
      fechaInicio: "",
      tecnicoAsignado: "",
      tipoTecnico: "internal",
      activos: [],
    });
    setTechnicalType('internal');
  };

  const handleTechnicianTypeChange = async (event) => {
    const type = event.target.value;
    setTechnicalType(type);
    setNewMaintenance(prev => ({
      ...prev,
      tecnicoAsignado: '',
      tipoTecnico: type
    }));
    await fetchTechnicians(type);
  };

  const handleSaveMaintenance = async () => {
    if (!validateFields()) return;


    try {
      // Crear el mantenimiento
      const maintenanceResponse = await mantenimientosServices.createMaintenance({
        codigo: newMaintenance.codigo,
        descripcion: newMaintenance.descripcion,
        fecha: newMaintenance.fechaInicio,
        tecnico: newMaintenance.tecnicoAsignado,
        tipoTecnico: newMaintenance.tipoTecnico
      });

      // Si llegamos aquí, el mantenimiento se creó exitosamente
      // Actualizar estado de activos y añadirlos al mantenimiento
      await Promise.all(newMaintenance.activos.map(async (assetId) => {
        await mantenimientosServices.changeStatusAssets(assetId);
        return mantenimientosServices.addAssetsToMaintenance({
          id_act: assetId,
          id_mant_per: maintenanceResponse.id
        });
      }));

      showAlert('Mantenimiento creado exitosamente', 'success');
      await fetchMaintenances();
      handleCloseModal();
    } catch (error) {
      // Manejar el error específico de código duplicado
      if (error.code === 'ER_DUP_ENTRY') {
        showAlert('El código de mantenimiento ingresado ya existe');
      } else if (error.response && error.response.data) {
        showAlert(error.response.data.message || 'Error al crear el mantenimiento');
      } else {
        showAlert('Error al crear el mantenimiento');
      }
    }

  };

  const toggleAssetSelection = (assetId) => {
    setNewMaintenance((prev) => ({
      ...prev,
      activos: prev.activos.includes(assetId)
        ? prev.activos.filter((id) => id !== assetId)
        : [...prev.activos, assetId],
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button
        variant="contained"
        onClick={handleOpenModal}
        sx={{
          mb: 3,
          backgroundColor: theme => theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme => theme.palette.primary.dark,
          }
        }}
      >
        Crear Mantenimiento
      </Button>

      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <TextField
          label="Código"
          size="small"
          value={filterCode}
          onChange={(e) => setFilterCode(e.target.value)}
          sx={{ minWidth: '200px' }}
        />
        <TextField
          label="Técnico"
          size="small"
          value={filterTechnician}
          onChange={(e) => setFilterTechnician(e.target.value)}
          sx={{ minWidth: '200px' }}
        />
        <TextField
          label="Fecha"
          type="date"
          size="small"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: '200px' }}
        />
        <TextField
          select
          label="Estado"
          size="small"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          sx={{ minWidth: '200px' }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="En ejecucion">En ejecucion</MenuItem>
          <MenuItem value="Finalizado">Finalizado</MenuItem>
        </TextField>
      </Paper>

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>Crear Mantenimiento</DialogTitle>
        <DialogContent>
          <TextField
            label="Código"
            fullWidth
            margin="normal"
            value={newMaintenance.COD_MANT}
            onChange={(e) => setNewMaintenance({ ...newMaintenance, codigo: e.target.value })}
          />
          <TextField
            label="Descripcion"
            fullWidth
            margin="normal"
            value={newMaintenance.DESC_MANT}
            onChange={(e) => setNewMaintenance({ ...newMaintenance, descripcion: e.target.value })}
          />
          <TextField
            label="Fecha de Inicio"
            type="datetime-local"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={newMaintenance.FEC_INI_MANT}
            onChange={(e) => setNewMaintenance({ ...newMaintenance, fechaInicio: e.target.value })}
          />
          <TextField
            select
            label="Tipo de Técnico"
            fullWidth
            margin="normal"
            value={technicalType}
            onChange={handleTechnicianTypeChange}
          >
            <MenuItem value="internal">Interno</MenuItem>
            <MenuItem value="external">Externo</MenuItem>
          </TextField>
          <TextField
            select
            label="Asignado a"
            fullWidth
            margin="normal"
            value={newMaintenance.tecnicoAsignado}
            onChange={(e) => setNewMaintenance({
              ...newMaintenance,
              tecnicoAsignado: e.target.value
            })}
          >
            {technicalType === 'internal' ? (
              internalUsers.map((user) => (
                <MenuItem key={user.ID_USU} value={user.ID_USU}>
                  {user.NOM_USU}
                </MenuItem>
              ))
            ) : (
              externalProviders.map((provider) => (
                <MenuItem key={provider.ID_PRO} value={provider.ID_PRO}>
                  {provider.NOM_PRO}
                </MenuItem>
              ))
            )}
          </TextField>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Seleccionar Activos
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Seleccionar</StyledTableCell>
                  <StyledTableCell>Código</StyledTableCell>
                  <StyledTableCell>Nombre</StyledTableCell>
                  <StyledTableCell>Marca</StyledTableCell>
                  <StyledTableCell>Categoria</StyledTableCell>
                  <StyledTableCell>Ubicación</StyledTableCell>
                  <StyledTableCell>Estado</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assetsList.map((asset) => (
                  <TableRow key={asset.ID_ACT}>
                    <TableCell>
                      <Checkbox
                        checked={newMaintenance.activos.includes(asset.ID_ACT)}
                        onChange={() => toggleAssetSelection(asset.ID_ACT)}
                      />
                    </TableCell>
                    <StyledTableCell>{asset.COD_ACT}</StyledTableCell>
                    <StyledTableCell>{asset.NOM_ACT}</StyledTableCell>
                    <StyledTableCell>{asset.MAR_ACT}</StyledTableCell>
                    <StyledTableCell>{asset.CAT_ACT}</StyledTableCell>
                    <StyledTableCell>{asset.UBI_ACT}</StyledTableCell>
                    <StyledTableCell>{asset.EST_ACT}</StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSaveMaintenance}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <TableContainer
        component={Paper}
        sx={{
          mt: 2,
          boxShadow: 3,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell />
              <TableCell>Código</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Fecha de Inicio</TableCell>
              <TableCell>Técnico</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              getFilteredMaintenances().map((maintenance) => (
                <MaintenanceRow
                  key={maintenance.ID_MANT}
                  maintenance={maintenance}
                  onUpdate={fetchMaintenances}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity={alertSeverity}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExpandableTable;