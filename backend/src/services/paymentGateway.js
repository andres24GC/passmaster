// Pasarela de pagos (modo sandbox). Simula el flujo de un proveedor tipo Stripe:
// el cliente tokeniza la tarjeta en el frontend y el servidor sólo recibe el token.
// Para producción, reemplazar el cuerpo de charge() por la llamada al SDK real
// (p. ej. stripe.paymentIntents.create/confirm) manteniendo la misma firma.
const crypto = require('crypto');

const TEST_TOKENS = {
  tok_visa: { ok: true },
  tok_declined: { ok: false, reason: 'Tarjeta rechazada' },
  tok_funds: { ok: false, reason: 'Fondos insuficientes' },
};

exports.charge = async ({ amount, token, orderId }) => {
  await new Promise((r) => setTimeout(r, 400)); // latencia de red simulada
  const res = TEST_TOKENS[token];
  if (!res) return { ok: false, reason: 'Token de pago inválido' };
  if (!res.ok) return res;
  return { ok: true, ref: `ch_${crypto.randomBytes(8).toString('hex')}_${orderId}`, amount };
};
