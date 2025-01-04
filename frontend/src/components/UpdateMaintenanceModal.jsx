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
import { mantenimientosServices } from "../services/mantenimientosServices";

const UpdateMaintenanceModal = ({ open, onClose, maintenance, onUpdate }) => {
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
      }
    }
  }, [maintenance]);

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
          ? { ...a, toRemove: !a.toRemove }
          : a
      )
    );

    setAssetsToRemove(
      (prev) =>
        asset.toRemove
          ? prev.filter((id) => id !== validId) // Eliminar del arreglo si ya estaba seleccionado
          : [...prev, validId] // Agregar al arreglo si no estaba seleccionado
    );
  };

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
          console.log(`Activo ${assetId} eliminado del mantenimiento`);
        } else {
          console.log(
            `No se pudo eliminar el activo ${assetId} del mantenimiento`
          );
          setErrorMessage(
            `No se pudo eliminar el activo ${assetId} porque tiene actividades o componentes asociados.`
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
        a.ID_ACT === asset.ID_ACT ? { ...a, isAssociated: !a.isAssociated } : a
      )
    );

    if (!asset.isAssociated) {
      setAssetsToAdd((prev) => [...prev, asset.ID_ACT]);
    } else {
      setAssetsToAdd((prev) => prev.filter((id) => id !== asset.ID_ACT));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Actualizar Mantenimiento - {maintenance?.COD_MANT}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Descripción"
          fullWidth
          margin="normal"
          value={updatedMaintenance?.DESC_MANT || ""}
          onChange={(e) =>
            setUpdatedMaintenance({
              ...updatedMaintenance,
              DESC_MANT: e.target.value,
            })
          }
        />

        {errorMessage && (
          <Alert
            severity="error"
            sx={{ mt: 2, mb: 2 }}
            onClose={() => setErrorMessage("")}
          >
            {errorMessage}
          </Alert>
        )}
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Activos
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">Asociado</TableCell>
                <TableCell padding="checkbox">Eliminar</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Marca</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Estado</TableCell>
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
