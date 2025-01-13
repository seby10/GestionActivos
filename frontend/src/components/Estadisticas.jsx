import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
  TablePagination,
} from "@mui/material";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import EstadisticasFecha from "./EstadisticasFecha";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const Estadisticas = () => {
  const [actividadesFrecuentes, setActividadesFrecuentes] = useState([]);
  const [componentesUsados, setComponentesUsados] = useState([]);
  const [registrosMantenimiento, setRegistrosMantenimiento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");

  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const getSortedRecords = () => {
    return [...registrosMantenimiento].sort((a, b) => {
      if (sortOrder === "asc") {
        return new Date(a.FEC_INI_MANT) - new Date(b.FEC_INI_MANT);
      } else {
        return new Date(b.FEC_INI_MANT) - new Date(a.FEC_INI_MANT);
      }
    });
  };

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
    }).format(date);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [actividadesRes, componentesRes, registrosRes] = await Promise.all([
          axios.get("http://localhost:3000/api/estadisticas/actividadesFrec"),
          axios.get("http://localhost:3000/api/estadisticas/componentesUsados"),
          axios.get("http://localhost:3000/api/estadisticas/registroMantenimientos")
        ]);

        setActividadesFrecuentes(actividadesRes.data);
        setComponentesUsados(componentesRes.data);
        setRegistrosMantenimiento(registrosRes.data);
      } catch (err) {
        setError("Error al cargar los datos estadísticos");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <EstadisticasFecha />
      <Card elevation={3} sx={{ mb: 2 }}>
        <CardHeader
          title="Estadísticas Históricas del Sistema"
          sx={{ backgroundColor: '#f5f5f5' }}
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Actividades más Frecuentes - Gráfico de Pie */}
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardHeader
                  title="Actividades más Frecuentes"
                  subheader="Top 3 de actividades de mantenimiento realizadas"
                  sx={{ backgroundColor: '#f5f5f5' }}
                />
                <CardContent>
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <PieChart width={400} height={350}>
                      <Pie
                        data={actividadesFrecuentes}
                        dataKey="frecuencia"
                        nameKey="descripcion"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        label
                      >
                        {actividadesFrecuentes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Componentes más Usados - Gráfico de Barras */}
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardHeader
                  title="Componentes más Usados"
                  subheader="Top 3 de componentes usados en mantenimientos"
                  sx={{ backgroundColor: '#f5f5f5' }}
                />
                <CardContent>
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <BarChart width={400} height={350} data={componentesUsados}>
                      <XAxis dataKey="descripcion" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="cantidad" fill="#8884d8">
                        {componentesUsados.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Registros de Mantenimiento Recientes con Paginación */}
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardHeader
                  title="Registros de Mantenimiento Recientes"
                  subheader="Vista detallada de las actividades de mantenimiento"
                  sx={{ backgroundColor: '#f5f5f5' }}
                />
                <CardContent>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><Typography variant="subtitle2">Código</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Fecha Inicio</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Fecha Fin</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Descripción</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Activos</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Actividades</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Componentes</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Estado</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Encargado</Typography></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {registrosMantenimiento
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((registro) => (
                            <TableRow key={registro.ID_DET_MANT}>
                              <TableCell>{registro.COD_MANT}</TableCell>
                              <TableCell>{formatDate(registro.FEC_INI_MANT)}</TableCell>
                              <TableCell>{formatDate(registro.FEC_FIN_MANT) || '-'}</TableCell>
                              <TableCell>{registro.DESC_MANT}</TableCell>
                              <TableCell>{registro.NOM_ACT}</TableCell>
                              <TableCell>{registro.actividades || '-'}</TableCell>
                              <TableCell>{registro.componentes || '-'}</TableCell>
                              <TableCell>{registro.EST_DET_MANT}</TableCell>
                              <TableCell>
                                {registro.NOM_USU === null ? registro.NOM_PRO : registro.NOM_USU}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={registrosMantenimiento.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      labelRowsPerPage="Filas por página"
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
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Estadisticas;