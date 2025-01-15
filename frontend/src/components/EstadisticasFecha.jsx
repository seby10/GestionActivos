import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import debounce from "lodash/debounce";
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
    ToggleButtonGroup,
    IconButton,
    Fade,
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
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
} from "recharts";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PDFestadisticas from "./PDFestadisticas";

const generarSecuenciaFechas = (startDate, endDate, interval) => {
    const dates = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    if (interval === 'week') {
        currentDate.setDate(currentDate.getDate() - currentDate.getDay() - 7);
        end.setDate(end.getDate() + (6 - end.getDay()) + 7);
    } else if (interval === 'month') {
        currentDate.setDate(1);
        currentDate.setMonth(currentDate.getMonth() - 1);
        end.setMonth(end.getMonth() + 2, 0);
    }
    // Asegurar que las fechas estén alineadas a UTC
    currentDate.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 0);

    while (currentDate <= end) {
        dates.push(new Date(currentDate)); // Agregar copia de la fecha
        switch (interval) {
            case 'day':
                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
                break;
            case 'week':
                currentDate.setUTCDate(currentDate.getUTCDate() + 7);
                break;
            case 'month':
                currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
                break;
        }
    }

    return dates;
};

const agruparDatos = (datos, agrupacion, fechaInicio, fechaFin) => {
    if (!datos || !fechaInicio || !fechaFin) return [];

    const fechas = generarSecuenciaFechas(fechaInicio, fechaFin, agrupacion);

    const formatosFecha = {
        day: {
            format: (fecha) => fecha.toISOString().split('T')[0],
            label: (fecha) => fecha.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC'
            })
        },
        week: {
            format: (fecha) => {
                const fechaUTC = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
                const year = fechaUTC.getUTCFullYear();
                const weekNumber = Math.ceil((((fechaUTC - new Date(Date.UTC(year, 0, 1))) / 86400000) + new Date(Date.UTC(year, 0, 1)).getUTCDay() + 1) / 7);
                return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
            },
            label: (fecha) => {
                const fechaUTC = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
                const weekNumber = Math.ceil((((fechaUTC - new Date(Date.UTC(fechaUTC.getUTCFullYear(), 0, 1))) / 86400000) + new Date(Date.UTC(fechaUTC.getUTCFullYear(), 0, 1)).getUTCDay() + 1) / 7);
                return `Semana ${weekNumber}, ${fechaUTC.getUTCFullYear()}`;
            }
        },
        month: {
            format: (fecha) => fecha.toISOString().slice(0, 7),
            label: (fecha) => fecha.toLocaleDateString('es-ES', {
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC'
            })
        }
    };

    const datosMap = datos.reduce((acc, item) => {
        const fechaUTC = new Date(item.fecha); // Asegurar UTC
        const periodo = formatosFecha[agrupacion].format(fechaUTC);
        acc[periodo] = (acc[periodo] || 0) + item.cantidad;
        return acc;
    }, {});

    return fechas.map(fecha => {
        const periodo = formatosFecha[agrupacion].format(fecha);
        return {
            periodo,
            label: formatosFecha[agrupacion].label(fecha),
            cantidad: datosMap[periodo] || 0
        };
    });
};



const EstadisticasFecha = () => {
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [estadisticas, setEstadisticas] = useState(null);
    const [activosMasMantenidos, setActivosMasMantenidos] = useState([]);
    const [distribucionEstados, setDistribucionEstados] = useState([]);
    const [actividadesFrecuentes, setActividadesFrecuentes] = useState([]);
    const [componentesUsados, setComponentesUsados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mensajeNulo, setMensajeNulo] = useState("");
    const [fechaError, setFechaError] = useState("");
    const [isDataVisible, setIsDataVisible] = useState(true);
    const [datosMantenimientos, setDatosMantenimientos] = useState([]);
    const [mantenimientosPeriodo, setMantenimientosPeriodo] = useState([]);
    const [agrupacion, setAgrupacion] = useState("day");

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Card sx={{ p: 1.5, backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
                    <Typography variant="subtitle2">{label}</Typography>
                    <Typography variant="body2" color="primary">
                        Mantenimientos: {payload[0].value}
                    </Typography>
                </Card>
            );
        }
        return null;
    };

    const updateDataWithTransition = (newData) => {
        setIsDataVisible(false);
        setTimeout(() => {
            setEstadisticas(newData.estadisticas);
            setActivosMasMantenidos(newData.activos);
            setDistribucionEstados(newData.estados);
            setActividadesFrecuentes(newData.actividades);
            setComponentesUsados(newData.componentes);
            setIsDataVisible(true);
        }, 200);
    };

    // Debounce de la función fetchData
    const debouncedFetchData = useCallback(
        debounce(async (inicio, fin) => {
            if (!inicio || !fin) return;

            setLoading(true);
            setError(null);

            try {
                const [
                    estadisticasRes,
                    activosRes,
                    estadosRes,
                    actividadesRes,
                    componentesRes,
                    mantenimientosPeriodoRes,
                ] = await Promise.all([
                    axios.get(`http://localhost:3000/api/estadisticas/estadisticasMantenimiento?fechaInicio=${inicio}&fechaFin=${fin}`),
                    axios.get(`http://localhost:3000/api/estadisticas/activosMasMantenidos?fechaInicio=${inicio}&fechaFin=${fin}`),
                    axios.get(`http://localhost:3000/api/estadisticas/distribucionEstados?fechaInicio=${inicio}&fechaFin=${fin}`),
                    axios.get(`http://localhost:3000/api/estadisticas/actividadesFecha?fechaInicio=${inicio}&fechaFin=${fin}`),
                    axios.get(`http://localhost:3000/api/estadisticas/componentesFecha?fechaInicio=${inicio}&fechaFin=${fin}`),
                    axios.get(`http://localhost:3000/api/estadisticas/mantenimientosG?fechaInicio=${inicio}&fechaFin=${fin}`)
                ]);

                if (!estadisticasRes.data || estadisticasRes.data.total_mantenimientos === 0) {
                    setMensajeNulo("No hay datos para mostrar en el período seleccionado");
                    setDatosMantenimientos([]);
                    updateDataWithTransition({
                        estadisticas: null,
                        activos: [],
                        estados: [],
                        actividades: [],
                        componentes: []
                    });
                    return;
                }

                setMensajeNulo("");
                setDatosMantenimientos(mantenimientosPeriodoRes.data);

                updateDataWithTransition({
                    estadisticas: estadisticasRes.data,
                    activos: activosRes.data,
                    estados: estadosRes.data,
                    actividades: actividadesRes.data,
                    componentes: componentesRes.data
                });
            } catch (err) {
                setError("Error al cargar los datos estadísticos");
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    useEffect(() => {
        if (datosMantenimientos.length > 0 && fechaInicio && fechaFin) {
            const datosAgrupados = agruparDatos(
                datosMantenimientos,
                agrupacion,
                fechaInicio,
                fechaFin
            );
            setMantenimientosPeriodo(datosAgrupados);
        }
    }, [datosMantenimientos, agrupacion, fechaInicio, fechaFin]);



    useEffect(() => {
        if (fechaInicio && fechaFin && !fechaError) {
            debouncedFetchData(fechaInicio, fechaFin);
        }

        return () => {
            debouncedFetchData.cancel();
        };
    }, [fechaInicio, fechaFin, fechaError]);


    // Estilos para las transiciones
    const fadeTransition = {
        transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
        opacity: isDataVisible ? 1 : 0,
        transform: isDataVisible ? "translateY(0)" : "translateY(20px)",
    };


    const handleFechaInicioChange = (e) => {
        const newFechaInicio = e.target.value;
        setFechaInicio(newFechaInicio);

        if ((fechaFin && newFechaInicio > fechaFin) || !newFechaInicio) {
            setFechaError("Por favor seleccione una fecha de inicio valida");
        } else {
            setFechaError("");
        }
    };

    const handleFechaFinChange = (e) => {
        const newFechaFin = e.target.value;
        setFechaFin(newFechaFin);

        if (fechaInicio && newFechaFin < fechaInicio) {
            setFechaError("Por favor seleccione una fecha de fin valida");
        } else {
            setFechaError("");
        }
    };

    const resetDateFilters = () => {
        setTimeout(() => {
            setFechaInicio("");
            setFechaFin("");
            setFechaError("");
            setMensajeNulo("");
        }, 300);
    };

    const handleAgrupacionChange = (event, newAgrupacion) => {
        if (newAgrupacion !== null) {
            setAgrupacion(newAgrupacion);
        }
    };

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="300px"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Card elevation={3} sx={{ mb: 4 }}>
            {mensajeNulo && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    {mensajeNulo}
                </Alert>
            )}
            <CardHeader
                title="Estadísticas de Mantenimiento por Período"
                sx={{ backgroundColor: "#f5f5f5" }}
            />
            <CardContent>
                <Grid
                    container
                    spacing={2}
                    sx={{
                        mb: 4,
                        display: "flex",
                        alignItems: "center",
                        padding: "15px",
                        borderRadius: "8px",
                    }}
                >
                    <Grid item xs={12} sm={5.5}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Fecha de Inicio"
                            value={fechaInicio}
                            onChange={handleFechaInicioChange}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ max: fechaFin }}
                            error={Boolean(fechaError && fechaInicio > fechaFin)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={5.5}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Fecha de Fin"
                            value={fechaFin}
                            onChange={handleFechaFinChange}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: fechaInicio }}
                            error={Boolean(fechaError && fechaFin < fechaInicio)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                        <IconButton
                            onClick={resetDateFilters}
                            color="primary"
                            sx={{
                                backgroundColor: "#e3f2fd",
                                "&:hover": {
                                    backgroundColor: "#bbdefb",
                                },
                            }}
                        >
                            <RestartAltIcon />
                        </IconButton>
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
                    <Fade in={isDataVisible} timeout={300} style={fadeTransition}>
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
                                                <ToggleButton value="day">Día</ToggleButton>
                                                <ToggleButton value="week">Semana</ToggleButton>
                                                <ToggleButton value="month">Mes</ToggleButton>
                                            </ToggleButtonGroup>
                                        }
                                        sx={{ backgroundColor: "#f5f5f5" }}
                                    />
                                    <CardContent>
                                        <Box sx={{ width: "100%", height: 400 }}>
                                            <ResponsiveContainer>
                                                <LineChart
                                                    data={mantenimientosPeriodo}
                                                    margin={{
                                                        top: 5,
                                                        right: 30,
                                                        left: 20,
                                                        bottom: 25,
                                                    }}
                                                    className="LineChart"
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
                                </Card>
                                <Card elevation={2}>
                                    <CardHeader
                                        title="Resumen del Período"
                                        sx={{ backgroundColor: "#f5f5f5" }}
                                    />
                                    <CardContent>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={2.4}>
                                                <Typography variant="subtitle2">
                                                    Total Mantenimientos
                                                </Typography>
                                                <Typography variant="h6">
                                                    {estadisticas.total_mantenimientos}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={2.4}>
                                                <Typography variant="subtitle2">
                                                    Mantenimientos Finalizados
                                                </Typography>
                                                <Typography variant="h6">
                                                    {estadisticas.mantenimientos_finalizados}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={2.4}>
                                                <Typography variant="subtitle2">
                                                    Duración Promedio (horas)
                                                </Typography>
                                                <Typography variant="h6">
                                                    {estadisticas.promedio_duracion_horas}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={2.4}>
                                                <Typography variant="subtitle2">
                                                    Duración Máxima (horas)
                                                </Typography>
                                                <Typography variant="h6">
                                                    {estadisticas.max_duracion_horas}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={2.4}>
                                                <Typography variant="subtitle2">
                                                    Duración Mínima (horas)
                                                </Typography>
                                                <Typography variant="h6">
                                                    {estadisticas.min_duracion_horas}
                                                </Typography>
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
                                        sx={{ backgroundColor: "#f5f5f5" }}
                                    />
                                    <CardContent>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>
                                                            <Typography variant="subtitle2">
                                                                Activo
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="subtitle2">
                                                                Código
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="left">Cantidad</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {activosMasMantenidos.map((activo) => (
                                                        <TableRow key={activo.COD_ACT}>
                                                            <TableCell>
                                                                <Typography variant="body1">
                                                                    {activo.NOM_ACT}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body1">
                                                                    {activo.COD_ACT}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="left">
                                                                <Typography variant="subtitle2">
                                                                    {activo.cantidad_mantenimientos}
                                                                </Typography>
                                                            </TableCell>
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
                                        sx={{ backgroundColor: "#f5f5f5" }}
                                    />
                                    <CardContent>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>
                                                            <Typography variant="subtitle2">
                                                                Estado
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="left">
                                                            <Typography variant="subtitle2">
                                                                Cantidad
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {distribucionEstados.map((estado) => (
                                                        <TableRow key={estado.EST_ACT}>
                                                            <TableCell>
                                                                <Typography variant="body1">
                                                                    {estado.EST_ACT}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="left">
                                                                <Typography variant="body1">
                                                                    {estado.cantidad}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card elevation={3}>
                                    <CardHeader
                                        title="Actividades más Frecuentes"
                                        subheader="Top 5 de actividades de mantenimiento realizadas"
                                        sx={{ backgroundColor: "#f5f5f5" }}
                                    />
                                    <CardContent>
                                        <Box
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                        >
                                            <PieChart width={400} height={350} className="PieChart">
                                                <Pie
                                                    data={actividadesFrecuentes}
                                                    dataKey="frecuencia"
                                                    nameKey="descripcion"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    Radius={50}
                                                    label
                                                >
                                                    {actividadesFrecuentes.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={COLORS[index % COLORS.length]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend
                                                    layout="vertical"
                                                    align="center"
                                                    verticalAlign="bottom"
                                                    wrapperStyle={{
                                                        paddingTop: 10,
                                                        fontSize: "15px",
                                                    }}
                                                />
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
                                        subheader="Top 5 de componentes usados en mantenimientos"
                                        sx={{ backgroundColor: "#f5f5f5" }}
                                    />
                                    <CardContent>
                                        <Box
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                        >
                                            <BarChart
                                                width={400}
                                                height={350}
                                                data={componentesUsados}
                                                className="BarChart"
                                            >
                                                <XAxis dataKey="descripcion" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="cantidad" fill="#8884d8">
                                                    {componentesUsados.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={COLORS[index % COLORS.length]}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <PDFestadisticas
                                    fechaInicio={fechaInicio}
                                    fechaFin={fechaFin}
                                    estadisticas={estadisticas}
                                    activosMasMantenidos={activosMasMantenidos}
                                    distribucionEstados={distribucionEstados}
                                    actividadesFrecuentes={actividadesFrecuentes}
                                    componentesUsados={componentesUsados}
                                />
                            </Grid>
                        </Grid>
                    </Fade>
                )}
            </CardContent>
        </Card>
    );
};

export default EstadisticasFecha;
