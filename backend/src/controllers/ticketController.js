const Ticket = require('../models/ticketModel');
const httpError = require('../utils/httpError');

exports.mine = async (req, res, next) => { try { res.json(await Ticket.findByUser(req.user.id)); } catch (e) { next(e); } };

// Consulta el estado sin consumir el ticket.
exports.lookup = async (req, res, next) => {
  try {
    const t = await Ticket.findByCode(req.params.code);
    if (!t) throw httpError(404, 'Ticket no encontrado');
    res.json({ code: t.code, status: t.status, event: t.event_name, checked_in_at: t.checked_in_at });
  } catch (e) { next(e); }
};

// Check-in: valida y marca el ticket como USED de forma atómica.
exports.checkin = async (req, res, next) => {
  try {
    const { code, eventId } = req.body;
    if (!code) throw httpError(400, 'code requerido');
    if (await Ticket.consume(code, req.user.id, eventId))
      return res.json({ valid: true, message: 'Acceso permitido' });
    const t = await Ticket.findByCode(code);
    if (!t) throw httpError(404, 'Ticket no existe');
    if (eventId && t.event_id !== Number(eventId)) throw httpError(409, 'El ticket es de otro evento');
    if (t.status === 'USED') throw httpError(409, `Ticket ya utilizado (${t.checked_in_at})`);
    throw httpError(409, `Ticket no válido: ${t.status}`);
  } catch (e) { next(e); }
};
