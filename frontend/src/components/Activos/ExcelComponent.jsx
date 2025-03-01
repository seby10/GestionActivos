import React, { useState, useEffect } from "react";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";
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
    COD_ACT: "",
    NOM_ACT: "",
    MAR_ACT: "",
    CAT_ACT: "",
    UBI_ACT: "",
    EST_ACT: "",
    ID_PRO: "",
    PC_ACT: "",
  });
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const expectedExcelFields = [
    "COD_ACT",
    "NOM_ACT",
    "MAR_ACT",
    "CAT_ACT",
    "UBI_ACT",
    "EST_ACT",
    "ID_PRO",
  ];

  const requiredFormFields = [
    "COD_ACT",
    "NOM_ACT",
    "MAR_ACT",
    "CAT_ACT",
    "UBI_ACT",
    "EST_ACT",
    "ID_PRO",
    "PC_ACT",
  ];
  // Cargar proveedores desde localStorage o desde la API
  useEffect(() => {
    const storedProveedores = localStorage.getItem("proveedores");

    if (storedProveedores) {
      setProveedores(JSON.parse(storedProveedores));
      setLoading(false); // No hay necesidad de hacer una solicitud si ya están en el localStorage
    } else {
      fetchProveedoresFromAPI();
    }
  }, []);

  const fetchProveedoresFromAPI = async () => {
    try {
      setLoading(true);
      const proveedoresRes = await axios.get(
        "http://localhost:3000/api/proveedores"
      );
      setProveedores(proveedoresRes.data);
      localStorage.setItem("proveedores", JSON.stringify(proveedoresRes.data)); // Guardar en localStorage
      setLoading(false);
    } catch (err) {
      setError("Error al cargar los datos.");
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const regex = /^PC\d+$/;
    if (!regex.test(formData.PC_ACT)) {
      setAlertMessage("El campo 'Proceso de compra' es obligatorio.");
      setAlertSeverity("error");
      setShowAlert(true);
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

          const missingFields = expectedExcelFields.filter(
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
      setAlertMessage("No has seleccionado un archivo.");
      setAlertSeverity("error");
      setShowAlert(true);
    }
  };
  const handleConfirmUpload = async () => {
    console.log("Datos del Excel:", excelData);

    const activos = excelData.rows
      .filter(
        (row) =>
          row[0] && row[1] && row[2] && row[3] && row[4] && row[5] && row[6]
      )
      .map((row) => ({
        COD_ACT: row[0],
        NOM_ACT: row[1],
        MAR_ACT: row[2],
        CAT_ACT: row[3],
        UBI_ACT: row[4],
        EST_ACT: row[5],
        ID_PRO: row[6],
        PC_ACT: formData.PC_ACT,
      }));

    try {
      const response = await axios.post(
        "http://localhost:3000/api/activos/excel",
        activos
      );

      if (response.data.duplicados && response.data.duplicados.length > 0) {
        const duplicadosMensaje = `Existen los siguientes activos duplicados: ${response.data.duplicados.join(
          ", "
        )}. No se puede proceder con la carga.`;
        setAlertMessage(duplicadosMensaje);
        setAlertSeverity("warning");
      } else {
        setAlertMessage(response.data.message);
        setAlertSeverity("success");
        localStorage.removeItem("activos");
      }
      setShowAlert(true);

      setShowModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.duplicados
        ? `Se encontraron los siguientes activos duplicados: ${error.response.data.duplicados.join(
            ", "
          )}.`
        : "Hubo un error al cargar los activos";

      setAlertMessage(errorMessage);
      setAlertSeverity(error.response?.data?.duplicados ? "warning" : "error");
      setShowAlert(true);

      setShowModal(false);
    }
  };

  const handleCloseModal = () => {
    setFile(null);
    setExcelData([]);
    setShowModal(false);
    setShowPreview(false);
    setStep(0);
    setFormData({
      COD_ACT: "",
      NOM_ACT: "",
      MAR_ACT: "",
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
    if (requiredFormFields.some((field) => !formData[field])) {
      setAlertMessage("Por favor, completa todos los campos requeridos");
      setAlertSeverity("error");
      setShowAlert(true);
      return;
    }

    const regex = /^PC\d+$/;
    if (!regex.test(formData.PC_ACT)) {
      setAlertMessage(
        "El número de la PC debe tener el formato 'PC' seguido de un número"
      );
      setAlertSeverity("error");
      setShowAlert(true);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/activos/individual",
        formData
      );
      setAlertMessage("Activo subido exitosamente");
      setAlertSeverity("success");
      setShowAlert(true);
      onDataUpload();
      handleCloseModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error desconocido";
      setAlertMessage(`Hubo un error: ${errorMessage}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  };

  return (
    <div className="d-flex align-items-center">
      <button
        className="btn ms-3 d-flex align-items-center"
        style={{ backgroundColor: "#1976d2", color: "white", border: "none" }}
        onClick={() => setShowModal(true)}
      >
        <i className="bi bi-plus-circle me-2"></i> AGREGAR ACTIVO
      </button>

      {showModal && (
        <div
          className="modal show"
          style={{
            display: "block",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
          tabIndex="-1"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <div className="w-100">
                  <h5 className="modal-title text-center">
                    {step === 0
                      ? "Agregar Nuevo Activo"
                      : step === 1
                      ? "Subir Activo"
                      : "Seleccionar archivo Excel"}
                  </h5>
                  {step === 0 && (
                    <p className="text-muted mt-2">
                      Añada un nuevo activo individualmente o cargue un archivo
                      Excel.
                    </p>
                  )}
                </div>
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
                    <div className="d-flex justify-content-between mb-3">
                      <button
                        className="btn btn-white me-3"
                        onClick={() => setStep(1)}
                        style={{
                          border: "1px solid #ccc",
                          borderRadius: "5px",
                          padding: "8px 10px",
                          fontSize: "15px",
                          width: "48%",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                        }}
                      >
                        Subir Activo
                      </button>
                      <button
                        className="btn btn-white"
                        onClick={() => setStep(2)}
                        style={{
                          border: "1px solid #ccc",
                          borderRadius: "5px",
                          padding: "8px 10px",
                          fontSize: "15px",
                          width: "48%",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                        }}
                      >
                        Subir Por Lote
                      </button>
                    </div>
                  </div>
                )}
                {step === 1 && (
                  <form>
                    <div className="mb-3">
                      <label htmlFor="COD_ACT" className="form-label">
                        Código de Activo
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="COD_ACT"
                        name="COD_ACT"
                        value={formData.COD_ACT}
                        onChange={handleInputChange}
                      />
                    </div>
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
                      <label htmlFor="MAR_ACT">Marca del Activo</label>
                      <select
                        name="MAR_ACT"
                        className="form-select"
                        value={formData.MAR_ACT || ""}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccione la Marca</option>
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
                        <option value="General Electric">
                          General Electric
                        </option>
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
                      <label htmlFor="CAT_ACT" className="form-label">
                        Categoría activo
                      </label>
                      <select
                        name="CAT_ACT"
                        className="form-select"
                        value={formData.CAT_ACT || ""}
                        onChange={handleInputChange}
                      >
                        <option value="">Seleccione la Categoría</option>
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
                        <option value="">Seleccione la Ubicación</option>
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
                      <label htmlFor="EST_ACT" className="form-label">
                        Estado del activo
                      </label>
                      <select
                        name="EST_ACT"
                        className="form-select"
                        value={formData.EST_ACT || ""}
                        onChange={handleInputChange}
                      >
                        <option value="">Seleccione el estado</option>
                        <option value="Disponible">Disponible</option>
                        <option value="Defectuoso">Defectuoso</option>
                        <option value="No Disponible">No Disponible</option>
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
                          <option
                            key={proveedor.ID_PRO}
                            value={proveedor.ID_PRO}
                          >
                            {proveedor.NOM_PRO}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      className="btn btn-dark w-100"
                      onClick={handleSubmitForm}
                      disabled={
                        requiredFormFields.some((field) => !formData[field]) ||
                        !/^PC\d+$/.test(formData.PC_ACT)
                      }
                    >
                      Guardar Activo
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
                    <button
                      className="btn mt-3"
                      type="submit"
                      style={{
                        borderRadius: "5px",
                        padding: "8px 10px",
                        fontSize: "15px",
                        width: "100%",
                        backgroundColor: "black",
                        color: "white",
                      }}
                    >
                      <i
                        className="bi bi-upload"
                        style={{ marginRight: "8px" }}
                      ></i>
                      Cargar Archivo
                    </button>
                  </form>
                )}
                {step === 2 && showPreview && (
                  <div>
                    <h5>Vista previa de los datos</h5>
                    <div className="table-responsive">
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
                    </div>
                    <button
                      className="btn btn-success  btn btn-dark w-100"
                      onClick={handleConfirmUpload}
                    >
                      Confirmar Carga
                    </button>
                    {/* <button
                      className="btn btn-secondary ml-2"
                      onClick={handleCloseModal}
                    >
                      Cancelar
                    </button> */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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

export default ExcelComponent;
