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
  FormControlLabel,
  Paper,
  Divider,
  styled,
  MenuItem,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Visibility,
} from "@mui/icons-material";

const ExpandableTable = () => {
  const [maintenances, setMaintenances] = useState([]); // Lista de mantenimientos
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false); // Control del modal para crear mantenimiento
  const [activityModal, setActivityModal] = useState({
    open: false,
    asset: null,
  }); // Modal de actividades y componentes
  const [editModal, setEditModal] = useState({
    open: false,
    asset: null,
  });
  const [newMaintenance, setNewMaintenance] = useState({
    name: "",
    date: "",
    assets: [],
  }); // Datos del nuevo mantenimiento
  const [assetsList, setAssetsList] = useState([]); // Lista de activos disponibles
  const [activitiesList, setActivitiesList] = useState([]); // Lista de actividades disponibles
  const [componentsList, setComponentsList] = useState([]); // Lista de componentes disponibles

  useEffect(() => {
    // Simulando datos estáticos para los mantenimientos
    const staticMaintenances = [
      {
        id: 1,
        name: "Mantenimiento Preventivo",
        date: "2024-01-15",
        encargado: "Miguel Lopez",
      },
      {
        id: 2,
        name: "Mantenimiento Correctivo",
        date: "2024-02-20",
        encargado: "Javier Martinez",
      },
      {
        id: 3,
        name: "Inspección General",
        date: "2024-03-05",
        encargado: "Pedro Sanchez",
      },
    ];
    setMaintenances(staticMaintenances);
    setLoading(false);

    // Simulando datos estáticos para los activos disponibles
    const staticAssetsList = [
      {
        id: 101,
        name: "Proyector",
        brand: "Dell",
        category: "Tecnología",
        location: "Laboratorio B",
        status: "En Mantenimiento",
      },
      {
        id: 102,
        name: "Impresora",
        brand: "Canon",
        category: "Oficina",
        location: "Laboratorio C",
        status: "En Mantenimiento",
      },
      {
        id: 201,
        name: "Cortadora de Papel",
        brand: "Lenovo",
        category: "Oficina",
        location: "Laboratorio A",
        status: "Disponible",
      },
      {
        id: 301,
        name: "Lámpara de Piso",
        brand: "Lámpara de diseño moderno",
        category: "Decoración",
        location: "Aula 1",
        status: "Disponible",
      },
      {
        id: 302,
        name: "Silla Ergonómica",
        brand: "Silla ergonómica para oficina",
        category: "Mobiliario",
        location: "Aula 2",
        status: "Disponible",
      },
    ];
    setAssetsList(staticAssetsList);

    // Simulando datos estáticos para actividades y componentes
    const staticActivities = [
      { id: 1, name: "Revisión de filtros" },
      { id: 2, name: "Lubricación" },
      { id: 3, name: "Cambio de aceite" },
      { id: 4, name: "Formateo de disco duro" },
      { id: 5, name: "Actualización de RAM" },
      { id: 6, name: "Reemplazo de CPU" },
    ];
    const staticComponents = [
      { id: 101, name: "Filtro de aire" },
      { id: 102, name: "Aceite lubricante" },
      { id: 103, name: "Correa de transmisión" },
      { id: 104, name: "Disco duro SSD" },
      { id: 105, name: "Memoria RAM DDR4" },
      { id: 106, name: "Procesador Intel i7" },
    ];
    setActivitiesList(staticActivities);
    setComponentsList(staticComponents);
  }, []);

  const fetchAssets = async (maintenanceId) => {
    // Simulando datos estáticos para los activos asociados
    const staticAssets = {
      1: [
        {
          id: 101,
          name: "Proyector",
          brand: "Dell",
          category: "Tecnología",
          location: "Laboratorio B",
          status: "Disponible",
        },
        {
          id: 102,
          name: "Impresora",
          brand: "Canon",
          category: "Oficina",
          location: "Laboratorio C",
          status: "Disponible",
        },
      ],
      2: [
        {
          id: 201,
          name: "Cortadora de Papel",
          brand: "Lenovo",
          category: "Oficina",
          location: "Laboratorio A",
          status: "Disponible",
        },
      ],
      3: [
        {
          id: 301,
          name: "Lámpara de Piso",
          brand: "Lámpara de diseño moderno",
          category: "Decoración",
          location: "Aula 1",
          status: "Disponible",
        },
        {
          id: 302,
          name: "Silla Ergonómica",
          brand: "Silla ergonómica para oficina",
          category: "Mobiliario",
          location: "Aula 2",
          status: "Disponible",
        },
      ],
    };
    return staticAssets[maintenanceId] || [];
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewMaintenance({ name: "", date: "", assets: [] });
  };

  const handleSaveMaintenance = () => {
    // Simular guardar el nuevo mantenimiento
    const newId = maintenances.length + 1;
    const newMaintenanceData = { id: newId, ...newMaintenance };
    setMaintenances([...maintenances, newMaintenanceData]);
    handleCloseModal();
  };

  const toggleAssetSelection = (assetId) => {
    setNewMaintenance((prev) => {
      const isSelected = prev.assets.includes(assetId);
      return {
        ...prev,
        assets: isSelected
          ? prev.assets.filter((id) => id !== assetId)
          : [...prev.assets, assetId],
      };
    });
  };

  const openActivityModal = (asset) => {
    setActivityModal({ open: true, asset });
  };

  const closeActivityModal = () => {
    setActivityModal({ open: false, asset: null });
  };

  const openEditModal = (asset) => {
    setEditModal({ open: true, asset });
  };

  const closeEditModal = () => {
    setEditModal({ open: false, asset: null });
  };

  const MaintenanceRow = ({ maintenance }) => {
    const [open, setOpen] = useState(false);
    const [assets, setAssets] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(false);

    const handleToggle = async () => {
      if (!open) {
        setLoadingAssets(true);
        const fetchedAssets = await fetchAssets(maintenance.id);
        setAssets(fetchedAssets);
        setLoadingAssets(false);
      }
      setOpen(!open);
    };

    return (
      <>
        <TableRow hover>
          <TableCell>
            <IconButton size="small" onClick={handleToggle}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
          <TableCell>{maintenance.id}</TableCell>
          <TableCell>{maintenance.name}</TableCell>
          <TableCell>{maintenance.date}</TableCell>
          <TableCell>{maintenance.encargado}</TableCell>
          <TableCell>
            <IconButton
              color="primary"
              onClick={() => openEditModal(maintenance)}
            >
              <Visibility />
            </IconButton>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box
                margin={1}
                p={2}
                border={1}
                borderColor="grey.300"
                borderRadius={2}
              >
                <Typography variant="h6" gutterBottom>
                  Activos Asociados
                </Typography>
                {loadingAssets ? (
                  <CircularProgress size={24} />
                ) : assets.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Marca</TableCell>
                        <TableCell>Categoría</TableCell>
                        <TableCell>Ubicación</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell>{asset.id}</TableCell>
                          <TableCell>{asset.name}</TableCell>
                          <TableCell>{asset.brand}</TableCell>
                          <TableCell>{asset.category}</TableCell>
                          <TableCell>{asset.location}</TableCell>
                          <TableCell>{asset.status}</TableCell>
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
                ) : (
                  <Typography variant="body2">
                    No hay activos asociados.
                  </Typography>
                )}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  return (
    <>
      {/* Botón para crear mantenimiento */}
      <div
        style={{
          marginBottom: "16px",
          paddingLeft: "30px",
          paddingTop: "50px",
        }}
      >
        <button
          className="btn btn-primary"
          onClick={handleOpenModal}
          style={{ width: "auto" }}
        >
          Crear Mantenimiento
        </button>
      </div>
      {/* Sección de filtros */}
      <div
        className="filters-section"
        style={{
          marginBottom: "16px",
          padding: "16px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <div className="d-flex flex-wrap gap-3">
          <div>
            <input
              id="filter-code"
              className="form-control"
              type="text"
              placeholder="Código"
              onChange={(e) => setFilterCode(e.target.value)}
            />
          </div>
          <div>
            <input
              id="filter-provider"
              className="form-control"
              type="text"
              placeholder="Técnico"
              onChange={(e) => setFilterProvider(e.target.value)}
            />
          </div>
          <div>
            <input
              id="filter-date"
              className="form-control"
              type="date"
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div>
            <select
              id="filter-status"
              className="form-control"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Seleccionar estado</option>
              <option value="pendiente">Pendiente</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Crear Mantenimiento</DialogTitle>
        <DialogContent>
          {/* Código del mantenimiento */}
          <TextField
            fullWidth
            label="Código"
            margin="normal"
            value={newMaintenance.code}
            onChange={(e) =>
              setNewMaintenance({ ...newMaintenance, code: e.target.value })
            }
          />
          {/* Nombre del mantenimiento */}
          <TextField
            fullWidth
            label="Nombre del Mantenimiento"
            margin="normal"
            value={newMaintenance.name}
            onChange={(e) =>
              setNewMaintenance({ ...newMaintenance, name: e.target.value })
            }
          />
          {/* Fecha de inicio */}
          <TextField
            fullWidth
            label="Fecha de Inicio"
            type="date"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={newMaintenance.startDate}
            onChange={(e) =>
              setNewMaintenance({
                ...newMaintenance,
                startDate: e.target.value,
              })
            }
          />
          {/* Encargado */}
          <TextField
            fullWidth
            select
            label="Encargado"
            margin="normal"
            value={newMaintenance.assignedTo}
            onChange={(e) =>
              setNewMaintenance({
                ...newMaintenance,
                assignedTo: e.target.value,
              })
            }
          >
            <MenuItem value="encargado1">Encargado 1</MenuItem>
            <MenuItem value="encargado2">Encargado 2</MenuItem>
            <MenuItem value="encargado3">Encargado 3</MenuItem>
          </TextField>
          {/* Tabla para seleccionar activos */}
          <Typography variant="h6" gutterBottom style={{ marginTop: "16px" }}>
            Seleccionar Activos
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Ubicación</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assetsList.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={newMaintenance.assets.includes(asset.id)}
                        onChange={() => toggleAssetSelection(asset.id)}
                      />
                    </TableCell>
                    <TableCell>{asset.id}</TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{asset.status}</TableCell>
                    <TableCell>{asset.category}</TableCell>
                    <TableCell>{asset.location}</TableCell>
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
      <Dialog open={editModal.open} onClose={handleCloseModal}>
        <DialogTitle>Editar Activos en Mantenimiento</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom style={{ marginTop: "16px" }}>
            Activos
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Ubicación</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assetsList.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={newMaintenance.assets.includes(asset.id)}
                        onChange={() => toggleAssetSelection(asset.id)}
                      />
                    </TableCell>
                    <TableCell>{asset.id}</TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{asset.status}</TableCell>
                    <TableCell>{asset.category}</TableCell>
                    <TableCell>{asset.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditModal}>Cancelar</Button>
          <Button onClick={handleSaveMaintenance}>Guardar</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={activityModal.open}
        onClose={closeActivityModal}
        fullWidth
        
      >
        <DialogTitle>Actividades para {activityModal.asset?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Actividades
          </Typography>
          <ul>
            {[
              { id: 1, name: "Revisión de filtros" },
              { id: 2, name: "Lubricación" },
              { id: 3, name: "Cambio de aceite" },
              { id: 4, name: "Formateo de disco duro" },
              { id: 5, name: "Actualización de RAM" },
              { id: 6, name: "Reemplazo de CPU" },
            ].map((activity) => (
              <li key={activity.id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        activityModal.asset?.activities?.includes(
                          activity.id
                        ) || false
                      }
                      onChange={() =>
                        console.log(
                          "Toggle actividad ${activity.name} para el activo ${activityModal.asset?.id"
                        )
                      }
                    />
                  }
                  label={activity.name}
                />
              </li>
            ))}
          </ul>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Componentes
          </Typography>
          <ul>
            {[
              { id: 101, name: "Filtro de aire" },
              { id: 102, name: "Aceite lubricante" },
              { id: 103, name: "Correa de transmisión" },
              { id: 104, name: "Disco duro SSD" },
              { id: 105, name: "Memoria RAM DDR4" },
              { id: 106, name: "Procesador Intel i7" },
            ].map((component) => (
              <li key={component.id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        activityModal.asset?.components?.includes(
                          component.id
                        ) || false
                      }
                      onChange={() =>
                        console.log(
                          "Toggle componente ${component.name} para el activo ${activityModal.asset?.id"
                        )
                      }
                    />
                  }
                  label={component.name}
                />
              </li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActivityModal} color="secondary">
            Cerrar
          </Button>
          <Button
            onClick={() =>
              console.log("Guardar cambios en actividades/componentes")
            }
            color="primary"
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Encargado</TableCell>
              <TableCell>Gestionar Activos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              maintenances.map((maintenance) => (
                <MaintenanceRow
                  key={maintenance.id}
                  maintenance={maintenance}
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
