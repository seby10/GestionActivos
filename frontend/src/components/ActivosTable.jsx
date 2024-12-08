import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";

const ActivosTable = () => {
  const [activos, setActivos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredActivos = activos
    .filter((activo) =>
      activo.NOM_ACT.toLowerCase().includes(searchQuery.toLowerCase())
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
      // Actualizar los activos locales
      const updatedActivos = activos.map((activo) =>
        activo.ID_ACT === activoToEdit.ID_ACT ? { ...updatedActivo } : activo
      );
      setActivos(updatedActivos);

      // Volver a llamar a la API para obtener la lista actualizada
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
          <h1 className="h4">Tabla de Activos</h1>
          <input
            type="text"
            placeholder="Buscar activos..."
            value={searchQuery}
            onChange={handleSearch}
            className="form-control"
          />
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
                    <td colSpan="6" className="text-center">
                      No se encontraron activos.
                    </td>
                  </tr>
                ) : (
                  paginatedActivos.map((activo) => (
                    <tr key={activo.ID_ACT}>
                      <td>{activo.NOM_ACT}</td>
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

        {activoToEdit && (
          <div
            className="modal fade show"
            tabIndex="-1"
            style={{ display: "block" }}
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Editar Activo</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setActivoToEdit(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      name="NOM_ACT"
                      className="form-control"
                      value={updatedActivo.NOM_ACT || ""}
                      onChange={handleUpdateChange}
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
                      <option value="informático">Informático</option>
                      <option value="mueble">Mueble</option>
                      <option value="electrónico">Electrónico</option>
                      <option value="vehículo">Vehículo</option>
                      <option value="mobiliario de oficina">
                        Mobiliario de Oficina
                      </option>
                      <option value="herramienta">Herramienta</option>
                      <option value="equipamiento médico">
                        Equipamiento Médico
                      </option>
                      <option value="equipos de comunicación">
                        Equipos de Comunicación
                      </option>
                      <option value="instrumento de laboratorio">
                        Instrumento de Laboratorio
                      </option>
                      <option value="equipo de producción">
                        Equipo de Producción
                      </option>
                      <option value="equipo de seguridad">
                        Equipo de Seguridad
                      </option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ubicación</label>
                    <input
                      type="text"
                      name="UBI_ACT"
                      className="form-control"
                      value={updatedActivo.UBI_ACT || ""}
                      onChange={handleUpdateChange}
                    />
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
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActivoToEdit(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpdate}
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn btn-secondary mx-2"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
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
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivosTable;
