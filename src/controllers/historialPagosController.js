const historialPagosService = require("../services/historialPagosService");
const fechaValida = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && (() => {
  const [y,m,d] = v.split("-").map(Number);
  const f = new Date(Date.UTC(y,m-1,d));
  return y >= 1000 && f.getUTCFullYear() === y && f.getUTCMonth() === m-1 && f.getUTCDate() === d;
})();
exports.getHistorialPagos = async (req, res) => {
  try {
    const { busqueda = "", fechaInicio, fechaFin, iddoctor, pagina = "1", exportar, anio, periodo = "hoy" } = req.query;
    const numeroPagina = Number(pagina);
    if (!Number.isSafeInteger(numeroPagina) || numeroPagina < 1) return res.status(400).json({error:"Página inválida"});
    if (typeof busqueda !== "string" || !["hoy","ayer","semana","mes","mes_pasado","fecha","rango","anio"].includes(periodo)) return res.status(400).json({error:"Filtro inválido"});
    if (iddoctor && (!Number.isSafeInteger(Number(iddoctor)) || Number(iddoctor) < 1)) return res.status(400).json({error:"Doctor inválido"});
    if (!busqueda.trim()) {
      if (periodo === "fecha" && !fechaValida(fechaInicio)) return res.status(400).json({error:"Fecha inválida"});
      if (periodo === "rango" && (!fechaValida(fechaInicio) || !fechaValida(fechaFin) || fechaInicio > fechaFin)) return res.status(400).json({error:"Rango inválido"});
      if (periodo === "anio" && (!Number.isInteger(Number(anio)) || Number(anio) < 1000 || Number(anio) > 9998)) return res.status(400).json({error:"Año inválido"});
    }
    res.json(await historialPagosService.getHistorialPagos({busqueda:busqueda.trim(), periodo, fechaInicio, fechaFin, anio, iddoctor, pagina:numeroPagina, exportar:exportar === "true"}));
  } catch (err) { console.error("Error al obtener historial de pagos:", err); res.status(500).send(err.message); }
};
exports.getDoctores = async (req,res) => {
  try { res.json(await historialPagosService.getDoctores()); }
  catch (err) { res.status(500).send(err.message); }
};
