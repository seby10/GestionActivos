import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const ActivosTable = () => {
  const [activos, setActivos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState(""); // Nuevo estado para la categoría
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
        <header className="mb-4 d-flex flex-wrap gap-3 align-items-center">
          <h1 className="h4">Tabla de Activos</h1>
          <input
            type="text"
            placeholder="Buscar activos..."
            value={searchQuery}
            onChange={handleSearch}
            className="form-control"
            style={{ flex: "1 1 auto", maxWidth: "300px" }}
          />
          <select
            value={filterCategory}
            onChange={handleCategoryChange}
            className="form-select"
            style={{ flex: "1 1 auto", maxWidth: "300px" }}
          >
            <option value="">Todas las categorías</option>
            <option value="informático">Informático</option>
            <option value="mueble">Mueble</option>
            <option value="electrónico">Electrónico</option>
            <option value="vehículo">Vehículo</option>
            <option value="mobiliario de oficina">Mobiliario de Oficina</option>
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
          </select>
        </header>

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
                  <th>Proveedor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedActivos.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
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

        {/* Paginación */}
        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn btn-secondary mx-2"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`btn btn-outline-secondary mx-1 ${
                currentPage === i + 1 ? "active" : ""
              }`}
              onClick={() => setCurrentPage(i + 1)}
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
          >
            <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivosTable;
