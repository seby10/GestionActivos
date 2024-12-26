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
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { mantenimientosServices } from '../services/mantenimientosServices.js';

// Componente de fila de mantenimiento
const MaintenanceRow = ({ maintenance, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  const handleToggle = async () => {
    if (!open) {
      setLoadingAssets(true);
      try {
        const fetchedAssets = await mantenimientosServices.getMaintenanceDetails(maintenance.id);
        setAssets(fetchedAssets);
      } catch (error) {
        console.error('Error loading maintenance details:', error);
      } finally {
        setLoadingAssets(false);
      }
    }
    setOpen(!open);
  };

  const handleFinishMaintenance = async () => {
    try {
      await mantenimientosServices.finishMaintenance(maintenance.id);
      onUpdate();
    } catch (error) {
      console.error('Error finishing maintenance:', error);
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={handleToggle}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{maintenance.ID_MANT}</TableCell>
        <TableCell>{maintenance.NOM_MANT}</TableCell>
        <TableCell>{maintenance.FEC_MANT}</TableCell>
        <TableCell>{maintenance.ID_TEC_INT}</TableCell>
        <TableCell>{maintenance.tipoTecnico === 'internal' ? 'Interno' : 'Externo'}</TableCell>
        <TableCell>
          <Button onClick={handleFinishMaintenance}>Finalizar</Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                Activos
              </Typography>
              {loadingAssets ? (
                <CircularProgress />
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell>{asset.id}</TableCell>
                        <TableCell>{asset.nombre}</TableCell>
                        <TableCell>{asset.estado}</TableCell>
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
  const [newMaintenance, setNewMaintenance] = useState({
    code: "",
    name: "",
    startDate: "",
    assignedTo: "",
    typeTechnic: "internal",
    assets: [],
  });
  const [assetsList, setAssetsList] = useState([]);

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
      code: "",
      name: "",
      startDate: "",
      assignedTo: "",
      typeTechnic: "internal",
      assets: [],
    });
    setTechnicalType('internal');
  };

  const handleTechnicianTypeChange = async (event) => {
    const type = event.target.value;
    setTechnicalType(type);
    setNewMaintenance(prev => ({
      ...prev,
      assignedTo: '',
      typeTechnic: type
    }));
    await fetchTechnicians(type);
  };

  const handleSaveMaintenance = async () => {
    try {
      const maintenanceResponse = await mantenimientosServices.createMaintenance({
        codigo: newMaintenance.code,
        nombre: newMaintenance.name,
        fecha: newMaintenance.startDate,
        tecnico: newMaintenance.assignedTo,
        tipoTecnico: newMaintenance.typeTechnic
      });

      const promises = newMaintenance.assets.map(assetId =>
        mantenimientosServices.addAssetsToMaintenance({
          id_act: assetId,
          id_mant_per: maintenanceResponse.id
        })
      );

      await Promise.all(promises);
      await fetchMaintenances();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving maintenance:', error);
    }
  };

  const toggleAssetSelection = (assetId) => {
    setNewMaintenance((prev) => ({
      ...prev,
      assets: prev.assets.includes(assetId)
        ? prev.assets.filter((id) => id !== assetId)
        : [...prev.assets, assetId],
    }));
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpenModal}>
        Crear Mantenimiento
      </Button>
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>Crear Mantenimiento</DialogTitle>
        <DialogContent>
          <TextField
            label="Código"
            fullWidth
            margin="normal"
            value={newMaintenance.code}
            onChange={(e) => setNewMaintenance({ ...newMaintenance, code: e.target.value })}
          />
          <TextField
            label="Nombre"
            fullWidth
            margin="normal"
            value={newMaintenance.name}
            onChange={(e) => setNewMaintenance({ ...newMaintenance, name: e.target.value })}
          />
          <TextField
            label="Fecha de Inicio"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={newMaintenance.startDate}
            onChange={(e) => setNewMaintenance({ ...newMaintenance, startDate: e.target.value })}
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
            value={newMaintenance.assignedTo}
            onChange={(e) => setNewMaintenance({ 
              ...newMaintenance, 
              assignedTo: e.target.value
            })}
          >
            {technicalType === 'internal' ? (
              internalUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.nombre}
                </MenuItem>
              ))
            ) : (
              externalProviders.map((provider) => (
                <MenuItem key={provider.id} value={provider.id}>
                  {provider.nombre}
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
                  <TableCell>Seleccionar</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assetsList.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <Checkbox
                        checked={newMaintenance.assets.includes(asset.id)}
                        onChange={() => toggleAssetSelection(asset.id)}
                      />
                    </TableCell>
                    <TableCell>{asset.id}</TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{asset.status}</TableCell>
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

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Encargado</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              maintenances.map((maintenance) => (
                <MaintenanceRow 
                  key={maintenance.id} 
                  maintenance={maintenance} 
                  onUpdate={fetchMaintenances}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ExpandableTable;