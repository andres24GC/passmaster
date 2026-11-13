const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const httpError = require('../utils/httpError');

const sign = (u) => jwt.sign({ id: u.id, role: u.role, name: u.name }, process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES || '8h' });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 8)
      throw httpError(400, 'Nombre, email válido y contraseña de mín. 8 caracteres requeridos');
    if (await User.findByEmail(email)) throw httpError(409, 'El email ya está registrado');
    const id = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    const user = { id, name, role: 'customer' };
    res.status(201).json({ token: sign(user), user });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const u = await User.findByEmail(req.body.email || '');
    if (!u || !(await bcrypt.compare(req.body.password || '', u.password_hash)))
      throw httpError(401, 'Credenciales inválidas');
    res.json({ token: sign(u), user: { id: u.id, name: u.name, role: u.role } });
  } catch (e) { next(e); }
};

exports.me = async (req, res, next) => {
  try { res.json(await User.findById(req.user.id)); } catch (e) { next(e); }
};
