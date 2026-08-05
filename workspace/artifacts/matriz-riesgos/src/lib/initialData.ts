// src/lib/initialData.ts

export const INITIAL_DATA = {
  parametros: [
    // Procesos
    { id: 1, categoria: "PROCESO", nombre: "GESTION ADMINISTRATIVA Y FINANCIERA", valor: 0 },
    { id: 2, categoria: "PROCESO", nombre: "Gestión Académica", valor: 0 },
    { id: 3, categoria: "PROCESO", nombre: "Gestión Comercial", valor: 0 },
    { id: 4, categoria: "PROCESO", nombre: "Gestión Humana", valor: 0 },
    { id: 5, categoria: "PROCESO", nombre: "Gestión Jurídica", valor: 0 },
    { id: 6, categoria: "PROCESO", nombre: "Gestión de Tecnología", valor: 0 },
    
    // Subprocesos
    { id: 7, categoria: "SUBPROCESO", nombre: "CARTERA", valor: 0 },
    { id: 8, categoria: "SUBPROCESO", nombre: "COMERCIAL-TELEMERCADEO-VENTAS", valor: 0 },
    { id: 9, categoria: "SUBPROCESO", nombre: "COMPRAS", valor: 0 },
    { id: 10, categoria: "SUBPROCESO", nombre: "CONTABILIDAD", valor: 0 },
    { id: 11, categoria: "SUBPROCESO", nombre: "INSTITUTO", valor: 0 },
    
    // Factores de Riesgo
    { id: 12, categoria: "FACTOR_RIESGO", nombre: "ALIADOS ESTRATÉGICOS", valor: 0 },
    { id: 13, categoria: "FACTOR_RIESGO", nombre: "CANALES DE DISTRIBUCIÓN", valor: 0 },
    { id: 14, categoria: "FACTOR_RIESGO", nombre: "Colaboradores", valor: 0 },
    { id: 15, categoria: "FACTOR_RIESGO", nombre: "EMPLEADOS", valor: 0 },
    { id: 16, categoria: "FACTOR_RIESGO", nombre: "ESTUDIANTES", valor: 0 },
    { id: 17, categoria: "FACTOR_RIESGO", nombre: "PRODUCTOS Y SERVICIOS", valor: 0 },
    { id: 18, categoria: "FACTOR_RIESGO", nombre: "PROVEEDORES", valor: 0 },
    { id: 19, categoria: "FACTOR_RIESGO", nombre: "TECNOLÓGICO", valor: 0 },
  ],
  
  riesgos: [
    {
      id: 1,
      codigo: "R-LAFT001",
      proceso: "Gestión Comercial",
      descripcion: "Posibilidad de vincular...",
      pi: 3,
      ii: 3,
      perfilInherente: "TOLERABLE",
      efectividad: "0,39 %",
    },
    {
      id: 2,
      codigo: "R-LAFT002",
      proceso: "GESTION ADMINISTRATIVA Y FINANCIERA",
      descripcion: "Posibilidad de recibir recursos...",
      pi: 3,
      ii: 4,
      perfilInherente: "MODERADO",
      efectividad: "0,36 %",
    },
    // ... aquí almacenaremos la lista completa de riesgos
  ],

  controles: [
    { id: 1, codigo: "CTR-LAFT-01", descripcion: "Consulta en las listas para todas las personas...", atributos: ["PREVENTIVO", "SEMIAUTOMÁTICO", "PERMANENTE"], ponderacion: "0,425 %" },
    { id: 2, codigo: "CTR-LAFT-02", descripcion: "Aceptación de cláusula SAGRILAFT...", atributos: ["PREVENTIVO", "SEMIAUTOMÁTICO", "PERMANENTE"], ponderacion: "0,425 %" },
    // ... restode controles (26 activos)
  ]
};