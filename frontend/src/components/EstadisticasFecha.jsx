import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
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
    CircularProgress,
    Typography,
    Box,
    TextField,
    Alert,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const EstadisticasFecha = () => {
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [estadisticas, setEstadisticas] = useState(null);
    const [activosMasMantenidos, setActivosMasMantenidos] = useState([]);
    const [distribucionEstados, setDistribucionEstados] = useState([]);
    const [actividadesFrecuentes, setActividadesFrecuentes] = useState([]);
    const [componentesUsados, setComponentesUsados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fechaError, setFechaError] = useState('');
    const [mantenimientosPeriodo, setMantenimientosPeriodo] = useState([]);
    const [agrupacion, setAgrupacion] = useState('day');

    const handleAgrupacionChange = (event, newAgrupacion) => {
        if (newAgrupacion !== null) {
            setAgrupacion(newAgrupacion);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Card sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                    <Typography variant="subtitle2">{label}</Typography>
                    <Typography variant="body2" color="primary">
                        Mantenimientos: {payload[0].value}
                    </Typography>
                </Card>
            );
        }
        return null;
    };

    const handleFechaInicioChange = (e) => {
        const newFechaInicio = e.target.value;
        setFechaInicio(newFechaInicio);

        if (fechaFin && newFechaInicio > fechaFin) {
            setFechaError('La fecha de inicio no puede ser mayor que la fecha de fin');
        } else {
            setFechaError('');
        }
    };

    const handleFechaFinChange = (e) => {
        const newFechaFin = e.target.value;
        setFechaFin(newFechaFin);

        if (fechaInicio && newFechaFin < fechaInicio) {
            setFechaError('La fecha de fin no puede ser menor que la fecha de inicio');
        } else {
            setFechaError('');
        }
    };

    const fetchData = async () => {
        if (!fechaInicio || !fechaFin || fechaError) return;

        setLoading(true);
        setError(null);

        try {
            const [
                estadisticasRes,
                activosRes,
                estadosRes,
                actividadesRes,
                componentesRes,
                mantenimientosPeriodoRes
            ] = await Promise.all([
                axios.get(`http://localhost:3000/api/estadisticas/estadisticasMantenimiento?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),
                axios.get(`http://localhost:3000/api/estadisticas/activosMasMantenidos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),
                axios.get(`http://localhost:3000/api/estadisticas/distribucionEstados?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),
                axios.get(`http://localhost:3000/api/estadisticas/actividadesFecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),
                axios.get(`http://localhost:3000/api/estadisticas/componentesFecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),
                axios.get(`http://localhost:3000/api/estadisticas/mantenimientosG?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&agrupacion=${agrupacion}`)
            ]);

            setEstadisticas(estadisticasRes.data);
            setActivosMasMantenidos(activosRes.data);
            setDistribucionEstados(estadosRes.data);
            setActividadesFrecuentes(actividadesRes.data);
            setComponentesUsados(componentesRes.data);
            setMantenimientosPeriodo(mantenimientosPeriodoRes.data);
        } catch (err) {
            setError('Error al cargar los datos estadísticos');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (fechaInicio && fechaFin && !fechaError) {
            fetchData();
        }
    }, [fechaInicio, fechaFin, fechaError, agrupacion]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Card elevation={3} sx={{ mb: 4 }}>
            <CardHeader
                title="Estadísticas de Mantenimiento por Período"
                sx={{ backgroundColor: '#f5f5f5' }}
            />
            <CardContent>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Fecha de Inicio"
                            value={fechaInicio}
                            onChange={handleFechaInicioChange}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ max: fechaFin }}
                            error={Boolean(fechaError && fechaInicio > fechaFin)}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Fecha de Fin"
                            value={fechaFin}
                            onChange={handleFechaFinChange}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: fechaInicio }}
                            error={Boolean(fechaError && fechaFin < fechaInicio)}
                        />
                    </Grid>
                </Grid>

                {fechaError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {fechaError}
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}


                {estadisticas && (
                    <Grid container spacing={3}>
                        {/* Resumen de Estadísticas */}
                        <Grid item xs={12}>

                            <Card elevation={2} sx={{ mb: 3 }}>
                                <CardHeader
                                    title="Mantenimientos por Período"
                                    action={
                                        <ToggleButtonGroup
                                            value={agrupacion}
                                            exclusive
                                            onChange={handleAgrupacionChange}
                                            size="small"
                                        >
                                            <ToggleButton value="day">
                                                Día
                                            </ToggleButton>
                                            <ToggleButton value="week">
                                                Semana
                                            </ToggleButton>
                                            <ToggleButton value="month">
                                                Mes
                                            </ToggleButton>
                                        </ToggleButtonGroup>
                                    }
                                    sx={{ backgroundColor: '#f5f5f5' }}
                                />
                                <CardContent>
                                    <Box sx={{ width: '100%', height: 400 }}>
                                        <ResponsiveContainer>
                                            <LineChart
                                                data={mantenimientosPeriodo}
                                                margin={{
                                                    top: 5,
                                                    right: 30,
                                                    left: 20,
                                                    bottom: 25
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="label"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={70}
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <YAxis
                                                    allowDecimals={false}
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="cantidad"
                                                    stroke="#2196f3"
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card >
                            <Card elevation={2}>
                                <CardHeader
                                    title="Resumen del Período"
                                    sx={{ backgroundColor: '#f5f5f5' }}
                                />
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={2.4}>
                                            <Typography variant="subtitle2">Total Mantenimientos</Typography>
                                            <Typography variant="h6">{estadisticas.total_mantenimientos}</Typography>
                                        </Grid>
                                        <Grid item xs={12} md={2.4}>
                                            <Typography variant="subtitle2">Mantenimientos Finalizados</Typography>
                                            <Typography variant="h6">{estadisticas.mantenimientos_finalizados}</Typography>
                                        </Grid>
                                        <Grid item xs={12} md={2.4}>
                                            <Typography variant="subtitle2">Duración Promedio (horas)</Typography>
                                            <Typography variant="h6">{estadisticas.promedio_duracion_horas}</Typography>
                                        </Grid>
                                        <Grid item xs={12} md={2.4}>
                                            <Typography variant="subtitle2">Duración Máxima (horas)</Typography>
                                            <Typography variant="h6">{estadisticas.max_duracion_horas}</Typography>
                                        </Grid>
                                        <Grid item xs={12} md={2.4}>
                                            <Typography variant="subtitle2">Duración Mínima (horas)</Typography>
                                            <Typography variant="h6">{estadisticas.min_duracion_horas}</Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Activos más Mantenidos */}
                        <Grid item xs={12} md={6}>
                            <Card elevation={2}>
                                <CardHeader
                                    title="Activos más Mantenidos"
                                    sx={{ backgroundColor: '#f5f5f5' }}
                                />
                                <CardContent>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell><Typography variant="subtitle2">Activo</Typography></TableCell>
                                                    <TableCell><Typography variant="subtitle2">Código</Typography></TableCell>
                                                    <TableCell align='left'>Cantidad</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {activosMasMantenidos.map((activo) => (
                                                    <TableRow key={activo.COD_ACT}>
                                                        <TableCell><Typography variant="body1">{activo.NOM_ACT}</Typography></TableCell>
                                                        <TableCell><Typography variant="body1">{activo.COD_ACT}</Typography></TableCell>
                                                        <TableCell align='left'><Typography variant="subtitle2">{activo.cantidad_mantenimientos}</Typography></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Distribución de Estados */}
                        <Grid item xs={12} md={6}>
                            <Card elevation={2}>
                                <CardHeader
                                    title="Distribución por Estados"
                                    sx={{ backgroundColor: '#f5f5f5' }}
                                />
                                <CardContent>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell><Typography variant="subtitle2">Estado</Typography></TableCell>
                                                    <TableCell align='left'><Typography variant="subtitle2">Cantidad</Typography></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {distribucionEstados.map((estado) => (
                                                    <TableRow key={estado.EST_ACT}>
                                                        <TableCell><Typography variant="body1">{estado.EST_ACT}</Typography></TableCell>
                                                        <TableCell align="left"><Typography variant="body1">{estado.cantidad}</Typography></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Actividades más Frecuentes */}
                        <Grid item xs={12} md={6}>
                            <Card elevation={2}>
                                <CardHeader
                                    title="Actividades más Frecuentes"
                                    sx={{ backgroundColor: '#f5f5f5' }}
                                />
                                <CardContent>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell><Typography variant="subtitle2">Actividad</Typography></TableCell>
                                                    <TableCell align="left"><Typography variant="subtitle2">Frecuencia</Typography></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {actividadesFrecuentes.map((actividad) => (
                                                    <TableRow key={actividad.descripcion}>
                                                        <TableCell><Typography variant="body1">{actividad.descripcion}</Typography></TableCell>
                                                        <TableCell align="left"><Typography variant="body1">{actividad.frecuencia}</Typography></TableCell>
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
                            <Card elevation={2}>
                                <CardHeader
                                    title="Componentes más Usados"
                                    sx={{ backgroundColor: '#f5f5f5' }}
                                />
                                <CardContent>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell><Typography variant="subtitle2">Componente</Typography></TableCell>
                                                    <TableCell align="left"><Typography variant="subtitle2">Cantidad de Usos</Typography></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {componentesUsados.map((componente) => (
                                                    <TableRow key={componente.descripcion}>
                                                        <TableCell><Typography variant="body1">{componente.descripcion}</Typography></TableCell>
                                                        <TableCell align="left"><Typography variant="body1">{componente.cantidad}</Typography></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </CardContent>
        </Card>
    );
};

export default EstadisticasFecha;