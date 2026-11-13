const Order = require('../models/orderModel');
const gateway = require('../services/paymentGateway');
const httpError = require('../utils/httpError');

// Paso 1: reservar cupos y crear el pedido.
exports.create = async (req, res, next) => {
  try {
    const qty = Number(req.body.quantity);
    if (!req.body.eventId || !Number.isInteger(qty) || qty < 1 || qty > 10)
      throw httpError(400, 'eventId y quantity (1-10) requeridos');
    res.status(201).json(await Order.reserve(req.user.id, req.body.eventId, qty));
  } catch (e) { next(e); }
};

// Paso 2: cobrar. Si se aprueba, se emiten los tickets; si no, se liberan los cupos.
exports.pay = async (req, res, next) => {
  try {
    const order = await Order.findOwned(req.params.id, req.user.id);
    if (!order) throw httpError(404, 'Pedido no encontrado');
    if (order.status !== 'PENDING') throw httpError(409, 'El pedido ya fue procesado');
    const result = await gateway.charge({ amount: order.total, token: req.body.paymentToken, orderId: order.id });
    if (!result.ok) {
      await Order.markFailed(order.id);
      throw httpError(402, result.reason);
    }
    const tickets = await Order.markPaid(order.id, result.ref);
    res.json({ status: 'PAID', paymentRef: result.ref, tickets });
  } catch (e) { next(e); }
};

exports.mine = async (req, res, next) => { try { res.json(await Order.findByUser(req.user.id)); } catch (e) { next(e); } };
