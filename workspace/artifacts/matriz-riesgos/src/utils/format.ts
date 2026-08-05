export function getPerfilColor(perfil: string | undefined | null) {
  if (!perfil) return "default";
  const p = perfil.toUpperCase();
  if (p === "ACEPTABLE" || p === "BAJO") return "success";
  if (p === "TOLERABLE") return "warning";
  if (p === "MODERADO" || p === "ALTO") return "danger";
  if (p === "CRÍTICO" || p === "EXTREMO") return "destructive";
  return "default";
}

export function formatPerfil(perfil: string | undefined | null) {
  if (!perfil) return "-";
  return perfil;
}

export function formatNumber(num: number | undefined | null) {
  if (num === null || num === undefined) return "-";
  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
}
