// Manejo centralizado de errores; no filtra detalles internos en 500.
module.exports = (err, _req, res, _next) => {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Error interno del servidor' : err.message });
};
