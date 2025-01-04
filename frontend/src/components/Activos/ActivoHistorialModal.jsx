import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Box, Typography, Button } from "@mui/material";
import { saveAs } from "file-saver";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const ActivoHistorialModal = ({ activoId, activoCod, closeModal }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/reportes/historial/${activoId}`
        );
        setHistorial(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener historial de mantenimiento", error);
        setHistorial([]);
        setLoading(false);
      }
    };
    fetchHistorial();
  }, [activoId]);

  const downloadCSV = () => {
    if (!historial || historial.length === 0) return;
    const headers = [
      "ID Mantenimiento",
      "Fecha",
      "Descripción",
      "Actividades",
      "Componentes",
    ];
    const rows = historial.map((item) => [
      item.ID_MANT,
      new Date(item.FEC_INI_MANT).toLocaleString(),
      item.DESC_MANT,
      item.actividades,
      item.componentes ? item.componentes : "",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    saveAs(blob, `historial_mantenimiento_${activoId}.csv`);
  };

  return (
    <Modal
      open={true}
      onClose={closeModal}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={modalStyle}>
        <Typography variant="h6" id="modal-title" gutterBottom>
          Historial de Mantenimientos de Activo {activoCod}
        </Typography>

        {loading ? (
          <Typography>Cargando...</Typography>
        ) : historial.length === 0 ? (
          <Typography>Sin historial de mantenimientos.</Typography>
        ) : (
          <Box sx={contentStyle}>
            {historial.map((item) => {
              // Convertir las actividades y componentes en listas
              const actividadesList = item.actividades
                ? item.actividades.split(",")
                : [];
              const componentesList = item.componentes
                ? item.componentes.split(",")
                : [];

              return (
                <Box key={item.ID_MANT} sx={mantenimientoCardStyle}>
                  <Typography
                    variant="h6"
                    sx={{ marginBottom: "10px", fontWeight: "bold" }}
                  >
                    Mantenimiento: {item.COD_MANT}
                  </Typography>
                  <Typography variant="body1" sx={{ marginBottom: "8px" }}>
                    <strong>Descripción:</strong> {item.DESC_MANT}
                  </Typography>
                  <Typography variant="body1" sx={{ marginBottom: "8px" }}>
                    <strong>Fecha de Inicio:</strong>{" "}
                    {new Date(item.FEC_INI_MANT).toLocaleString()}
                  </Typography>

                  <Typography variant="body1" sx={{ marginBottom: "8px" }}>
                    <strong>Estado: </strong>
                    <span
                      style={{
                        color:
                          item.ESTADO_MANT === "Finalizado"
                            ? "green"
                            : "orange",
                        fontWeight: "bold",
                      }}
                    >
                      {item.ESTADO_MANT}
                    </span>
                  </Typography>

                  {/* Mostrar Fecha de Finalización solo si el estado es 'Finalizado' */}
                  {item.ESTADO_MANT === "Finalizado" && (
                    <Typography variant="body1" sx={{ marginBottom: "8px" }}>
                      <strong>Fecha de Finalización:</strong>{" "}
                      {new Date(item.FEC_FIN_MANT).toLocaleString()}
                    </Typography>
                  )}
                   <Typography variant="body1" sx={{ marginBottom: "8px" }}>
                    <strong>Estado del Mantenimiento para este Activo: </strong>
                    <span
                      style={{
                        color:
                          item.estado_detalle === "Finalizado"
                            ? "green"
                            : "orange",
                        fontWeight: "bold",
                      }}
                    >
                      {item.ESTADO_MANT}
                    </span>
                  </Typography>
                  <Typography variant="body1" sx={{ marginBottom: "8px" }}>
                    <strong>Actividades:</strong>
                    <ul style={{ marginTop: "5px" }}>
                      {actividadesList.length > 0 ? (
                        actividadesList.map((actividad, index) => (
                          <li key={index}>{actividad.trim()}</li>
                        ))
                      ) : (
                        <li>No hay actividades registradas</li>
                      )}
                    </ul>
                  </Typography>

                  <Typography variant="body1" sx={{ marginBottom: "8px" }}>
                    <strong>Componentes:</strong>
                    <ul style={{ marginTop: "5px" }}>
                      {componentesList.length > 0 ? (
                        componentesList.map((componente, index) => (
                          <li key={index}>{componente.trim()}</li>
                        ))
                      ) : (
                        <li>No hay componentes registrados</li>
                      )}
                    </ul>
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}

        <Box sx={buttonContainer}>
          <Button variant="outlined" color="secondary" onClick={closeModal}>
            Cerrar
          </Button>

          {/* Descargar CSV */}
          <Button
            variant="contained"
            color="primary"
            onClick={downloadCSV}
            disabled={historial.length === 0}
          >
            Descargar CSV
          </Button>

          {/* Descargar PDF */}
          <PDFDownloadLink
            document={<PDFDocument data={historial} />}
            fileName={`historial_mantenimiento_${activoId}.pdf`}
          >
            {({ loading }) =>
              loading ? (
                <Button variant="contained" color="primary" disabled>
                  Cargando PDF...
                </Button>
              ) : (
                <Button variant="contained" color="primary">
                  Descargar PDF
                </Button>
              )
            }
          </PDFDownloadLink>
        </Box>
      </Box>
    </Modal>
  );
};

// Estilo para el modal y los botones
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%", // Cambié esto para que el modal sea más pequeño en pantallas móviles
  maxWidth: "900px",
  maxHeight: "80vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const contentStyle = {
  maxHeight: "70vh",
  overflowY: "auto",
  marginTop: 2,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const mantenimientoCardStyle = {
  display: "flex",
  flexDirection: "column",
  padding: 2,
  margin: 2,
  width: "100%", 
  maxWidth: "600px", 
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  transition: "background-color 0.3s, transform 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "#e0e0e0",
    transform: "scale(1.02)",
  },
};

const buttonContainer = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 2,
  flexWrap: "wrap",
  gap: "10px",
};

// Media Queries para hacer que los botones se acomoden verticalmente en pantallas pequeñas
const buttonContainerResponsive = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: 2,
  gap: "10px",
};

const styles = {
  "@media (max-width: 600px)": {
    buttonContainer: {
      ...buttonContainerResponsive,
    },
    modalStyle: {
      width: "95%",
    },
    mantenimientoCardStyle: {
      width: "100%",
    },
  },
};

const PDFDocument = ({ data }) => {
  const currentDate = new Date().toLocaleDateString();
  const stylesPDF = StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: "Helvetica",
    },
    header: {
      textAlign: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 14,
      marginBottom: 20,
    },
    date: {
      textAlign: "right",
      fontSize: 12,
      marginBottom: 20,
    },
    section: {
      marginBottom: 15,
      padding: 10,
      borderBottom: "1px solid #d3d3d3",
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 5,
    },
    content: {
      fontSize: 12,
      marginBottom: 5,
    },
    footer: {
      position: "absolute",
      bottom: 30,
      width: "100%",
      textAlign: "center",
      fontSize: 10,
    },
  });

  return (
    <Document>
      <Page style={stylesPDF.page}>
        {/* Título del documento */}
        <View style={stylesPDF.header}>
          <Text style={stylesPDF.title}>Informe de Mantenimientos</Text>
          <Text style={stylesPDF.subtitle}>Fecha: {currentDate}</Text>
        </View>

        {/* Secciones de mantenimientos */}
        {data.map((item) => (
          <View key={item.ID_MANT} style={stylesPDF.section}>
            <Text style={stylesPDF.sectionTitle}>
              ID Mantenimiento: {item.ID_MANT}
            </Text>
            <Text style={stylesPDF.content}>
              <Text>
                Fecha de Inicio: {new Date(item.FEC_INI_MANT).toLocaleString()}
              </Text>
            </Text>
            <Text style={stylesPDF.content}>
              <Text>Estado:</Text> {item.ESTADO_MANT}
            </Text>
            {item.FEC_FIN_MANT && item.ESTADO_MANT === "Finalizado" && (
              <Text style={stylesPDF.content}>
                <Text>Fecha de Finalización:</Text>{" "}
                {new Date(item.FEC_FIN_MANT).toLocaleString()}
              </Text>
            )}
            <Text style={stylesPDF.content}>
              <Text>Descripción:</Text> {item.DESC_MANT}
            </Text>
            <Text style={stylesPDF.content}>
              <Text>Actividades:</Text>
              {item.actividades &&
                item.actividades
                  .split(",")
                  .map((act, index) => (
                    <Text key={index}>{`\n• ${act.trim()}`}</Text>
                  ))}
            </Text>
            <Text style={stylesPDF.content}>
              <Text>Componentes:</Text>
              {item.componentes
                ? item.componentes
                    .split(",")
                    .map((comp, index) => (
                      <Text key={index}>{`\n• ${comp.trim()}`}</Text>
                    ))
                : " Ninguno"}
            </Text>
          </View>
        ))}

        {/* Pie de página */}
        <View style={stylesPDF.footer}>
          <Text>Documento generado automáticamente</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ActivoHistorialModal;
