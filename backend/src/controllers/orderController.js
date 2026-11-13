const Order = require('../models/orderModel');
const gateway = require('../services/paymentGateway');
const httpError = require('../utils/httpError');

// Paso 1: reservar cupos y crear el pedido. Solo rol 'customer'.
exports.create = async (req, res, next) => {
  try {
    const qty = Number(req.body.quantity);
    if (!req.body.eventId || !Number.isInteger(qty) || qty < 1 || qty > 10)
      throw httpError(400, 'eventId y quantity (1-10) requeridos');
    res.status(201).json(await Order.reserve(req.user.id, req.body.eventId, qty));
  } catch (e) { next(e); }
};

// Paso 2: cobrar. Si se aprueba, se emiten los tickets; si no, se liberan los cupos.
// Devuelve el recibo de pago para mostrar al cliente.
exports.pay = async (req, res, next) => {
  try {
    const order = await Order.findOwned(req.params.id, req.user.id);
    if (!order) throw httpError(404, 'Pedido no encontrado');
    if (order.status !== 'PENDING') throw httpError(409, 'El pedido ya fue procesado');

    const result = await gateway.charge({
      amount: order.total,
      token: req.body.paymentToken,
      orderId: order.id,
    });

    if (!result.ok) {
      await Order.markFailed(order.id);
      throw httpError(402, result.reason || 'Pago rechazado');
    }

    const tickets = await Order.markPaid(order.id, result.ref);

    // Recibo enriquecido con datos del evento para mostrar al cliente
    const receipt = result.receipt
      ? { ...result.receipt, eventName: order.event_name, quantity: order.quantity }
      : null;

    res.json({
      status: 'PAID',
      paymentRef: result.ref,
      receipt,
      tickets,
    });
  } catch (e) { next(e); }
};

// Consulta el estado de un pago/pedido (flujo completo de pasarela)
exports.detail = async (req, res, next) => {
  try {
    const order = await Order.findOwned(req.params.id, req.user.id);
    if (!order) throw httpError(404, 'Pedido no encontrado');
    res.json({
      id: order.id,
      status: order.status,
      quantity: order.quantity,
      total: order.total,
      eventName: order.event_name,
      paymentRef: order.payment_ref,
      createdAt: order.created_at,
    });
  } catch (e) { next(e); }
};

exports.mine = async (req, res, next) => {
  try { res.json(await Order.findByUser(req.user.id)); } catch (e) { next(e); }
};
