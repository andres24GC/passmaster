// Autenticación JWT y autorización por rol.
const jwt = require('jsonwebtoken');
const httpError = require('../utils/httpError');

exports.authenticate = (req, _res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return next(httpError(401, 'Token requerido'));
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role, name }
    next();
  } catch {
    next(httpError(401, 'Token inválido o expirado'));
  }
};

exports.authorize = (...roles) => (req, _res, next) =>
  roles.includes(req.user.role) ? next() : next(httpError(403, 'Permisos insuficientes'));
