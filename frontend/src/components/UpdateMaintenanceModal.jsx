import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  MenuItem,
} from "@mui/material";
import { mantenimientosServices } from "../services/mantenimientosServices";
import ActivosModal from './ActivosModal';

const UpdateMaintenanceModal = ({ open, onClose, maintenance, onUpdate, showAlert }) => {
  const [updatedMaintenance, setUpdatedMaintenance] = useState(maintenance);
  const [technicalType, setTechnicalType] = useState(maintenance?.ID_TEC_INT ? 'internal' : 'external');
  const [assets, setAssets] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [activosModalOpen, setActivosModalOpen] = useState(false);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [pendingChanges, setPendingChanges] = useState({
    addedAssets: [],
    removedAssets: [],
  });
  const [internalUsers, setInternalUsers] = useState([]);
  const [externalProviders, setExternalProviders] = useState([]);
  const [initialMaintenanceState, setInitialMaintenanceState] = useState(maintenance);

  const fetchAvailableAssets = useCallback(async () => {
    try {
      const assets = await mantenimientosServices.getAvailableAssets();
      setAvailableAssets(assets);
    } catch (error) {
      console.error("Error fetching available assets:", error);
      setErrorMessage("Error fetching available assets");
    }
  }, []);

  const handleSelectChange = (event) => {
    const value = event.target.value;
    setTechnicalType(value);
    setUpdatedMaintenance({
      ...updatedMaintenance,
      ID_TEC_INT: value === 'internal' ? 1 : null,
      ID_TEC_EXT: value === 'external' ? 1 : null,
      NOM_USU: '',
      NOM_PRO: '',
    });
    fetchTechnicians(value);
  };

  const fetchAssetsForMaintenance = useCallback(async () => {
    if (maintenance) {
      try {
        const associatedAssets = await mantenimientosServices.getMaintenanceDetails(maintenance.ID_MANT);
        setAssets(associatedAssets.map(asset => ({
          ...asset,
          isAssociated: true,
          ID_ACT: asset.ID_ACT_MANT,
          maintenanceDetails: {
            ID_MANT_ASO: asset.ID_MANT_ASO,
            EST_DET_MANT: asset.EST_DET_MANT,
            created_at: asset.created_at,
          },
        })));
      } catch (error) {
        console.error("Error fetching assets:", error);
        setErrorMessage("Error fetching assets");
        showAlert("Error en la actualización.", "error");
      }
    }
  }, [maintenance, showAlert]);

  const fetchTechnicians = async (type) => {
    try {
      if (type === 'internal') {
        const users = await mantenimientosServices.getInternalUsers();
        setInternalUsers(users);
        setExternalProviders([]);
      } else {
        const providers = await mantenimientosServices.getExternalProviders();
        setExternalProviders(providers);
        setInternalUsers([]);
      }
    } catch (error) {
      console.error(`Error fetching ${type} technicians:`, error);
      showAlert(`Error fetching ${type} technicians`, 'error');
    }
  };

  useEffect(() => {
    if (open && maintenance) {
      setUpdatedMaintenance(maintenance);
      fetchAssetsForMaintenance();
      fetchAvailableAssets();
      setTechnicalType(maintenance.ID_TEC_INT ? 'internal' : 'external');
      fetchTechnicians(maintenance.ID_TEC_INT ? 'internal' : 'external');
      setInitialMaintenanceState(maintenance); // Save initial state for comparison
    }
  }, [open, maintenance, fetchAssetsForMaintenance, fetchAvailableAssets]);

  useEffect(() => {
    if (!open) {
      setUpdatedMaintenance(maintenance);
      setTechnicalType(maintenance?.ID_TEC_INT ? 'internal' : 'external');
      setAssets([]);
      setAvailableAssets([]);
      setPendingChanges({
        addedAssets: [],
        removedAssets: [],
      });
      setInternalUsers([]);
      setExternalProviders([]);
    }
  }, [open, maintenance]);

  const handleUpdate = async () => {
    try {
      for (const assetId of pendingChanges.removedAssets) {
        const canRemove = await mantenimientosServices.canRemoveAssetFromMaintenance(maintenance.ID_MANT, assetId);
        if (!canRemove) {
          const asset = assets.find(a => a.ID_ACT === assetId);
          const assetCode = asset ? asset.COD_ACT : assetId;
          setErrorMessage(`No se pudo eliminar el activo ${assetCode} porque tiene actividades o componentes asociados.`);
          showAlert(`No se pudo eliminar el activo ${assetCode} porque tiene actividades o componentes asociados.`, "error");
          return;
        }
      }

      const updatedMaintenanceData = {
        id: maintenance.ID_MANT,
        DESC_MANT: updatedMaintenance.DESC_MANT,
        FEC_INI_MANT: updatedMaintenance.FEC_INI_MANT,
        ID_TEC_INT: technicalType === 'internal' ? updatedMaintenance.ID_TEC_INT : null,
        ID_TEC_EXT: technicalType === 'external' ? updatedMaintenance.ID_TEC_EXT : null
      };

      await mantenimientosServices.updateMaintenance(maintenance.ID_MANT, updatedMaintenanceData);

      for (const assetId of pendingChanges.addedAssets) {
        await mantenimientosServices.addAssetsToMaintenance({
          id_act: assetId,
          id_mant_per: maintenance.ID_MANT,
        });
        await mantenimientosServices.changeStatusAssets(assetId);
      }

      for (const assetId of pendingChanges.removedAssets) {
        await mantenimientosServices.removeAssetFromMaintenance(maintenance.ID_MANT, assetId);
        await mantenimientosServices.changeStatusAssetsD(assetId);
      }

      showAlert("Mantenimiento actualizado exitosamente", "success");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating maintenance:", error);
      setErrorMessage("Error updating maintenance");
      showAlert("Error en la actualización", "error");
    }
  };

  const handleOpenActivosModal = () => {
    setActivosModalOpen(true);
  };

  const handleCloseActivosModal = () => {
    setActivosModalOpen(false);
  };

  const handleAssetSelection = (selectedAssets, assetsToDelete) => {
    setPendingChanges({
      addedAssets: selectedAssets.filter(id => !assets.some(asset => asset.ID_ACT === id)),
      removedAssets: assetsToDelete,
    });
  };

  const hasChanges = () => {
    if (!updatedMaintenance || !initialMaintenanceState) {
      return false;
    }
    return (
      updatedMaintenance.DESC_MANT !== initialMaintenanceState.DESC_MANT ||
      updatedMaintenance.FEC_INI_MANT !== initialMaintenanceState.FEC_INI_MANT ||
      updatedMaintenance.ID_TEC_INT !== initialMaintenanceState.ID_TEC_INT ||
      updatedMaintenance.ID_TEC_EXT !== initialMaintenanceState.ID_TEC_EXT ||
      pendingChanges.addedAssets.length > 0 ||
      pendingChanges.removedAssets.length > 0
    );
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Actualizar Mantenimiento - {updatedMaintenance?.COD_MANT}</DialogTitle>
      <DialogContent>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <TextField
          label="Descripción"
          fullWidth
          margin="normal"
          value={updatedMaintenance?.DESC_MANT || ''}
          onChange={(e) => setUpdatedMaintenance({ ...updatedMaintenance, DESC_MANT: e.target.value })}
        />
        <TextField
          label="Tipo de Técnico"
          fullWidth
          margin="normal"
          select
          value={technicalType}
          onChange={handleSelectChange}
        >
          <MenuItem value="internal">Interno</MenuItem>
          <MenuItem value="external">Externo</MenuItem>
        </TextField>
        {technicalType === 'internal' ? (
          <TextField
            label="Nombre del Técnico"
            fullWidth
            margin="normal"
            select
            value={updatedMaintenance?.ID_TEC_INT || ''}
            onChange={(e) => setUpdatedMaintenance({ ...updatedMaintenance, ID_TEC_INT: e.target.value })}
          >
            {internalUsers.map((user) => (
              <MenuItem key={user.ID_USU} value={user.ID_USU}>
                {user.NOM_USU}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <TextField
            label="Proveedor"
            fullWidth
            margin="normal"
            select
            value={updatedMaintenance?.ID_TEC_EXT || ''}
            onChange={(e) => setUpdatedMaintenance({ ...updatedMaintenance, ID_TEC_EXT: e.target.value })}
          >
            {externalProviders.map((provider) => (
              <MenuItem key={provider.ID_PRO} value={provider.ID_PRO}>
                {provider.NOM_PRO}
              </MenuItem>
            ))}
          </TextField>
        )}
        <TextField
          label="Fecha de Inicio"
          type="datetime-local"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={updatedMaintenance?.FEC_INI_MANT ? updatedMaintenance.FEC_INI_MANT.slice(0, 16) : ''}
          onChange={(e) => setUpdatedMaintenance({ ...updatedMaintenance, FEC_INI_MANT: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleOpenActivosModal} color="primary">
          Gestionar Activos
        </Button>
        <Button onClick={handleUpdate} color="primary" disabled={!hasChanges()}>
          Actualizar
        </Button>
      </DialogActions>
      <ActivosModal
        open={activosModalOpen}
        onClose={handleCloseActivosModal}
        assetsList={[...assets, ...availableAssets]}
        selectedAssets={assets.map(asset => asset.ID_ACT)}
        onAssetsSelected={handleAssetSelection}
        isGestionar={true}
      />
    </Dialog>
  );
};

export default UpdateMaintenanceModal;
