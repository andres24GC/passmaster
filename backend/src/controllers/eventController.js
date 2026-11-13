const Event = require('../models/eventModel');
const httpError = require('../utils/httpError');

exports.list = async (_req, res, next) => { try { res.json(await Event.findAll()); } catch (e) { next(e); } };

exports.get = async (req, res, next) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) throw httpError(404, 'Evento no encontrado');
    res.json(ev);
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, venue, starts_at, capacity, price } = req.body;
    if (!name || !venue || !starts_at || !(capacity > 0) || !(price >= 0))
      throw httpError(400, 'name, venue, starts_at, capacity (>0) y price (>=0) son requeridos');
    const id = await Event.create(req.body, req.user.id);
    res.status(201).json(await Event.findById(id));
  } catch (e) { next(e); }
};

exports.dashboard = async (_req, res, next) => { try { res.json(await Event.dashboard()); } catch (e) { next(e); } };
