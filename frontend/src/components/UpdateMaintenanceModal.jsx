import React, { useState, useEffect, useCallback } from "react";
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
  Checkbox,
  Paper,
  Typography,
  Alert,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { mantenimientosServices } from "../services/mantenimientosServices";

const UpdateMaintenanceModal = ({
  open,
  onClose,
  maintenance,
  onUpdate,
  showAlert,
}) => {
  const [updatedMaintenance, setUpdatedMaintenance] = useState(maintenance);
  const [assets, setAssets] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [assetsToRemove, setAssetsToRemove] = useState([]);
  const [assetsToAdd, setAssetsToAdd] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  const fetchAssetsForAdding = useCallback(async () => {
    if (maintenance) {
      try {
        const associatedAssets =
          await mantenimientosServices.getMaintenanceDetails(
            maintenance.ID_MANT
          );
        const availableAssets =
          await mantenimientosServices.getAvailableAssets();

        const combinedAssets = [
          ...associatedAssets.map((asset) => ({
            ...asset,
            isAssociated: true,
            canRemove: false,
            toRemove: false,
            isSelected: false,
          })),
          ...availableAssets
            .filter(
              (asset) =>
                !associatedAssets.some((a) => a.ID_ACT === asset.ID_ACT)
            )
            .map((asset) => ({
              ...asset,
              isAssociated: false,
              canRemove: true,
              toRemove: false,
              isSelected: false,
            })),
        ];

        setAssets(combinedAssets);
      } catch (error) {
        console.error("Error fetching assets:", error);
        setErrorMessage("Error fetching assets");
        showAlert("Error en la actualización", "error");
      }
    }
  }, [maintenance]);

  const fetchAssetsForRemoving = useCallback(async () => {
    if (maintenance) {
      try {
        const associatedAssets =
          await mantenimientosServices.getMaintenanceDetails(
            maintenance.ID_MANT
          );
        const availableAssets =
          await mantenimientosServices.getAvailableAssets();

        const combinedAssets = [
          ...associatedAssets.map((asset) => ({
            ...asset,
            isAssociated: true,
            canRemove: true,
            toRemove: false,
            ID_ACT: asset.ID_ACT_MANT,
            maintenanceDetails: {
              ID_MANT_ASO: asset.ID_MANT_ASO,
              EST_DET_MANT: asset.EST_DET_MANT,
              created_at: asset.created_at,
            },
          })),
          ...availableAssets.map((asset) => ({
            ...asset,
            isAssociated: false,
            canRemove: false,
            toRemove: false,
            ID_ACT: asset.ID_ACT,
            maintenanceDetails: null,
          })),
        ];

        setAssets(combinedAssets);
      } catch (error) {
        console.error("Error fetching assets:", error);
        setErrorMessage("Error fetching assets");
        showAlert("Error en la actualización.", "success");
      }
    }
  }, [maintenance]);
  const handleUpdate = async () => {
    if (assetsToAdd.length > 0) {
      console.log("Activos añadidos:", assetsToAdd);
      for (const assetId of assetsToAdd) {
        await mantenimientosServices.changeStatusAssets(assetId);
        await mantenimientosServices.addAssetsToMaintenance({
          id_act: assetId,
          id_mant_per: maintenance.ID_MANT,
        });
        console.log(`Activo ${assetId} añadido al mantenimiento`);
      }
    }

    if (assetsToRemove.length > 0) {
      console.log("Activos eliminados:", assetsToRemove);

      for (const assetId of assetsToRemove) {
        const canRemove =
          await mantenimientosServices.canRemoveAssetFromMaintenance(
            maintenance.ID_MANT,
            [assetId] // Pasar como array de un solo elemento si el servicio lo requiere
          );

        if (canRemove) {
          await mantenimientosServices.removeAssetFromMaintenance(
            maintenance.ID_MANT,
            [assetId] // Pasar como array de un solo elemento si el servicio lo requiere
          );
          await mantenimientosServices.changeStatusAssetsD([assetId]); // Cambiar el estado de este activo
          showAlert(`Cambios Guardados`, "success");
          console.log(`Activo ${assetId} eliminado del mantenimiento`);
        } else {
          const asset = assets.find(
            (a) => a.ID_ACT === assetId || a.ID_ACT_MANT === assetId
          );
          const assetCode = asset ? asset.COD_ACT : assetId; // Si no se encuentra el activo, usar el ID por defecto
          console.log(
            `No se pudo eliminar el activo ${assetCode} del mantenimiento`
          );
          setErrorMessage(
            `No se pudo eliminar el activo ${assetCode} porque tiene actividades o componentes asociados.`
          );
          showAlert(
            `No se pudo eliminar el activo ${assetCode} porque tiene actividades o componentes asociados.`,
            "error"
          );
        }
      }
    }

    setAssetsToAdd([]);
    setAssetsToRemove([]);

    onClose();
  };

  useEffect(() => {
    if (open && maintenance) {
      setUpdatedMaintenance(maintenance);
      fetchAssetsForRemoving();
      fetchAssetsForAdding();
      setAssetsToRemove([]);
      setAssetsToAdd([]);
    }
  }, [open, maintenance]);

  const handleAssetToggle = (asset) => {
    setAssets((prevAssets) =>
      prevAssets.map((a) =>
        a.ID_ACT === asset.ID_ACT
          ? {
              ...a,
              isAssociated: !a.isAssociated,
              toRemove: false, // Desmarcar eliminar si se selecciona asociado
            }
          : a
      )
    );

    if (!asset.isAssociated) {
      setAssetsToAdd((prev) => [...prev, asset.ID_ACT]);
    } else {
      setAssetsToAdd((prev) => prev.filter((id) => id !== asset.ID_ACT));
    }
  };

  const handleRemoveToggle = (asset) => {
    const validId = asset.ID_ACT || asset.ID_ACT_MANT;
    if (!validId) {
      console.error("Error: Asset does not have a valid ID_ACT or ID_ACT_MANT");
      setErrorMessage(
        `El activo no tiene un ID_ACT o ID_ACT_MANT válido: ${validId}`
      );
      return;
    }

    setAssets((prevAssets) =>
      prevAssets.map((a) =>
        a.ID_ACT === validId || a.ID_ACT_MANT === validId
          ? {
              ...a,
              toRemove: !a.toRemove,
              isAssociated: false,
            }
          : a
      )
    );

    setAssetsToRemove((prev) =>
      asset.toRemove ? prev.filter((id) => id !== validId) : [...prev, validId]
    );
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Actualizar Mantenimiento - {maintenance?.COD_MANT}
      </DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Activos
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#1976d2", color: "white" }}>
              <TableRow>
                <TableCell
                  padding="checkbox"
                  sx={{ color: "white", textAlign: "center" }}
                >
                  <CheckCircleIcon />
                </TableCell>
                <TableCell
                  padding="checkbox"
                  sx={{ color: "white", textAlign: "center" }}
                >
                  <CancelIcon />
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Código
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Nombre
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Marca
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Categoría
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Ubicación
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Estado
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.map((asset) => {
                const isSelected = selectedAssetId === asset.ID_ACT;
                return (
                  <TableRow key={asset.ID_ACT}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={asset.isAssociated}
                        onChange={() => handleAssetToggle(asset)}
                        color="primary"
                        disabled={
                          asset.isAssociated ||
                          asset.EST_DET_MANT === "Finalizado"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={asset.toRemove}
                        onChange={() => handleRemoveToggle(asset)}
                        color="primary"
                        disabled={!asset.isAssociated}
                      />
                    </TableCell>
                    <TableCell>{asset.COD_ACT}</TableCell>
                    <TableCell>{asset.NOM_ACT}</TableCell>
                    <TableCell>{asset.MAR_ACT}</TableCell>
                    <TableCell>{asset.CAT_ACT}</TableCell>
                    <TableCell>{asset.UBI_ACT}</TableCell>
                    <TableCell>{asset.EST_ACT}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleUpdate} color="primary">
          Actualizar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateMaintenanceModal;
