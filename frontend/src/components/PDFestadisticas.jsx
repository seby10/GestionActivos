import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
  Image,
} from "@react-pdf/renderer";
import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import html2canvas from "html2canvas";

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Times-Roman", // Cambiado a Times-Roman para el PDF
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    margin: 10,
    padding: 10,
    border: "1 solid #ccc",
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
  table: {
    display: "table",
    width: "100%",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #ccc",
    padding: 5,
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  summaryItem: {
    width: "33%",
    padding: 5,
  },
  label: {
    fontSize: 10,
    color: "#666",
  },
  value: {
    fontSize: 14,
    marginTop: 2,
  },
  chart: {
    marginVertical: 10,
    width: "100%",
    height: "auto",
  },
  chartAC: {
    marginVertical: 10,
    width: "50%",
    maxHeight: 250,
    objectFit: "contain",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  // Estilos para el header y footer
  header: {
    backgroundColor: "#457b9d",
    padding: 10,
    textAlign: "center",
    marginBottom: 20,
  },
  headerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    color: "white",
  },
  footer: {
    backgroundColor: "#457b9d",
    position: "absolute",
    bottom: 0,
    left: 30,
    right: 30,
    padding: 8,
    textAlign: "center",
  },
  footerText: {
    fontSize: 9,
    color: "white",
  },
});

// Componente del PDF
const StatisticsPDF = ({
  estadisticas,
  activosMasMantenidos,
  distribucionEstados,
  lineChartImage,
  pieChartImage,
  barChartImage,
}) => (
  <Document>
    {/* Página 1 */}
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Informe de Estadísticas</Text>
        <Text style={styles.subtitle}>
          Fecha: {new Date().toLocaleDateString()}
        </Text>
      </View>

      {/* Gráfico de Línea - Mantenimientos por Período */}
      {lineChartImage && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mantenimientos por Período</Text>
          <View style={styles.chartContainer}>
            <Image src={lineChartImage} style={styles.chart} />
          </View>
        </View>
      )}

      {/* Resumen del Período */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen del Período</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Total Mantenimientos</Text>
            <Text style={styles.value}>
              {estadisticas.total_mantenimientos}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Mantenimientos Finalizados</Text>
            <Text style={styles.value}>
              {estadisticas.mantenimientos_finalizados}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Duración Promedio (horas)</Text>
            <Text style={styles.value}>
              {estadisticas.promedio_duracion_horas}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Duración Máxima (horas)</Text>
            <Text style={styles.value}>{estadisticas.max_duracion_horas}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Duración Mínima (horas)</Text>
            <Text style={styles.value}>{estadisticas.min_duracion_horas}</Text>
          </View>
        </View>
      </View>

      {/* Activos más Mantenidos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activos más Mantenidos</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Activo</Text>
            <Text style={styles.tableCell}>Código</Text>
            <Text style={styles.tableCell}>Cantidad</Text>
          </View>
          {activosMasMantenidos.map((activo) => (
            <View key={activo.COD_ACT} style={styles.tableRow}>
              <Text style={styles.tableCell}>{activo.NOM_ACT}</Text>
              <Text style={styles.tableCell}>{activo.COD_ACT}</Text>
              <Text style={styles.tableCell}>
                {activo.cantidad_mantenimientos}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Page>

    {/* Página 2 */}
    <Page size="A4" style={styles.page}>
      {/* Distribución por Estados */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribución por Estados</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Estado</Text>
            <Text style={styles.tableCell}>Cantidad</Text>
          </View>
          {distribucionEstados.map((estado) => (
            <View key={estado.EST_ACT} style={styles.tableRow}>
              <Text style={styles.tableCell}>{estado.EST_ACT}</Text>
              <Text style={styles.tableCell}>{estado.cantidad}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Gráfico de Pie */}
      {pieChartImage && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividades más Frecuentes</Text>
          <View style={styles.chartContainer}>
            <Image src={pieChartImage} style={styles.chartAC} />
          </View>
        </View>
      )}
    </Page>

    {/* Página 3 */}
    <Page size="A4" style={styles.page}>
      {/* Gráfico de Barras */}
      {barChartImage && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Componentes más Usados</Text>
          <View style={styles.chartContainer}>
            <Image src={barChartImage} style={styles.chartAC} />
          </View>
        </View>
      )}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Reporte automatizado para su revisión.
        </Text>
      </View>
    </Page>
  </Document>
);

// Función para capturar los gráficos
const captureCharts = async () => {
  try {
    const lineChartElement = document.querySelector(".LineChart");
    const lineChartImage = lineChartElement
      ? await html2canvas(lineChartElement, {
          scale: 2,
          backgroundColor: "#ffffff",
        }).then((canvas) => canvas.toDataURL("image/png"))
      : null;

    const pieChartElement = document.querySelector(".PieChart");
    const pieChartImage = pieChartElement
      ? await html2canvas(pieChartElement, {
          scale: 3,
          backgroundColor: "#ffffff",
        }).then((canvas) => canvas.toDataURL("image/png"))
      : null;

    const barChartElement = document.querySelector(".BarChart");
    const barChartImage = barChartElement
      ? await html2canvas(barChartElement, {
          scale: 3,
          backgroundColor: "#ffffff",
        }).then((canvas) => canvas.toDataURL("image/png"))
      : null;

    return {
      lineChartImage,
      pieChartImage,
      barChartImage,
    };
  } catch (error) {
    console.error("Error al capturar los gráficos:", error);
    return {
      lineChartImage: null,
      pieChartImage: null,
      barChartImage: null,
    };
  }
};

// Función para generar y descargar el PDF
const handleDownloadPDF = async (data) => {
  try {
    const chartImages = await captureCharts();
    const blob = await pdf(
      <StatisticsPDF {...data} {...chartImages} />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `estadisticas-${data.fechaInicio}-${data.fechaFin}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al generar el PDF:", error);
  }
};

// Componente del botón de descarga
const PDFestadisticas = ({
  fechaInicio,
  fechaFin,
  estadisticas,
  activosMasMantenidos,
  distribucionEstados,
  actividadesFrecuentes,
  componentesUsados,
}) => {
  const isDisabled = !fechaInicio || !fechaFin || !estadisticas;

  return (
    <Button
      variant="contained"
      startIcon={<DownloadIcon />}
      disabled={isDisabled}
      onClick={() =>
        handleDownloadPDF({
          fechaInicio,
          fechaFin,
          estadisticas,
          activosMasMantenidos,
          distribucionEstados,
          actividadesFrecuentes,
          componentesUsados,
        })
      }
      sx={{
        backgroundColor: "#2196f3",
        "&:hover": {
          backgroundColor: "#1976d2",
        },
      }}
    >
      Descargar PDF
    </Button>
  );
};

export default PDFestadisticas;
