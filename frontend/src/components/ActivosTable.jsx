import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ExcelComponent from './ExcelComponent';

const ActivosTable = () => {
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
    setActivoToEdit(activo);
    setUpdatedActivo({ ...activo });
  };

  const handleUpdateChange = (e) => {
    setUpdatedActivo({
      ...updatedActivo,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:3000/api/activos/${activoToEdit.ID_ACT}`,
        updatedActivo
      );
      const updatedActivos = activos.map((activo) =>
        activo.ID_ACT === activoToEdit.ID_ACT ? { ...updatedActivo } : activo
      );
      setActivos(updatedActivos);

      const activosRes = await axios.get("http://localhost:3000/api/activos");
      setActivos(activosRes.data);

      setActivoToEdit(null);
    } catch (err) {
      setError("Error al actualizar el activo.");
    }
  };

  return (
    <div className="container-fluid my-5">
      <div style={{ backgroundColor: "#efefef" }} className="card p-4">
        <header className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0">Tabla de Activos</h1>
            <div className="d-flex align-items-center"> 
              <ExcelComponent onDataUpload={handleDataUpload} />
            </div>
          </div>
        </header>
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
            <option value="mobiliario de oficina">Mobiliario de Oficina</option>
            <option value="herramienta">Herramienta</option>
            <option value="equipamiento médico">Equipamiento Médico</option>
            <option value="equipos de comunicación">Equipos de Comunicación</option>
            <option value="instrumento de laboratorio">Instrumento de Laboratorio</option>
            <option value="equipo de producción">Equipo de Producción</option>
            <option value="equipo de seguridad">Equipo de Seguridad</option>
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

        {loading ? (
          <p>Cargando activos...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div className="table-responsive">
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
                      <td>{activo.NOM_PRO || "Sin proveedor"}</td>
                      <td>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(activo)}
                        >
                          <FontAwesomeIcon icon={faPen} /> Editar
                        </button>
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
                  <h5 className="modal-title">Editar Activo</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setActivoToEdit(null)}
                    aria-label="Cerrar"
                  ></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="mb-3">
                      <label htmlFor="nombre" className="form-label">
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="NOM_ACT"
                        className="form-control"
                        value={updatedActivo.NOM_ACT}
                        onChange={handleUpdateChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="marca" className="form-label">
                        Marca
                      </label>
                      <input
                        type="text"
                        id="marca"
                        name="MAR_ACT"
                        className="form-control"
                        value={updatedActivo.MAR_ACT}
                        onChange={handleUpdateChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="modelo" className="form-label">
                        Modelo
                      </label>
                      <input
                        type="text"
                        id="modelo"
                        name="MOD_ACT"
                        className="form-control"
                        value={updatedActivo.MOD_ACT}
                        onChange={handleUpdateChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="categoria" className="form-label">
                        Categoría
                      </label>
                      <input
                        type="text"
                        id="categoria"
                        name="CAT_ACT"
                        className="form-control"
                        value={updatedActivo.CAT_ACT}
                        onChange={handleUpdateChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="ubicacion" className="form-label">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        id="ubicacion"
                        name="UBI_ACT"
                        className="form-control"
                        value={updatedActivo.UBI_ACT}
                        onChange={handleUpdateChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="estado" className="form-label">
                        Estado
                      </label>
                      <input
                        type="text"
                        id="estado"
                        name="EST_ACT"
                        className="form-control"
                        value={updatedActivo.EST_ACT}
                        onChange={handleUpdateChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="proveedor" className="form-label">
                        Proveedor
                      </label>
                      <select
                        name="ID_PROV"
                        className="form-select"
                        value={updatedActivo.ID_PROV || ""}
                        onChange={handleUpdateChange}
                      >
                        <option value="">Selecciona un proveedor</option>
                        {proveedores.map((proveedor) => (
                          <option key={proveedor.ID_PROV} value={proveedor.ID_PROV}>
                            {proveedor.NOM_PROV}
                          </option>
                        ))}
                      </select>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActivoToEdit(null)}
                  >
                    Cerrar
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleUpdate}>
                    Actualizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Navegación por páginas */}
        <div className="d-flex justify-content-between">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="btn btn-outline-secondary"
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            className="btn btn-outline-secondary"
            disabled={currentPage === totalPages}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivosTable;
