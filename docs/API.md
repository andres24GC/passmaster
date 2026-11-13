# Documentación de la API — PassMaster

Base URL: `http://localhost:4000/api` · Formato JSON · Autenticación: `Authorization: Bearer <JWT>`.
Errores: `{ "error": "mensaje" }` con el código HTTP correspondiente (400, 401, 402, 403, 404, 409, 500).

Roles: `customer`, `staff`, `admin`.

## Auth
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/auth/register` | Público | Crea cuenta `customer`. Body: `{name,email,password(min 8)}` → `201 {token,user}` |
| POST | `/auth/login` | Público | Body: `{email,password}` → `200 {token,user}`; `401` si credenciales inválidas |
| GET | `/auth/me` | Autenticado | Datos del usuario actual |

## Eventos
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/events` | Público | Lista eventos próximos con `available` |
| GET | `/events/:id` | Público | Detalle; `404` si no existe |
| POST | `/events` | admin | Body: `{name,venue,starts_at,capacity,price,description?}` → `201` evento |
| GET | `/admin/dashboard` | admin | Aforo por evento: `capacity, sold, available, checked_in, pending_entry` |

## Pedidos y pago
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/orders` | Autenticado | Reserva cupos. Body: `{eventId, quantity(1-10)}` → `201 {id,total,status:"PENDING"}`; `409` sin cupo |
| POST | `/orders/:id/pay` | Dueño del pedido | Body: `{paymentToken}` (`tok_visa`, `tok_declined`, `tok_funds`). Éxito → `200 {status:"PAID",paymentRef,tickets:[uuid]}`; rechazo → `402` y se liberan cupos; `409` si ya procesado |
| GET | `/orders/mine` | Autenticado | Pedidos del usuario |

## Tickets
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/tickets/mine` | Autenticado | Tickets del usuario (`code,status,event_name,venue,starts_at`) |
| GET | `/tickets/:code` | staff, admin | Consulta estado sin consumirlo |
| POST | `/tickets/checkin` | staff, admin | Body: `{code, eventId?}`. `200 {valid:true}` y pasa a `USED`; `404` no existe; `409` ya usado / otro evento / cancelado |

Estados de ticket: `VALID → USED` (también `CANCELLED`). Estados de pedido: `PENDING → PAID | FAILED`.

## Ejemplo (cURL)
```bash
TOKEN=$(curl -s -X POST localhost:4000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@passmaster.test","password":"Admin123!"}' | jq -r .token)
curl -X POST localhost:4000/api/orders -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"eventId":1,"quantity":2}'
```
