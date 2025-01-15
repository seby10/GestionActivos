import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  styled,
} from "@mui/material";
import {
  Settings,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";

import ClearIcon from "@mui/icons-material/Clear";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ActivoModal from "./ActivoModal";
import { mantenimientosServices } from "../services/mantenimientosServices.js";
import UpdateMaintenanceModal from "../components/UpdateMaintenanceModal";
import ActivosModal from './ActivosModal';

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  "& .MuiTableCell-head": {
    color: theme.palette.common.white,
    fontWeight: "bold",
    fontSize: "1rem",
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
}));

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

// Componente de fila de mantenimiento
const MaintenanceRow = ({
  maintenance,
  onUpdate,
  showAlert,
  handleOpenUpdateModal,
}) => {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [canFinish, setCanFinish] = useState(false);
  const [finishLoading, setFinishLoading] = useState(false);
  const [activoSeleccionado, setActivoSeleccionado] = useState(null);
  const rowRef = useRef(null);
  const [invalidDates, setInvalidDates] = useState(false);

  const openActivityModal = (asset) => {
    console.log("Activo seleccionado:", asset);
    setActivoSeleccionado(asset);
  };

  const closeActivityModal = () => {
    setActivoSeleccionado(null);
    handleToggle();
  };

  const handleToggle = async () => {
    if (!open) {
      setLoadingAssets(true);
      try {
        const fetchedAssets = await mantenimientosServices.getMaintenanceDetails(
          maintenance.ID_MANT
        );
        setAssets(fetchedAssets);
        const allInMaintenance = fetchedAssets.every(
          (asset) => asset.EST_DET_MANT === "Finalizado"
        );
        setCanFinish(allInMaintenance);

        setTimeout(() => {
          if (rowRef.current) {
            rowRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }, 100);
      } catch (error) {
        console.error("Error loading maintenance details:", error);
      } finally {
        setLoadingAssets(false);
      }
    }
    setOpen(!open);
  };
  const isStartDateBeforeEndDate = () => {
    const startDate = new Date(maintenance.FEC_INI_MANT);
    const endDate = maintenance.FEC_FIN_MANT ? new Date(maintenance.FEC_FIN_MANT) : new Date();
    return startDate < endDate;
  };

  const handleFinishMaintenance = async () => {
    if (!isStartDateBeforeEndDate()) {
      setInvalidDates(true); 
      return;
    }
    setFinishLoading(true);
    try {
      await mantenimientosServices.finishMaintenance(maintenance.ID_MANT);
      onUpdate();
      localStorage.removeItem("activos");
    } catch (error) {
      console.error("Error finishing maintenance:", error);
    } finally {
      setFinishLoading(false);
    }
  };

  const getFinishButtonColor = () => {
    if (maintenance.ESTADO_MANT === "Finalizado") return "success";
    if (canFinish) return "primary";
    return "inherit";
  };

  const getFinishButtonText = () => {
    if (finishLoading) return "Finalizando...";
    if (maintenance.ESTADO_MANT === "Finalizado") return "Finalizado";
    if (!canFinish) return "Finalizar";
    return "Finalizar";
  };

  return (
    <>
      <TableRow hover>
        <StyledTableCell>
          <IconButton
            size="small"
            onClick={handleToggle}
            sx={{ transition: "transform 0.3s" }}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </StyledTableCell>
        <StyledTableCell>{maintenance.COD_MANT}</StyledTableCell>
        <StyledTableCell>{maintenance.DESC_MANT}</StyledTableCell>
        <StyledTableCell>
          {formatDate(maintenance.FEC_INI_MANT)}
        </StyledTableCell>
        <StyledTableCell>
          {formatDate(maintenance.FEC_FIN_MANT) || '-'}
        </StyledTableCell>
          <StyledTableCell>
            {maintenance.ID_TEC_INT === null
              ? maintenance.NOM_PRO
              : maintenance.NOM_USU}
          </StyledTableCell>
          <StyledTableCell>
            <Typography
              variant="body2"
              sx={{
                backgroundColor:
                  maintenance.ID_TEC_INT === null ? "#ff9800" : "#4caf50",
                color: "white",
                padding: "4px 8px",
                borderRadius: "4px",
                display: "inline-block",
              }}
            >
              {maintenance.ID_TEC_INT === null ? "Externo" : "Interno"}
            </Typography>
          </StyledTableCell>
          <StyledTableCell>
            <Typography
              variant="body2"
              sx={{
              backgroundColor:
                maintenance.ESTADO_MANT === "Finalizado"
                  ? "#4caf50"
                  : "#2196f3",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              display: "inline-block",
            }}
          >
            {maintenance.ESTADO_MANT}
          </Typography>
        </StyledTableCell>
        <StyledTableCell>
          <Button
            onClick={handleFinishMaintenance}
            disabled={
              !canFinish ||
              maintenance.ESTADO_MANT === "Finalizado" ||
              finishLoading ||
              !isStartDateBeforeEndDate() 
            }
            variant={
              maintenance.ESTADO_MANT === "Finalizado"
                ? "outlined"
                : "contained"
            }
            color={getFinishButtonColor()}
            sx={{
              minWidth: "100px",
              position: "relative",
              "&.Mui-disabled": {
                backgroundColor:
                  maintenance.ESTADO_MANT === "Finalizado"
                    ? "transparent"
                    : "#e0e0e0",
                border:
                  maintenance.ESTADO_MANT === "Finalizado"
                    ? "1px solid #4caf50"
                    : "none",
                color:
                  maintenance.ESTADO_MANT === "Finalizado"
                    ? "#4caf50"
                    : "rgba(0, 0, 0, 0.26)",
              },
            }}
          >
            {finishLoading ? (
              <CircularProgress
                size={24}
                sx={{
                  color: getFinishButtonColor(),
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: "-12px",
                  marginLeft: "-12px",
                }}
              />
            ) : null}
            {getFinishButtonText()}
          </Button>
        </StyledTableCell>
        <StyledTableCell>
          <Button
            variant="contained"
            onClick={() => handleOpenUpdateModal(maintenance)}
            disabled={maintenance.ESTADO_MANT !== "En ejecucion"}
            sx={{
              backgroundColor: (theme) => theme.palette.primary.main,
              "&:hover": {
                backgroundColor: (theme) => theme.palette.primary.dark,
              },
            }}
          >
            Actualizar
          </Button>
        </StyledTableCell>
      </TableRow>
      <TableRow ref={rowRef}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
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
                            <Settings />
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
      {activoSeleccionado && (
        <ActivoModal
          activoId={activoSeleccionado.ID_DET_MANT}
          closeModal={closeActivityModal}
          activoCodigo={activoSeleccionado.COD_ACT}
          showAlert={showAlert}
        />
      )}
    </>
  );
};

const ExpandableTable = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [technicalType, setTechnicalType] = useState("internal");
  const [internalUsers, setInternalUsers] = useState([]);
  const [externalProviders, setExternalProviders] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [newMaintenance, setNewMaintenance] = useState({
    codigo: "",
    descripcion: "",
    fechaInicio: "",
    tecnicoAsignado: "",
    tipoTecnico: "internal",
    activos: [],
  });
  const [assetsList, setAssetsList] = useState([]);
  const [filterCode, setFilterCode] = useState("");
  const [filterTechnician, setFilterTechnician] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  //const [filterType, setFilterType] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activosModalOpen, setActivosModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateError, setDateError] = useState("");

  const handleStartDateChange = (e) => {
    const startDate = e.target.value;
    if (filterEndDate && new Date(startDate) > new Date(filterEndDate)) {
      setDateError("La fecha de inicio no puede ser mayor que la fecha de fin.");
    } else {
      setDateError("");
    }
    setFilterStartDate(startDate);
  };

  const handleEndDateChange = (e) => {
    const endDate = e.target.value;
    if (filterStartDate && new Date(filterStartDate) > new Date(endDate)) {
      setDateError("La fecha de fin no puede ser menor que la fecha de inicio.");
    } else {
      setDateError("");
    }
    setFilterEndDate(endDate);
  };

  const clearAllFilters = () => {
    setFilterCode("");
    setFilterTechnician("");
    setFilterStatus("");
    setFilterStartDate("");
    setFilterEndDate("");
    setPage(0);
    setDateError("");
  };

  const resetDateFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setDateError("");
  };


  const getFilteredMaintenances = () => {
    const filtered = maintenances.filter((maintenance) => {
      // Filtro por código
      const matchCode = maintenance.COD_MANT.toLowerCase().includes(
        filterCode.toLowerCase()
      );

      // Filtro por técnico
      const matchTechnician = (maintenance.NOM_PRO || maintenance.NOM_USU || "")
        .toLowerCase()
        .includes(filterTechnician.toLowerCase());

      // Filtro por estado
      const matchStatus =
        !filterStatus ||
        maintenance.ESTADO_MANT.toLowerCase() === filterStatus.toLowerCase();

      // Filtro por fechas
      let matchDate = true;

      if (filterStartDate || filterEndDate) {
        // Asegúrate de convertir las fechas correctamente
        const maintenanceDate = new Date(maintenance.FEC_INI_MANT);
        console.log("maintenanceDate", maintenanceDate);

        if (filterStartDate) {
          const [year, month, day] = filterStartDate.split("-").map(Number);
          const startDate = new Date(year, month - 1, day, 0, 0, 0, 0); // Forzar zona horaria local
          console.log("startDate", startDate);

          if (maintenanceDate < startDate) {
            matchDate = false;
          }
        }

        if (filterEndDate && matchDate) {
          const [year, month, day] = filterEndDate.split("-").map(Number);
          const endDate = new Date(year, month - 1, day, 23, 59, 59, 999); // Forzar zona horaria local
          console.log("endDate", endDate);

          if (maintenanceDate > endDate) {
            matchDate = false;
          }
        }
      }

      return matchCode && matchTechnician && matchDate && matchStatus;
    });

    // Ordenamiento
    const sorted = filtered.sort((a, b) => {
      if (sortOrder === "asc") {
        return new Date(a.FEC_INI_MANT) - new Date(b.FEC_INI_MANT);
      } else {
        return new Date(b.FEC_INI_MANT) - new Date(a.FEC_INI_MANT);
      }
    });

    return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  const getFilteredCount = () => {
    return maintenances.filter((maintenance) => {
      const matchCode = maintenance.COD_MANT.toLowerCase().includes(
        filterCode.toLowerCase()
      );
      const matchTechnician = (maintenance.NOM_PRO || maintenance.NOM_USU || "")
        .toLowerCase()
        .includes(filterTechnician.toLowerCase());

      const matchStatus =
        !filterStatus ||
        maintenance.ESTADO_MANT.toLowerCase() === filterStatus.toLowerCase();

      let matchDate = true;

      if (filterStartDate || filterEndDate) {
        const maintenanceDate = new Date(maintenance.FEC_INI_MANT);
        
        if (filterStartDate) {
          const [year, month, day] = filterStartDate.split("-").map(Number);
          const startDate = new Date(year, month - 1, day, 0, 0, 0, 0); // Forzar zona horaria local
          if (maintenanceDate < startDate) {
            matchDate = false;
          }
        }

        if (filterEndDate && matchDate) {
          const [year, month, day] = filterEndDate.split("-").map(Number);
          const endDate = new Date(year, month - 1, day, 23, 59, 59, 999); // Forzar zona horaria local
          if (maintenanceDate > endDate) {
            matchDate = false;
          }
        }
      }

      return matchCode && matchTechnician && matchDate && matchStatus;
    }).length;
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const showAlert = (message, severity = "error") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const validateFields = () => {
    const requiredFields = {
      codigo: "Código",
      descripcion: "Descripción",
      fechaInicio: "Fecha de Inicio",
      tecnicoAsignado: "Técnico Asignado",
    };

    const emptyFields = Object.entries(requiredFields)
      .filter(([key]) => !newMaintenance[key])
      .map(([_, label]) => label);

    if (emptyFields.length > 0) {
      showAlert(
        `Por favor complete los siguientes campos: ${emptyFields.join(", ")}`
      );
      return false;
    }

    if (newMaintenance.activos.length === 0) {
      showAlert("Debe seleccionar al menos un activo");
      return false;
    }

    return true;
  };

  const fetchTechnicians = async (type) => {
    try {
      // Primero intentamos obtener los datos del localStorage
      const cachedData = localStorage.getItem(type === "internal" ? "internalUsers" : "externalProviders");
  
      if (cachedData) {
        // Si los datos están en el localStorage, los usamos
        const parsedData = JSON.parse(cachedData);
        if (type === "internal") {
          setInternalUsers(parsedData);
        } else {
          setExternalProviders(parsedData);
        }
      } else {
        // Si los datos no están en el localStorage, hacemos la llamada a la API
        let users = [];
        if (type === "internal") {
          users = await mantenimientosServices.getInternalUsers();
          setInternalUsers(users);
          localStorage.setItem("internalUsers", JSON.stringify(users)); // Guardamos en el localStorage
        } else {
          users = await mantenimientosServices.getExternalProviders();
          setExternalProviders(users);
          localStorage.setItem("externalProviders", JSON.stringify(users)); // Guardamos en el localStorage
        }
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
        mantenimientosServices.getAvailableAssets(),
      ]);
      setMaintenances(maintenancesData);
      setAssetsList(assetsData);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([fetchMaintenances(), fetchTechnicians("internal")]);
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
    setTechnicalType("internal");
  };

  const handleTechnicianTypeChange = async (event) => {
    const type = event.target.value;
    setTechnicalType(type);
    setNewMaintenance((prev) => ({
      ...prev,
      tecnicoAsignado: "",
      tipoTecnico: type,
    }));
    await fetchTechnicians(type);
  };

  const handleSaveMaintenance = async () => {
    if (!validateFields()) return;

    try {
      // Crear el mantenimiento
      const maintenanceResponse =
        await mantenimientosServices.createMaintenance({
          codigo: newMaintenance.codigo,
          descripcion: newMaintenance.descripcion,
          fecha: newMaintenance.fechaInicio,
          tecnico: newMaintenance.tecnicoAsignado,
          tipoTecnico: newMaintenance.tipoTecnico,
        });

      // Si llegamos aquí, el mantenimiento se creó exitosamente
      // Actualizar estado de activos y añadirlos al mantenimiento
      await Promise.all(
        newMaintenance.activos.map(async (assetId) => {
          await mantenimientosServices.changeStatusAssets(assetId);
          return mantenimientosServices.addAssetsToMaintenance({
            id_act: assetId,
            id_mant_per: maintenanceResponse.id,
          });
        })
      );

      showAlert("Mantenimiento creado exitosamente", "success");
      localStorage.removeItem("activos");
      await fetchMaintenances();
      handleCloseModal();
    } catch (error) {
      // Manejar el error específico de código duplicado
      if (error.code === "ER_DUP_ENTRY") {
        showAlert("El código de mantenimiento ingresado ya existe");
      } else if (error.response && error.response.data) {
        showAlert(
          error.response.data.message || "Error al crear el mantenimiento"
        );
      } else {
        showAlert("Error al crear el mantenimiento");
      }
    }
  };

  const handleOpenUpdateModal = (maintenance) => {
    setSelectedMaintenance(maintenance);
    setUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    fetchMaintenances();
    setUpdateModalOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button
        variant="contained"
        onClick={handleOpenModal}
        sx={{
          mb: 3,
          backgroundColor: (theme) => theme.palette.primary.main,
          "&:hover": {
            backgroundColor: (theme) => theme.palette.primary.dark,
          },
        }}
      >
        <i className="bi bi-plus-circle me-2"></i>Crear Mantenimiento
      </Button>

      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          label="Código"
          size="small"
          value={filterCode}
          onChange={(e) => setFilterCode(e.target.value)}
          sx={{ minWidth: "200px" }}
        />
        <TextField
          label="Técnico"
          size="small"
          value={filterTechnician}
          onChange={(e) => setFilterTechnician(e.target.value)}
          sx={{ minWidth: "200px" }}
        />
        <TextField
          select
          label="Estado"
          size="small"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          sx={{ minWidth: "200px" }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="En ejecucion">En ejecucion</MenuItem>
          <MenuItem value="Finalizado">Finalizado</MenuItem>
        </TextField>
        <TextField
          label="Fecha Inicio"
          type="date"
          size="small"
          value={filterStartDate}
          onChange={handleStartDateChange}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: filterEndDate }}
          sx={{ minWidth: "200px" }}
          error={!!dateError}
          helperText={dateError}
        />
        <TextField
          label="Fecha Fin"
          type="date"
          size="small"
          value={filterEndDate}
          onChange={handleEndDateChange}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: filterStartDate }}
          sx={{ minWidth: "200px" }}
          error={!!dateError}
          helperText={dateError}
        />
        <IconButton
          onClick={resetDateFilters}
          color="primary"
          sx={{ ml: 1 }}
        >
          <RestartAltIcon />
        </IconButton>
        <Button
          variant="outlined"
          onClick={clearAllFilters}
          startIcon={<ClearIcon />}
          sx={{
            minWidth: "150px",
            ml: "auto",
            borderColor: (theme) => theme.palette.grey[300],
            color: (theme) => theme.palette.grey[700],
            "&:hover": {
              borderColor: (theme) => theme.palette.grey[400],
              backgroundColor: (theme) => theme.palette.grey[100],
            },
          }}
        >
          Limpiar Filtros
        </Button>
      </Paper>

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Crear Mantenimiento</DialogTitle>
        <DialogContent>
          <TextField
            label="Código"
            fullWidth
            margin="normal"
            value={newMaintenance.COD_MANT}
            onChange={(e) =>
              setNewMaintenance({ ...newMaintenance, codigo: e.target.value })
            }
          />
          <TextField
            label="Descripcion"
            fullWidth
            margin="normal"
            value={newMaintenance.DESC_MANT}
            onChange={(e) =>
              setNewMaintenance({
                ...newMaintenance,
                descripcion: e.target.value,
              })
            }
          />
          <TextField
            label="Fecha de Inicio"
            type="datetime-local"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={newMaintenance.FEC_INI_MANT}
            onChange={(e) =>
              setNewMaintenance({
                ...newMaintenance,
                fechaInicio: e.target.value,
              })
            }
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
            onChange={(e) =>
              setNewMaintenance({
                ...newMaintenance,
                tecnicoAsignado: e.target.value,
              })
            }
          >
            {technicalType === "internal"
              ? internalUsers.map((user) => (
                <MenuItem key={user.ID_USU} value={user.ID_USU}>
                  {user.NOM_USU}
                </MenuItem>
              ))
              : externalProviders.map((provider) => (
                <MenuItem key={provider.ID_PRO} value={provider.ID_PRO}>
                  {provider.NOM_PRO}
                </MenuItem>
              ))}
          </TextField>

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Activos Seleccionados: {newMaintenance.activos.length}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setActivosModalOpen(true)}
              sx={{ mt: 1 }}
            >
              Agregar Activos
            </Button>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ marginBottom: "20px", marginTop: "20px", marginLeft: "20px" }}
        >
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveMaintenance}>
            Guardar
          </Button>
        </DialogActions>
        <ActivosModal
          open={activosModalOpen}
          onClose={() => setActivosModalOpen(false)}
          assetsList={assetsList}
          selectedAssets={newMaintenance.activos}
          onAssetsSelected={(selected) => {
            setNewMaintenance(prev => ({
              ...prev,
              activos: selected
            }));
            setActivosModalOpen(false);
          }}
        />
      </Dialog>

      <Paper
        sx={{
          mt: 2,
          boxShadow: 3,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell />
                <TableCell>Código</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell onClick={toggleSortOrder} style={{ cursor: "pointer" }}>
                  Fecha Inicio {sortOrder === "asc" ? "▲" : "▼"}
                </TableCell>
                <TableCell >Fecha Fin</TableCell>
                <TableCell>Técnico</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                getFilteredMaintenances().map((maintenance) => (
                  <MaintenanceRow
                    key={maintenance.ID_MANT}
                    maintenance={maintenance}
                    onUpdate={fetchMaintenances}
                    showAlert={showAlert}
                    handleOpenUpdateModal={handleOpenUpdateModal}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box
          sx={{
            borderTop: "1px solid rgba(224, 224, 224, 1)",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            width: "100%",
          }}
        >
          <TablePagination
            component="div"
            rowsPerPageOptions={[5, 10, 25]}
            count={getFilteredCount()}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
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
        </Box>
        <UpdateMaintenanceModal
          open={updateModalOpen}
          onClose={handleCloseUpdateModal}
          maintenance={selectedMaintenance}
          onUpdate={fetchMaintenances}
          showAlert={showAlert}
        />
        <Snackbar
          open={alertOpen}
          autoHideDuration={6000}
          onClose={() => setAlertOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setAlertOpen(false)}
            severity={alertSeverity}
            sx={{ width: "100%" }}
            elevation={6}
            variant="filled"
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default ExpandableTable;
