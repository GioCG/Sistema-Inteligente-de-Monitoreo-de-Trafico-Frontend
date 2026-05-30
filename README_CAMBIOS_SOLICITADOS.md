# Cambios aplicados al frontend

## 1. Error 400 en `/requests/register-vehicle`
Se ajustó el formulario de solicitudes para enviar el `type` con los valores permitidos por el backend:

- `automovil`
- `motocicleta`
- `camion`
- `bus`
- `pickup`

También se normaliza la placa en mayúsculas y se muestran mensajes del backend usando `msg`, `message` o `errors[0].msg`.

## 2. Stream ESP32-CAM
Se agregó la página:

```txt
/stream
```

Visible para:

- ADMIN_ROLE
- OPERATOR_ROLE
- SECURITY_ROLE
- SYSTEM_ROLE

Variables `.env` recomendadas:

```env
VITE_ESP32_STREAM_URL=http://192.168.1.50/stream
VITE_ESP32_CAPTURE_URL=http://192.168.1.50/jpg
```

## 3. Login/Register pantalla completa
Se rediseñó el login/register para ocupar toda la pantalla. Se mantiene el efecto de transición partido en dos mitades: formulario e imagen/panel lateral.

## 4. Recuperación de contraseña
Se agregó la página:

```txt
/recover-password
```

Y el link desde el login: "¿Olvidaste tu contraseña?".

El frontend llama estas rutas:

```txt
POST /traffic-control/v1/auth/forgot-password
POST /traffic-control/v1/auth/reset-password
```

Si tu backend usa otros nombres, ajusta esas rutas en:

```txt
src/services/api.jsx
```

## 5. Build
Se validó con:

```bash
npm run build
```
