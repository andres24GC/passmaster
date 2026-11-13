# Guía de usuario

## Cliente
1. **Regístrate** en *Ingresar → ¿No tienes cuenta?* (contraseña mínimo 8 caracteres).
2. En **Eventos** pulsa **Comprar**, elige cantidad (1–10) y tarjeta de prueba, y pulsa **Pagar**.
   - `4242…` aprobada · `4000 0000 0000 0002` rechazada · `…9995` sin fondos.
3. Si el pago es aprobado, verás tus boletos en **Mis tickets**, cada uno con **QR y código único**.
4. Presenta el QR en la entrada. El estado cambia a `USED` tras ingresar; cada ticket sirve una sola vez.

## Personal de acceso (staff)
1. Inicia sesión y abre **Check-in**.
2. Escanea con un lector de códigos (actúa como teclado) o pega el código y pulsa **Validar**.
3. Pantalla **verde**: acceso permitido. Pantalla **roja**: ticket inexistente, ya utilizado, cancelado o de otro evento (el mensaje indica el motivo).

## Administrador
1. **Dashboard**: barra de aforo por evento (ingresados / por ingresar / disponibles), actualizada cada 5 segundos.
2. **Crear evento**: nombre, lugar, fecha/hora, capacidad, precio y descripción.

## Problemas frecuentes
| Síntoma | Solución |
|---|---|
| "Cupos insuficientes" | Otro comprador tomó los últimos cupos; reduce la cantidad |
| "Ticket ya utilizado" | El código ya fue escaneado; verifica la hora indicada |
| "Token inválido o expirado" | Vuelve a iniciar sesión (el JWT dura 8 h) |
