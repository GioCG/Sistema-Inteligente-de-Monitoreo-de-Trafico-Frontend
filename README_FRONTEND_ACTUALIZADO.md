# Frontend actualizado - Sistema Inteligente de Monitoreo de Tráfico

## Qué se agregó

- Login con fondo completo y transición conservada entre login/registro.
- Navegación con sidebar que cambia según el rol autenticado.
- Páginas funcionales para:
  - Dashboard
  - Eventos
  - Vehículos
  - Evidencias
  - Multas
  - Solicitudes
  - Perfil
- Protección de rutas por rol.
- Lectura automática del token JWT desde `localStorage` y envío por header `x-token`.
- Configuración del backend mediante `.env`.

## Roles esperados

| role_id | Rol |
|---:|---|
| 1 | ADMIN_ROLE |
| 2 | OPERATOR_ROLE |
| 3 | SECURITY_ROLE |
| 4 | CITIZEN_ROLE |
| 5 | SYSTEM_ROLE |

## Configuración

Crea un archivo `.env` en la raíz del frontend:

```env
VITE_API_BASE_URL=http://192.168.1.7:3000/traffic-control/v1/
```

Cambia la IP por la IP real donde está corriendo tu backend.

## Instalación

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Nota importante del backend

Este frontend usa las rutas CRUD:

- `POST /traffic-control/v1/auth/login`
- `POST /traffic-control/v1/auth/register`
- `GET/POST /traffic-control/v1/events`
- `GET/POST /traffic-control/v1/evidence`
- `GET/POST /traffic-control/v1/fines`
- `GET/POST/DELETE /traffic-control/v1/vehicles`
- `GET/POST/PUT /traffic-control/v1/requests`

Si alguna página no carga datos, revisa primero que esa ruta exista en el backend y que el rol del usuario tenga permisos para consumirla.
