// ============================================================================
// Pasarela de Pagos — PassMaster (Modo Sandbox / Simulación Profesional)
// ============================================================================
// En producción, reemplazar las llamadas simuladas por el SDK real:
// Stripe:  stripe.paymentIntents.create / stripe.paymentIntents.confirm
// MercadoPago: sdk.payment.create
// Wompi:   wompi.createTransaction
// Manteniendo el mismo contrato de respuesta: { ok, ref, amount, receipt? }
// ============================================================================

const crypto = require('crypto');

// Tokens de prueba disponibles para el cliente
const TEST_TOKENS = {
  tok_visa: { ok: true, brand: 'Visa', last4: '4242' },
  tok_mastercard: { ok: true, brand: 'Mastercard', last4: '4444' },
  tok_amex: { ok: true, brand: 'American Express', last4: '1005' },
  tok_declined: { ok: false, reason: 'Tarjeta rechazada por el banco', code: 'card_declined' },
  tok_funds: { ok: false, reason: 'Fondos insuficientes', code: 'insufficient_funds' },
  tok_expired: { ok: false, reason: 'Tarjeta expirada', code: 'expired_card' },
  tok_fraud: { ok: false, reason: 'Transacción marcada como posible fraude', code: 'fraud_suspected' },
};

// Simula latencia de red variable (entre 600ms y 1.2s)
const networkDelay = () =>
  new Promise((r) => setTimeout(r, 600 + Math.random() * 600));

exports.charge = async ({ amount, token, orderId, currency = 'COP' }) => {
  await networkDelay(); // simula llamada a la pasarela externa

  const test = TEST_TOKENS[token];

  // Token no reconocido
  if (!test) {
    return {
      ok: false,
      reason: 'Token de pago inválido',
      code: 'invalid_token',
      receipt: null,
    };
  }

  // Pago rechazado por la pasarela
  if (!test.ok) {
    return {
      ok: false,
      reason: test.reason,
      code: test.code || 'payment_failed',
      receipt: null,
    };
  }

  // Pago aprobado — generar comprobante (receipt)
  const receipt = {
    id: `rcpt_${crypto.randomBytes(8).toString('hex')}`,
    orderId,
    amount,
    currency,
    status: 'succeeded',
    paymentMethod: {
      type: 'card',
      card: {
        brand: test.brand,
        last4: test.last4,
      },
    },
    createdAt: new Date().toISOString(),
    reference: `ch_${crypto.randomBytes(8).toString('hex')}_${orderId}`,
  };

  return {
    ok: true,
    ref: receipt.reference,
    amount,
    receipt,
  };
};

// Verifica el estado de un pago (útil para webhooks o consultas posteriores)
exports.verify = async ({ reference }) => {
  await networkDelay();
  return {
    reference,
    status: 'succeeded', // en sandbox siempre exitoso si existe la referencia
    verifiedAt: new Date().toISOString(),
  };
};

// Simula un webhook de notificación (para integración real futura)
exports.webhook = async ({ event, data }) => {
  await networkDelay();
  console.log(`[Webhook simulado] Evento: ${event} | Datos:`, data);
  return { received: true, event };
};
