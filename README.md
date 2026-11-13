# 🎟 PassMaster — Sistema de Ticketing y Acceso a Eventos

Plataforma web para crear eventos, vender boletos digitales con QR y controlar el acceso (check-in) con monitoreo de aforo en tiempo real.

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express (patrón MVC) |
| Base de datos | MySQL 8 (InnoDB, transacciones) |
| Seguridad | JWT, bcrypt (12 rondas), helmet, rate-limit, roles |

## Requisitos
Node 18+ (recomendado 20), MySQL 8+.

## Instalación

```bash
# 1) Backend
cd backend
cp .env.example .env        # edita credenciales MySQL y JWT_SECRET
npm install
npm run db:init             # crea la BD y tablas (src/db/schema.sql)
npm run seed                # usuarios admin/staff + evento de ejemplo
npm run dev                 # http://localhost:4000

# 2) Frontend (otra terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Usuarios de prueba (seed): `admin@passmaster.test / Admin123!` · `staff@passmaster.test / Staff123!`.
Los clientes se registran desde la web (rol `customer`).

## Arquitectura (MVC)

```
backend/src
├── models/        Acceso a datos y transacciones SQL (M)
├── controllers/   Lógica de petición/respuesta y reglas de negocio (C)
├── routes/        Mapa de endpoints
├── middleware/    JWT, roles, errores
├── services/      Pasarela de pagos (intercambiable)
└── db/            schema.sql, init, seed
frontend/src
├── pages/         Vistas (V)        ├── components/  UI reutilizable
├── api.js         Cliente HTTP      └── auth.jsx     Contexto de sesión
```
Vista = React; la API REST actúa como capa Controlador/Modelo.

## Garantías clave
- **Unicidad de tickets:** UUID v4 (`crypto.randomUUID`) + `UNIQUE KEY` en MySQL.
- **Sin sobreventa:** `SELECT … FOR UPDATE` sobre el evento dentro de una transacción + `CHECK (sold <= capacity)`.
- **Check-in sin doble uso:** `UPDATE … WHERE status='VALID'` atómico; si dos escaneos coinciden, solo uno afecta la fila.
- **Pago:** reserva → cobro → emisión de tickets; si el pago falla se liberan los cupos.

## Pasarela de pagos
`services/paymentGateway.js` implementa un **sandbox** (tokens `tok_visa`, `tok_declined`, `tok_funds`) con el flujo
tokenización → cargo → confirmación. Para producción se sustituye `charge()` por el SDK de Stripe/MercadoPago/Wompi
(mismo contrato) y se añade un webhook de confirmación. *No se procesan pagos reales en esta entrega.*

## Git
El repositorio incluido tiene el historial de construcción inicial. Se recomienda continuar con al menos un commit
diario y mensajes tipo Conventional Commits (`feat:`, `fix:`, `docs:`).

## Mejoras futuras
Expiración automática de pedidos PENDING, escaneo de QR con cámara, WebSockets para el dashboard, tests automatizados.
