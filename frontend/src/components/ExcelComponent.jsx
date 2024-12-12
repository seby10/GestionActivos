import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const ExcelComponent = ({ onDataUpload }) => {
  const [file, setFile] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    NOM_ACT: "",
    MAR_ACT: "",
    MOD_ACT: "",
    CAT_ACT: "",
    UBI_ACT: "",
    EST_ACT: "",
    ID_PRO: "",
    PC_ACT: "",
  });
  const expectedFields = [
    "NOM_ACT",
    "MAR_ACT",
    "MOD_ACT",
    "CAT_ACT",
    "UBI_ACT",
    "EST_ACT",
    "ID_PRO",
  ];
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [proveedoresRes] = await Promise.all([
          axios.get("http://localhost:3000/api/proveedores"),
        ]);
        setProveedores(proveedoresRes.data);
        setLoading(false);
      } catch (err) {
        setError("Error al cargar los datos.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!formData.PC_ACT) {
      alert("El campo 'Proceso de compra' es obligatorio.");
      return;
    }

    if (file) {
      try {
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
          const data = e.target.result;
          const excel = XLSX.read(data, { type: "binary" });
          const sheetName = excel.SheetNames[0];
          const sheet = excel.Sheets[sheetName];

          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          const actualFields = jsonData[0];
          console.log("Primera fila del archivo:", actualFields);

          const missingFields = expectedFields.filter(
            (field) => !actualFields.includes(field)
          );
          if (missingFields.length > 0) {
            alert(`Faltan los siguientes campos: ${missingFields.join(", ")}`);
            return;
          }

          const rows = jsonData.slice(1);
          setExcelData({ headers: actualFields, rows });
          setShowPreview(true);
        };

        fileReader.readAsBinaryString(file);
      } catch (error) {
        console.error("Error leyendo el archivo", error);
      }
    } else {
      alert("No has seleccionado un archivo");
    }
  };

  const handleConfirmUpload = async () => {
    const activos = excelData.rows.map((row, index) => {
      console.log(`Fila ${index}:`, row);
      return {
        NOM_ACT: row[0],
        MAR_ACT: row[1],
        MOD_ACT: row[2],
        CAT_ACT: row[3],
        UBI_ACT: row[4],
        EST_ACT: row[5],
        ID_PRO: row[6],
        PC_ACT: formData.PC_ACT,
      };
    });
    console.log("Datos a enviar:", activos);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/activos/excel",
        activos
      );
      console.log("Respuesta de la API:", response.data);
      alert("Datos cargados exitosamente");
      onDataUpload();
      handleCloseModal();
    } catch (error) {
      console.error(
        "Error al cargar el archivo Excel:",
        error.response ? error.response.data : error.message
      );
      alert("Hubo un error al cargar los activos");
    }
  };

  const handleCloseModal = () => {
    setFile(null);
    setExcelData([]);
    setShowModal(false);
    setShowPreview(false);
    setStep(0);
    setFormData({
      NOM_ACT: "",
      MAR_ACT: "",
      MOD_ACT: "",
      CAT_ACT: "",
      UBI_ACT: "",
      EST_ACT: "",
      ID_PRO: "",
      PC_ACT: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "procesoCompra" || name == "PC_ACT") {
      const regex = /^PC\d*$/;
      if (regex.test(value)) {
        setFormData({
          ...formData,
          [name]: value,
        });
      } else {
        if (value.startsWith("PC")) {
          const correctedValue = "PC" + value.slice(2).replace(/\D/g, "");
          setFormData({
            ...formData,
            [name]: correctedValue,
          });
        } else {
          const correctedValue = "PC" + value.replace(/\D/g, "");
          setFormData({
            ...formData,
            [name]: correctedValue,
          });
        }
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmitForm = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/activos/individual",
        formData
      );
      console.log("Respuesta de la API:", response.data);
      alert("Activo subido exitosamente");
      onDataUpload();
      handleCloseModal();
    } catch (error) {
      console.error(
        "Error al subir el activo:",
        error.response ? error.response.data : error.message
      );
      alert("Hubo un error al subir el activo");
    }
  };

  return (
    <div className="d-flex align-items-center">
      <button
        className="btn btn-primary ms-3 d-flex align-items-center"
        onClick={() => setShowModal(true)}
      >
        Subir Activos
      </button>

      {showModal && (
        <div
          className="modal show"
          style={{ display: "block" }}
          tabIndex="-1"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {step === 0
                    ? "Elija una opción"
                    : step === 1
                    ? "Subir Activo"
                    : "Seleccionar archivo Excel"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {step === 0 && (
                  <div className="d-flex flex-column">
                    <button
                      className="btn btn-primary mb-3"
                      onClick={() => setStep(1)}
                    >
                      Subir Activo
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setStep(2)}
                    >
                      Subir Archivo Excel
                    </button>
                  </div>
                )}
                {step === 1 && (
                  <form>
                    <div className="mb-3">
                      <label htmlFor="PC_ACT" className="form-label">
                        Proceso de compra
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="PC_ACT"
                        name="PC_ACT"
                        value={formData.PC_ACT}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="NOM_ACT" className="form-label">
                        Nombre del activo
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="NOM_ACT"
                        name="NOM_ACT"
                        value={formData.NOM_ACT}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="MAR_ACT" className="form-label">
                        Marca del activo
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="MAR_ACT"
                        name="MAR_ACT"
                        value={formData.MAR_ACT}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="MOD_ACT" className="form-label">
                        Modelo del activo
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="MOD_ACT"
                        name="MOD_ACT"
                        value={formData.MOD_ACT}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="CAT_ACT" className="form-label">
                        Categoría activo
                      </label>
                      <select
                        name="CAT_ACT"
                        className="form-select"
                        value={formData.CAT_ACT || ""}
                        onChange={handleInputChange}
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
                      <label htmlFor="UBI_ACT" className="form-label">
                        Ubicación del activo
                      </label>
                      <select
                        name="UBI_ACT"
                        className="form-select"
                        value={formData.UBI_ACT || ""}
                        onChange={handleInputChange}
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
                      <label htmlFor="EST_ACT" className="form-label">
                        Estado del activo
                      </label>
                      <select
                        name="EST_ACT"
                        className="form-select"
                        value={formData.EST_ACT || ""}
                        onChange={handleInputChange}
                      >
                        <option value="disponible">Disponible</option>
                        <option value="mantenimiento">Mantenimiento</option>
                        <option value="asignado">Asignado</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="ID_PRO" className="form-label">
                        Proveedor
                      </label>
                      <select
                        className="form-select"
                        id="ID_PRO"
                        name="ID_PRO"
                        value={formData.ID_PRO || ""}
                        onChange={handleInputChange}
                      >
                        <option value="">Seleccione un proveedor</option>
                        {proveedores.map((proveedor) => (
                          <option key={proveedor.ID_PRO} value={proveedor.ID_PRO}>
                            {proveedor.NOM_PRO}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleSubmitForm}
                    >
                      Subir Activo
                    </button>
                  </form>
                )}
                {step === 2 && !showPreview && (
                  <form onSubmit={handleFileUpload}>
                    <div className="mb-3">
                      <label htmlFor="PC_ACT" className="form-label">
                        Proceso de compra
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="PC_ACT"
                        name="PC_ACT"
                        value={formData.PC_ACT}
                        onChange={handleInputChange}
                      />
                    </div>
                    <input
                      id="file-input"
                      type="file"
                      onChange={handleFileChange}
                      className="form-control"
                      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    />
                    <button className="btn btn-success mt-3" type="submit">
                      Subir archivo
                    </button>
                  </form>
                )}
                {step === 2 && showPreview && (
                  <div>
                    <h5>Vista previa de los datos</h5>
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          {excelData.headers.map((col, index) => (
                            <th key={index}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {excelData.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button
                      className="btn btn-success"
                      onClick={handleConfirmUpload}
                    >
                      Confirmar Carga
                    </button>
                    <button
                      className="btn btn-secondary ml-2"
                      onClick={handleCloseModal}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelComponent;
