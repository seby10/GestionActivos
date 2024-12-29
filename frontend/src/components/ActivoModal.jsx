import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { Modal, Box, Button, Typography, Alert } from "@mui/material";

const ActivoModal = ({ activoId, closeModal, activoCodigo, showAlert }) => {
  const [actividades, setActividades] = useState([]);
  const [componentes, setComponentes] = useState([]);
  const [selectedActividades, setSelectedActividades] = useState([]);
  const [selectedComponentes, setSelectedComponentes] = useState([]);
  const [estadoMantenimiento, setEstadoMantenimiento] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3000/api/activos/getData/${activoId}`
        );
        console.log(data);

        setActividades(
          (data.actividades || []).map((a) => ({
            value: a.id,
            label: a.descripcion,
            seleccionado: a.seleccionado,
          }))
        );

        setComponentes(
          (data.componentes || []).map((c) => ({
            value: c.id,
            label: c.descripcion,
            seleccionado: c.seleccionado,
          }))
        );

        setSelectedActividades(
          data.actividades
            .filter((a) => a.seleccionado)
            .map((a) => ({ value: a.id, label: a.descripcion }))
        );
        setSelectedComponentes(
          data.componentes
            .filter((c) => c.seleccionado)
            .map((c) => ({ value: c.id, label: c.descripcion }))
        );

        setEstadoMantenimiento(data.estadoMantenimiento);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [activoId]);

  const handleSave = async () => {
    const actividadesSeleccionadas = selectedActividades.map((a) => a.value);
    const componentesSeleccionados = selectedComponentes.map((c) => c.value);

    await axios.post(`http://localhost:3000/api/activos/update/${activoId}`, {
      actividadesSeleccionadas,
      componentesSeleccionados,
    });
    closeModal();
    showAlert("Cambios guardados", "success");
  };

  const handleFinishMaintenance = async () => {
    const actividadesSeleccionadas = selectedActividades.map((a) => a.value);
    const componentesSeleccionados = selectedComponentes.map((c) => c.value);

    // Validación: Al menos una actividad o componente debe estar seleccionado
    if (
      actividadesSeleccionadas.length === 0 &&
      componentesSeleccionados.length === 0
    ) {
      setErrorMessage(
        "Debe agregar al menos una actividad o componente antes de finalizar el mantenimiento."
      );
      return;
    }

    try {
      await axios.post(`http://localhost:3000/api/activos/update/${activoId}`, {
        actividadesSeleccionadas,
        componentesSeleccionados,
      });

      await axios.put(
        `http://localhost:3000/api/mantenimientos/${activoId}/finalizarAct`,
        {
          nuevoEstado: "Finalizado",
        }
      );

      closeModal();
      showAlert("Mantenimiento de activo terminado", "success");
    } catch (error) {
      console.error("Error al finalizar el mantenimiento:", error);
    }
  };

  return (
    <Modal open onClose={closeModal}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxWidth: "900px",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          height: "auto",
          maxHeight: "80vh",
          overflowY: "auto",
          zIndex: 1200,
        }}
      >
        <h2 style={{ fontSize: "1.5rem", marginBottom: "20px" }}>
          Activo {activoCodigo}
        </h2>

        <div>
          <h3
            style={{
              fontSize: "1.2rem",
              marginBottom: "10px",
              marginTop: "10px",
            }}
          >
            Actividades
          </h3>
          <Select
            isMulti
            options={actividades}
            value={selectedActividades}
            onChange={setSelectedActividades}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              container: (provided) => ({
                ...provided,
                width: "100%",
                minWidth: "200px",
              }),
              control: (provided) => ({
                ...provided,
                width: "100%",
                minWidth: "200px",
                borderColor: "#ccc",
              }),
              dropdownIndicator: (provided) => ({
                ...provided,
                color: "#4caf50",
              }),
              multiValue: (provided) => ({
                ...provided,
                backgroundColor: "#f1f1f1",
              }),
              menuPortal: (provided) => ({
                ...provided,
                zIndex: 1300,
              }),
            }}
          />
        </div>
        <div>
          <h3
            style={{
              fontSize: "1.2rem",
              marginBottom: "10px",
              marginTop: "10px",
            }}
          >
            Componentes
          </h3>
          <Select
            isMulti
            options={componentes}
            value={selectedComponentes}
            onChange={setSelectedComponentes}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              container: (provided) => ({
                ...provided,
                width: "100%",
                minWidth: "200px",
              }),
              control: (provided) => ({
                ...provided,
                width: "100%",
                minWidth: "200px",
                borderColor: "#ccc",
              }),
              dropdownIndicator: (provided) => ({
                ...provided,
                color: "#4caf50",
              }),
              multiValue: (provided) => ({
                ...provided,
                backgroundColor: "#f1f1f1",
              }),
              menuPortal: (provided) => ({
                ...provided,
                zIndex: 1300,
              }),
            }}
          />
        </div>

        {errorMessage && (
          <Typography color="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
        )}

        <div
          style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}
        >
          {/* Botón de Guardar */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={estadoMantenimiento === "Finalizado"}
          >
            Guardar
          </Button>

          {/* Botón de Finalizar Mantenimiento */}
          <Button
            variant="contained"
            color="secondary"
            onClick={handleFinishMaintenance}
            disabled={
              estadoMantenimiento === "Finalizado" ||
              (selectedActividades.length === 0 &&
                selectedComponentes.length === 0)
            }
            sx={{ ml: 2 }}
          >
            Finalizar Mantenimiento
          </Button>

          {/* Botón de Cancelar */}
          <Button
            variant="outlined"
            color="secondary"
            onClick={closeModal}
            sx={{ ml: 2 }}
          >
            Cancelar
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default ActivoModal;
