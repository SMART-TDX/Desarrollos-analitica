import React, { useState, useEffect } from "react";
import { getStoredData, saveStoredData, Riesgo, Parámetro } from "../lib/storage";
import { INITIAL_DATA } from "../lib/initialData";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRiskSaved: () => void;
}

export const NuevoRiesgoModal: React.FC<Props> = ({ isOpen, onClose, onRiskSaved }) => {
  const [procesos, setProcesos] = useState<string[]>([]);
  const [subprocesos, setSubprocesos] = useState<string[]>([]);
  const [factoresRiesgo, setFactoresRiesgo] = useState<string[]>([]);

  // Estado del formulario
  const [codigo, setCodigo] = useState("");
  const [proceso, setProceso] = useState("");
  const [subproceso, setSubproceso] = useState("");
  const [factorRiesgo, setFactorRiesgo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [pi, setPi] = useState<number>(1);
  const [ii, setIi] = useState<number>(1);

  // Cargar listas desplegables al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const parametros = getStoredData<Parámetro[]>("parametros", INITIAL_DATA.parametros);
      
      setProcesos(
        parametros.filter((p) => p.categoria === "PROCESO").map((p) => p.nombre)
      );
      setSubprocesos(
        parametros.filter((p) => p.categoria === "SUBPROCESO").map((p) => p.nombre)
      );
      setFactoresRiesgo(
        parametros.filter((p) => p.categoria === "FACTOR_RIESGO").map((p) => p.nombre)
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Cálculo sencillo de Perfil Inherente
  const calcularPerfil = (p: number, i: number) => {
    const score = p * i;
    if (score <= 4) return "ACEPTABLE";
    if (score <= 9) return "TOLERABLE";
    if (score <= 14) return "MODERADO";
    if (score <= 19) return "ALTO";
    return "CRÍTICO";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const riesgosExistentes = getStoredData<Riesgo[]>("riesgos", INITIAL_DATA.riesgos);

    const nuevoRiesgo: Riesgo = {
      id: Date.now(),
      codigo: codigo || `R-LAFT00${riesgosExistentes.length + 1}`,
      proceso,
      subproceso,
      factorRiesgo,
      descripcion,
      pi: Number(pi),
      ii: Number(ii),
      perfilInherente: calcularPerfil(Number(pi), Number(ii)),
      efectividad: "0.00 %",
    };

    const riesgosActualizados = [...riesgosExistentes, nuevoRiesgo];
    saveStoredData("riesgos", riesgosActualizados);

    onRiskSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Nuevo Riesgo LAFT</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Código del Riesgo</label>
            <input
              type="text"
              placeholder="Ej. R-LAFT001"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Proceso</label>
              <select
                value={proceso}
                onChange={(e) => setProceso(e.target.value)}
                className="mt-1 block w-full border rounded-md p-2"
                required
              >
                <option value="">Seleccione un proceso...</option>
                {procesos.map((p, idx) => (
                  <option key={idx} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Subproceso</label>
              <select
                value={subproceso}
                onChange={(e) => setSubproceso(e.target.value)}
                className="mt-1 block w-full border rounded-md p-2"
              >
                <option value="">Seleccione un subproceso...</option>
                {subprocesos.map((sp, idx) => (
                  <option key={idx} value={sp}>{sp}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Factor de Riesgo</label>
            <select
              value={factorRiesgo}
              onChange={(e) => setFactorRiesgo(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
            >
              <option value="">Seleccione un factor...</option>
              {factoresRiesgo.map((f, idx) => (
                <option key={idx} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción del Riesgo</label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Probabilidad Inherente (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={pi}
                onChange={(e) => setPi(Number(e.target.value))}
                className="mt-1 block w-full border rounded-md p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Impacto Inherente (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={ii}
                onChange={(e) => setIi(Number(e.target.value))}
                className="mt-1 block w-full border rounded-md p-2"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800"
            >
              Guardar Riesgo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};