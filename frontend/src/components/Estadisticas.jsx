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
  Grid2
} from "@mui/material";

const Estadisticas = () => {
  const [actividadesFrecuentes, setActividadesFrecuentes] = useState([]);
  const [componentesUsados, setComponentesUsados] = useState([]);
  const [registrosMantenimiento, setRegistrosMantenimiento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <Grid container spacing={3}>
        {/* Actividades más Frecuentes */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader
              title="Actividades más Frecuentes"
              subheader="Top 5 de actividades de mantenimiento realizadas"
              sx={{ backgroundColor: '#f5f5f5' }}
            />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography variant="subtitle2">Actividad</Typography></TableCell>
                      <TableCell align="right"><Typography variant="subtitle2">Frecuencia</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {actividadesFrecuentes.map((actividad) => (
                      <TableRow key={actividad.descripcion}>
                        <TableCell>{actividad.descripcion}</TableCell>
                        <TableCell align="right">{actividad.frecuencia}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Componentes más Usados */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader
              title="Componentes más Usados"
              subheader="Top 5 de componentes involucrados en mantenimientos"
              sx={{ backgroundColor: '#f5f5f5' }}
            />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography variant="subtitle2">Componente</Typography></TableCell>
                      <TableCell align="right"><Typography variant="subtitle2">Cantidad de Usos</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {componentesUsados.map((componente) => (
                      <TableRow key={componente.descripcion}>
                        <TableCell>{componente.descripcion}</TableCell>
                        <TableCell align="right">{componente.cantidad}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Registros de Mantenimiento Recientes */}
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
                      <TableCell><Typography variant="subtitle2">Codigo</Typography></TableCell>
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
                    {registrosMantenimiento.map((registro) => (
                      <TableRow key={registro.COD_MANT}>
                        <TableCell>{registro.COD_MANT}</TableCell>
                        <TableCell>{formatDate(registro.FEC_INI_MANT)}</TableCell>
                        <TableCell>{formatDate(registro.FEC_FIN_MANT)}</TableCell>
                        <TableCell>{registro.DESC_MANT}</TableCell>
                        <TableCell>{registro.NOM_ACT}</TableCell>
                        <TableCell>{registro.actividades}</TableCell>
                        <TableCell>{registro.componentes}</TableCell>
                        <TableCell>{registro.ESTADO_MANT}</TableCell>
                        <TableCell>{registro.ID_TEC_INT === null
                          ? registro.NOM_PRO
                          : registro.NOM_USU}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Estadisticas;