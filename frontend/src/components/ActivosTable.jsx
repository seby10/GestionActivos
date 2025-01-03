import React, { useState, useEffect } from "react";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ExcelComponent from "./ExcelComponent";

const ActivosTable = () => {
  const [isEdited, setIsEdited] = useState(false);
  const [activos, setActivos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

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

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
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
    if (
      !updatedActivo.NOM_ACT?.trim() ||
      !updatedActivo.MAR_ACT?.trim() ||
      !updatedActivo.MOD_ACT?.trim()
    ) {
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

  return (
    <div className="container-fluid my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          {user && user.type === "admin" && (
            <ExcelComponent onDataUpload={handleDataUpload} />
          )}
        </div>
      </div>
      <div style={{ backgroundColor: "rgb(240 244 248)" }} className="card p-4">
        <header className="mb-4">
          {/* Barra de búsqueda y selectores */}
          <div className="d-flex gap-3 mb-4" style={{ maxWidth: "800px" }}>
            <input
              type="text"
              placeholder="Buscar activos..."
              value={searchQuery}
              onChange={handleSearch}
              className="form-control"
              style={{ flex: "1 1 auto" }}
            />
            <select
              value={filterCategory}
              onChange={handleCategoryChange}
              className="form-select"
              style={{ flex: "1 1 auto" }}
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
              <option value="equipo de producción">Equipo de Producción</option>
              <option value="equipo de seguridad">Equipo de Seguridad</option>
              <option value="otros">Otros</option>
            </select>
            <select
              value={filterLocation}
              onChange={handleLocationChange}
              className="form-select"
              style={{ flex: "1 1 auto" }}
            >
              <option value="">Todas las ubicaciones</option>
              <option value="Laboratorio A">Laboratorio A</option>
              <option value="Laboratorio B">Laboratorio B</option>
              <option value="Laboratorio C">Laboratorio C</option>
              <option value="Laboratorio D">Laboratorio D</option>
              <option value="Aula 1">Aula 1</option>
              <option value="Aula 2">Aula 2</option>
              <option value="Aula 3">Aula 3</option>
            </select>
          </div>
        </header>
        {loading ? (
          <p>Cargando activos...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div className="table-responsive" style={{ fontFamily: "Helvetica" }}>
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th onClick={toggleSortOrder} style={{ cursor: "pointer" }}>
                    Nombre {sortOrder === "asc" ? "▲" : "▼"}
                  </th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Categoría</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Proceso de Compra</th>
                  <th>Proveedor</th>
                  <th>Acciones</th>
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
                      <td>{activo.NOM_ACT}</td>
                      <td>{activo.MAR_ACT}</td>
                      <td>{activo.MOD_ACT}</td>
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
                          >
                            <FontAwesomeIcon icon={faPen} /> Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
                    <input
                      type="text"
                      name="MAR_ACT"
                      className="form-control"
                      value={updatedActivo.MAR_ACT || ""}
                      onChange={handleUpdateChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Modelo</label>
                    <input
                      type="text"
                      name="MOD_ACT"
                      className="form-control"
                      value={updatedActivo.MOD_ACT || ""}
                      onChange={handleUpdateChange}
                      required
                    />
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
                      <option value="disponible">Disponible</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="asignado">Asignado</option>
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
                color: currentPage === i + 1 ? "#fff" : "#6c757d", // cambiar color de texto cuando no es activo
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
            sx={{ width: "100%" }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
};

export default ActivosTable;
