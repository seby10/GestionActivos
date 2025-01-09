import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { FaFilter, FaRedo } from "react-icons/fa";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [originalHistorial, setOriginalHistorial] = useState([]);
  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/reportes/historial/${activoId}`
        );
        setOriginalHistorial(response.data);
        setHistorial(response.data);
      } catch (error) {
        console.error("Error al cargar el historial:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistorial();
  }, [activoId]);
  const resetFilter = () => setHistorial(originalHistorial);
  const handleDateFilter = () => {
    const filteredHistorial = historial.filter((item) => {
      const itemDate = new Date(item.FEC_INI_MANT);
      const startDate = dateRange.startDate
        ? new Date(dateRange.startDate)
        : null;
      const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;

      return (
        (!startDate || itemDate >= startDate) &&
        (!endDate || itemDate <= endDate)
      );
    });

    setHistorial(filteredHistorial);
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
          Historial de Activo- {activoCod}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: "8px",
            marginTop: "10px",
            marginBottom: "10px",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            justifyContent: "space-between",
          }}
        >
          <TextField
            type="date"
            label="Fecha Inicio"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, startDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            sx={{
              "& label": { fontSize: "12px" },
              "& .MuiInputBase-root": {
                borderRadius: 2,
                height: "35px",
              },
              "& input": { fontSize: "14px" },
              flex: 1,
            }}
          />
          <TextField
            type="date"
            label="Fecha Fin"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, endDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            sx={{
              "& label": { fontSize: "12px" },
              "& .MuiInputBase-root": {
                borderRadius: 2,
                height: "35px",
              },
              "& input": { fontSize: "14px" },
              flex: 1,
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleDateFilter}
            startIcon={<FaFilter />}
            sx={{
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "12px",
              minWidth: "120px",
            }}
          >
            Filtrar
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={resetFilter}
            startIcon={<FaRedo />}
            sx={{
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "12px",
              minWidth: "120px",
            }}
          >
            Resetear
          </Button>
        </Box>

        {loading ? (
          <Typography>Cargando...</Typography>
        ) : !historial || historial.length === 0 ? (
          <Typography
            variant="h6"
            sx={{ textAlign: "center", marginTop: "20px" }}
          >
            Historial Vacío
          </Typography>
        ) : (
          <Box sx={contentStyle}>
            {historial && Array.isArray(historial) && historial.length > 0 ? (
              historial.map((item) => {
                // Convertir las actividades y componentes en listas
                const actividadesList = item.actividades
                  ? item.actividades.split(",")
                  : [];
                const componentesList = item.componentes
                  ? item.componentes.split(",")
                  : [];

                return (
                  <Box key={item.ID_MANT} sx={mantenimientoCardStyle}>
                    {/* Fechas al principio, con fondo resaltado */}
                    <Box
                      sx={{
                        marginBottom: "15px",
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Fecha de Inicio */}
                      <Box
                        sx={{
                          marginRight: "15px",
                          backgroundColor: "#f1f1f1",
                          padding: "10px 20px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                          flex: "1 1 40%",
                          marginBottom: { xs: "10px", sm: "0" }, // Responsivo: espacio en pantallas pequeñas
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          <strong>Inicio:</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ marginLeft: "10px" }}>
                          {new Date(item.FEC_INI_MANT).toLocaleString()}
                        </Typography>
                      </Box>

                      {/* Flecha que conecta las fechas (solo si el mantenimiento está finalizado) */}
                      {item.ESTADO_MANT === "Finalizado" && (
                        <Box
                          sx={{
                            marginLeft: "15px",
                            marginRight: "15px",
                            fontSize: "20px",
                            color: "#888",
                          }}
                        >
                          <strong>→</strong>
                        </Box>
                      )}

                      {/* Fecha de Finalización */}
                      <Box
                        sx={{
                          backgroundColor:
                            item.ESTADO_MANT === "Finalizado"
                              ? "#d4edda"
                              : "#f7f7f7",
                          padding: "10px 20px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                          flex: "1 1 40%",
                          marginBottom: { xs: "10px", sm: "0" }, // Responsivo
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          <strong>Finalización:</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ marginLeft: "10px" }}>
                          {item.ESTADO_MANT === "Finalizado"
                            ? new Date(item.FEC_FIN_MANT).toLocaleString()
                            : "--"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Accordion para los detalles del mantenimiento */}
                    <Accordion sx={{ marginBottom: "10px", fontSize: "14px" }}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel${item.ID_MANT}-content`}
                        id={`panel${item.ID_MANT}-header`}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "bold",
                            fontSize: { xs: "14px", sm: "16px" },
                          }}
                        >
                          Mantenimiento: {item.COD_MANT}
                          <span
                            style={{
                              marginLeft: "10px",
                              fontSize: "14px",
                              color:
                                item.ESTADO_MANT === "Finalizado"
                                  ? "green"
                                  : "orange",
                            }}
                          >
                            {item.ESTADO_MANT}
                          </span>
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ fontSize: "14px" }}>
                        <Typography
                          variant="body2"
                          sx={{ marginBottom: "8px" }}
                        >
                          <strong>Descripción:</strong> {item.DESC_MANT}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ marginBottom: "8px" }}
                        >
                          <strong>
                            Estado del Mantenimiento para este Activo:{" "}
                          </strong>
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

                        {/* Actividades */}
                        <Typography
                          variant="body2"
                          sx={{ marginBottom: "8px" }}
                        >
                          <strong>Actividades:</strong>
                          <ul style={{ marginTop: "5px", marginLeft: "20px" }}>
                            {actividadesList.length > 0 ? (
                              actividadesList.map((actividad, index) => (
                                <li key={index}>{actividad.trim()}</li>
                              ))
                            ) : (
                              <li>No hay actividades registradas</li>
                            )}
                          </ul>
                        </Typography>

                        {/* Componentes */}
                        <Typography
                          variant="body2"
                          sx={{ marginBottom: "8px" }}
                        >
                          <strong>Componentes:</strong>
                          <ul style={{ marginTop: "5px", marginLeft: "20px" }}>
                            {componentesList.length > 0 ? (
                              componentesList.map((componente, index) => (
                                <li key={index}>{componente.trim()}</li>
                              ))
                            ) : (
                              <li>No hay componentes registrados</li>
                            )}
                          </ul>
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                );
              })
            ) : (
              <Typography
                variant="h6"
                sx={{ textAlign: "center", marginTop: "20px" }}
              >
                Historial Vacío
              </Typography>
            )}
          </Box>
        )}

        <Box sx={buttonContainer}>
          <Button variant="outlined" color="secondary" onClick={closeModal}>
            Cerrar
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
  maxWidth: "780px",
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
        {Array.isArray(data) && data.length > 0 ? (
          data.map((item) => (
            <View key={item.ID_MANT} style={stylesPDF.section}>
              <Text style={stylesPDF.sectionTitle}>
                ID Mantenimiento: {item.ID_MANT}
              </Text>
              <Text style={stylesPDF.content}>
                <Text>
                  Fecha de Inicio:{" "}
                  {new Date(item.FEC_INI_MANT).toLocaleString()}
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
          ))
        ) : (
          <Text style={stylesPDF.content}>
            No hay datos disponibles para mostrar
          </Text>
        )}

        {/* Pie de página */}
        <View style={stylesPDF.footer}>
          <Text>Documento generado automáticamente</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ActivoHistorialModal;
