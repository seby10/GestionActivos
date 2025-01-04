import React, { useState, useEffect } from "react";
import axios from "axios";
import { Snackbar, Alert, Button } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faHistory } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ExcelComponent from "./ExcelComponent";
import ActivoHistorialModal from "./ActivoHistorialModal";

const ActivosTable = () => {
  const [isEdited, setIsEdited] = useState(false);
  const [activos, setActivos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCodeQuery, setSearchCodeQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;
  const [modalActivoId, setModalActivoId] = useState(null);
  const [modalActivoCod, setModalActivoCod] = useState(null);
  const [activoToEdit, setActivoToEdit] = useState(null);
  const [updatedActivo, setUpdatedActivo] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Fetch activos y proveedores
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [activosRes, proveedoresRes] = await Promise.all([
          axios.get("http://localhost:3000/api/activos"),
          axios.get("http://localhost:3000/api/proveedores"),
        ]);
        setActivos(activosRes.data);
        setProveedores(proveedoresRes.data);
        setLoading(false);
      } catch (err) {
        setError("Error al cargar los datos.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDataUpload = () => {
    const fetchData = async () => {
      try {
        const activosRes = await axios.get("http://localhost:3000/api/activos");
        setActivos(activosRes.data);
      } catch (err) {
        setError("Error al cargar los datos.");
      }
    };
    fetchData();
  };
  // Filtrar activos por búsqueda y categoría
  const filteredActivos = activos
    .filter((activo) =>
      activo.COD_ACT.toLowerCase().includes(searchCodeQuery.toLowerCase())
    )
    .filter((activo) =>
      activo.NOM_ACT.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((activo) =>
      filterCategory
        ? String(activo.CAT_ACT).toLowerCase() === filterCategory.toLowerCase()
        : true
    )
    .filter((activo) =>
      filterLocation
        ? String(activo.UBI_ACT).toLowerCase() === filterLocation.toLowerCase()
        : true
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.NOM_ACT.localeCompare(b.NOM_ACT);
      } else {
        return b.NOM_ACT.localeCompare(a.NOM_ACT);
      }
    });

  const paginatedActivos = filteredActivos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredActivos.length / itemsPerPage);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  const handleClearFilters = () => {
    setSearchQuery(""); // Limpia la búsqueda por nombre
    setSearchCodeQuery(""); // Limpia la búsqueda por código
    setFilterCategory(""); // Limpia el filtro de categoría
    setFilterLocation(""); // Limpia el filtro de ubicación
    setCurrentPage(1); // Vuelve a la primera página
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCodeSearch = (e) => {
    setSearchCodeQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setFilterCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleLocationChange = (e) => {
    setFilterLocation(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (activo) => {
    setIsEdited(false);
    setActivoToEdit(activo);
    setUpdatedActivo({ ...activo });
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;

    setUpdatedActivo({
      ...updatedActivo,
      [name]: value,
    });

    if (activoToEdit[name] !== value || value === "") {
      setIsEdited(true);
    } else {
      setIsEdited(false);
    }
  };

  const handleUpdate = async () => {
    // Verifica si algún campo obligatorio está vacío
    if (!updatedActivo.NOM_ACT?.trim() || !updatedActivo.MAR_ACT?.trim()) {
      setAlertMessage("Todos los campos requeridos deben estar completos.");
      setAlertSeverity("warning");
      setShowAlert(true);
      return;
    }

    // Verifica si al menos un campo fue editado
    if (!isEdited) {
      setAlertMessage("Debe editar al menos un campo antes de guardar.");
      setAlertSeverity("warning");
      setShowAlert(true);
      return;
    }

    try {
      await axios.put(
        `http://localhost:3000/api/activos/${activoToEdit.ID_ACT}`,
        updatedActivo
      );

      const updatedActivos = activos.map((activo) =>
        activo.ID_ACT === activoToEdit.ID_ACT ? { ...updatedActivo } : activo
      );
      setActivos(updatedActivos);

      setActivoToEdit(null);
      setAlertMessage("Activo actualizado correctamente");
      setAlertSeverity("success");
      setShowAlert(true);
    } catch (err) {
      setError("Error al actualizar el activo.");
      setAlertMessage("Hubo un error al actualizar el activo");
      setAlertSeverity("error");
      setShowAlert(true);
    }
  };
  const openModal = (activo) => {
    setModalActivoId(activo.ID_ACT);
    setModalActivoCod(activo.COD_ACT);
  };

  const closeModal = () => {
    setModalActivoId(null);
  };
  return (
    <div className="container-fluid my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          {user && user.type === "admin" && (
            <ExcelComponent onDataUpload={handleDataUpload} />
          )}
        </div>
      </div>
      <div className="card p-4">
        <header className="mb-4">
          {/* Barra de búsqueda y selectores */}
          <div
            className="d-flex flex-wrap gap-3 mb-4"
            style={{ maxWidth: "100%" }}
          >
            <div className="flex-fill" style={{ maxWidth: "250px" }}>
              <input
                type="text"
                placeholder="Código..."
                value={searchCodeQuery}
                onChange={handleCodeSearch}
                className="form-control"
              />
            </div>
            <div className="flex-fill" style={{ maxWidth: "250px" }}>
              <input
                type="text"
                placeholder="Nombre..."
                value={searchQuery}
                onChange={handleSearch}
                className="form-control"
              />
            </div>
            <div className="flex-fill" style={{ maxWidth: "250px" }}>
              <select
                value={filterCategory}
                onChange={handleCategoryChange}
                className="form-select"
              >
                <option value="">Todas las categorías</option>
                <option value="informático">Informático</option>
                <option value="mueble">Mueble</option>
                <option value="electrónico">Electrónico</option>
                <option value="vehículo">Vehículo</option>
                <option value="mobiliario de oficina">
                  Mobiliario de Oficina
                </option>
                <option value="herramienta">Herramienta</option>
                <option value="equipamiento médico">Equipamiento Médico</option>
                <option value="equipos de comunicación">
                  Equipos de Comunicación
                </option>
                <option value="instrumento de laboratorio">
                  Instrumento de Laboratorio
                </option>
                <option value="equipo de producción">
                  Equipo de Producción
                </option>
                <option value="equipo de seguridad">Equipo de Seguridad</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div className="flex-fill" style={{ maxWidth: "250px" }}>
              <select
                value={filterLocation}
                onChange={handleLocationChange}
                className="form-select"
              >
                <option value="">Todas las ubicaciones</option>
                <option value="Laboratorio A">Laboratorio A</option>
                <option value="Laboratorio B">Laboratorio B</option>
                <option value="Laboratorio C">Laboratorio C</option>
                <option value="Laboratorio D">Laboratorio D</option>
                <option value="Aula 1">Aula 1</option>
                <option value="Aula 2">Aula 2</option>
                <option value="Aula 3">Aula 3</option>
                <option value="Aula 4">Aula 4</option>
                <option value="Oficina Principal">Oficina Principal</option>
                <option value="Oficina Secundaria">Oficina Secundaria</option>
                <option value="Sala de Juntas">Sala de Juntas</option>
                <option value="Almacén">Almacén</option>
                <option value="Taller">Taller</option>
                <option value="Recepción">Recepción</option>
                <option value="Pasillo Principal">Pasillo Principal</option>
              </select>
            </div>
            {/* Botón para limpiar filtros */}
            <div className="ms-auto d-flex align-items-center">
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
                sx={{
                  minWidth: "150px",
                  borderColor: (theme) => theme.palette.grey[300],
                  color: (theme) => theme.palette.grey[700],
                  "&:hover": {
                    borderColor: (theme) => theme.palette.grey[400],
                    backgroundColor: (theme) => theme.palette.grey[100],
                  },
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </header>

        {loading ? (
          <p>Cargando activos...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div className="table-responsive" style={{ fontFamily: "Helvetica" }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}>Código</th>
                  <th onClick={toggleSortOrder} style={{ cursor: "pointer" }}>
                    Nombre {sortOrder === "asc" ? "▲" : "▼"}
                  </th>
                  <th>Marca</th>
                  <th>Categoría</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Proceso de Compra</th>
                  <th>Proveedor</th>
                  <th style={{ textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedActivos.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center">
                      No se encontraron activos.
                    </td>
                  </tr>
                ) : (
                  paginatedActivos.map((activo) => (
                    <tr key={activo.ID_ACT}>
                      <td>{activo.COD_ACT}</td>
                      <td>{activo.NOM_ACT}</td>
                      <td>{activo.MAR_ACT}</td>
                      <td>{activo.CAT_ACT}</td>
                      <td>{activo.UBI_ACT}</td>
                      <td>{activo.EST_ACT}</td>
                      <td>{activo.PC_ACT}</td>
                      <td>{activo.NOM_PRO ?? "Sin proveedor"}</td>
                      <td>
                        {user && user.type === "admin" && (
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleEdit(activo)}
                            style={{ margin: "10px" }}
                          >
                            <FontAwesomeIcon
                              icon={faPen}
                              style={{ marginRight: "5px" }}
                            />
                            {"Editar"}
                          </button>
                        )}

                        <button
                          className="btn btn-outline-info"
                          onClick={() => openModal(activo)}
                          style={{ margin: "10px" }}
                        >
                          <FontAwesomeIcon
                            icon={faHistory}
                            style={{ marginRight: "5px" }}
                          />
                          {"Ver Historial"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {modalActivoId && (
          <ActivoHistorialModal
            activoId={modalActivoId}
            activoCod={modalActivoCod}
            closeModal={closeModal}
          />
        )}
        {activoToEdit && (
          <div
            className="modal fade show"
            tabIndex="-1"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            aria-modal="true"
            role="dialog"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title mb-1">Editar Activo</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setActivoToEdit(null);
                      setIsEdited(false);
                    }}
                    aria-label="Cerrar"
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-2" style={{ padding: "5px" }}>
                    Modifique los detalles del activo y guarde cambios.
                  </p>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      name="NOM_ACT"
                      className="form-control"
                      value={updatedActivo.NOM_ACT || ""}
                      onChange={handleUpdateChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Marca</label>
                    <select
                      name="MAR_ACT"
                      className="form-select"
                      value={updatedActivo.MAR_ACT || ""}
                      onChange={handleUpdateChange}
                      required
                    >
                      <option value="Apple">Apple</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Sony">Sony</option>
                      <option value="Lenovo">Lenovo</option>
                      <option value="Dell">Dell</option>
                      <option value="HP">HP</option>
                      <option value="Acer">Acer</option>
                      <option value="Asus">Asus</option>
                      <option value="Toshiba">Toshiba</option>
                      <option value="LG">LG</option>
                      <option value="Huawei">Huawei</option>
                      <option value="Xiaomi">Xiaomi</option>
                      <option value="Bosch">Bosch</option>
                      <option value="Makita">Makita</option>
                      <option value="Caterpillar">Caterpillar</option>
                      <option value="Ford">Ford</option>
                      <option value="Chevrolet">Chevrolet</option>
                      <option value="Toyota">Toyota</option>
                      <option value="Honda">Honda</option>
                      <option value="General Electric">General Electric</option>
                      <option value="3M">3M</option>
                      <option value="Philips">Philips</option>
                      <option value="Panasonic">Panasonic</option>
                      <option value="Siemens">Siemens</option>
                      <option value="IBM">IBM</option>
                      <option value="Cisco">Cisco</option>
                      <option value="Intel">Intel</option>
                      <option value="AMD">AMD</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Categoría</label>
                    <select
                      name="CAT_ACT"
                      className="form-select"
                      value={updatedActivo.CAT_ACT || ""}
                      onChange={handleUpdateChange}
                    >
                      <option value="Informático">Informático</option>
                      <option value="Mueble">Mueble</option>
                      <option value="Electrónico">Electrónico</option>
                      <option value="Vehículo">Vehículo</option>
                      <option value="Mobiliario de Oficina">
                        Mobiliario de Oficina
                      </option>
                      <option value="Herramienta">Herramienta</option>
                      <option value="Equipamiento Médico">
                        Equipamiento Médico
                      </option>
                      <option value="Equipos de Comunicación">
                        Equipos de Comunicación
                      </option>
                      <option value="Instrumento de Laboratorio">
                        Instrumento de Laboratorio
                      </option>
                      <option value="Equipo de Producción">
                        Equipo de Producción
                      </option>
                      <option value="Equipo de Seguridad">
                        Equipo de Seguridad
                      </option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ubicación</label>
                    <select
                      name="UBI_ACT"
                      className="form-select"
                      value={updatedActivo.UBI_ACT || ""}
                      onChange={handleUpdateChange}
                    >
                      <option value="Laboratorio A">Laboratorio A</option>
                      <option value="Laboratorio B">Laboratorio B</option>
                      <option value="Laboratorio C">Laboratorio C</option>
                      <option value="Laboratorio D">Laboratorio D</option>
                      <option value="Aula 1">Aula 1</option>
                      <option value="Aula 2">Aula 2</option>
                      <option value="Aula 3">Aula 3</option>
                      <option value="Aula 4">Aula 4</option>
                      <option value="Oficina Principal">
                        Oficina Principal
                      </option>
                      <option value="Oficina Secundaria">
                        Oficina Secundaria
                      </option>
                      <option value="Sala de Juntas">Sala de Juntas</option>
                      <option value="Almacén">Almacén</option>
                      <option value="Taller">Taller</option>
                      <option value="Recepción">Recepción</option>
                      <option value="Pasillo Principal">
                        Pasillo Principal
                      </option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Estado</label>
                    <select
                      name="EST_ACT"
                      className="form-select"
                      value={updatedActivo.EST_ACT || ""}
                      onChange={handleUpdateChange}
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="En Mantenimiento">Mantenimiento</option>
                      <option value="Nuevo">Nuevo</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  {/* <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActivoToEdit(null)}
                  >
                    Cerrar
                  </button> */}
                  <button
                    type="button"
                    className="btn btn-dark w-100"
                    onClick={handleUpdate}
                    disabled={!isEdited}
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paginación */}
        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn btn-secondary mx-2"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{ backgroundColor: "#007bff", border: "none" }}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Anterior
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`btn btn-outline-secondary mx-1 ${
                currentPage === i + 1 ? "active" : ""
              }`}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                backgroundColor:
                  currentPage === i + 1 ? "#007bff" : "transparent",
                border: "none",
                color: currentPage === i + 1 ? "#fff" : "#6c757d",
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="btn btn-secondary mx-2"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            style={{ backgroundColor: "#007bff", border: "none" }}
          >
            Siguiente
            <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
          </button>
        </div>
      </div>
      {showAlert && (
        <Snackbar
          open={showAlert}
          autoHideDuration={6000}
          onClose={() => setShowAlert(false)}
        >
          <Alert
            onClose={() => setShowAlert(false)}
            severity={alertSeverity}
            sx={{
              width: "100%",
              backgroundColor:
                alertSeverity === "error" ? "#f44336" : "#4caf50",
            }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      )}
      <style jsx>
        {`
          .table {
            width: 100%;
            border-collapse: collapse;
            border-radius: 10px;
            overflow: hidden;
          }

          .table th,
          .table td {
            padding: 12px 20px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }

          .table th {
            background-color: #1976d2;
            color: white;
          }

          .table tr:hover {
            background-color: #f1f1f1 !important;
          }

          .table .btn {
            border-radius: 5px;
            padding: 8px 15px;
          }

          .table .btn-outline-primary {
            border: 1px solid #1976d2;
            color: #1976d2;
          }

          .table .btn-outline-primary:hover {
            background-color: #1976d2 !important;
            color: white;
          }

          .table .btn-outline-primary:focus {
            box-shadow: none;
          }

          .table .active {
            background-color: #1976d2;
            color: white;
          }

          .table .pagination-button {
            background-color: transparent;
            border: 1px solid #1976d2;
            color: #1976d2;
          }

          .table .pagination-button.active {
            background-color: #1976d2;
            color: white;
          }

          .table .pagination-button:hover {
            background-color: #1976d2;
            color: white;
          }

          .table .pagination-button:focus {
            box-shadow: none;
          }

          /* Estilo para los alertas */
          .alert {
            margin-top: 20px;
            padding: 10px;
          }
        `}
      </style>
    </div>
  );
};

export default ActivosTable;
