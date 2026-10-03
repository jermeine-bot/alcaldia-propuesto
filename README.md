#  Portal Institucional, Panel Administrativo y Backend — Alcaldía Municipal de León, Nicaragua

Bienvenido a la documentación oficial y actualizada del sistema web completo de la **Alcaldía Municipal de León, Nicaragua**. 

Este proyecto se compone de una aplicación web fullstack:
1. **Frontend (SPA)**: Desarrollado con **React 19** + **Vite 8**, que incluye un portal público ciudadano de alto impacto visual y un **Panel Administrativo (CMS Dashboard)**.
2. **Backend (API REST)**: Desarrollado con **Node.js** + **Express.js**. Algunas secciones usan Firebase Firestore; Centros de Atención y Redes Sociales aún guardan los cambios en el navegador.
3. **Módulo de Sincronización Automática**: Conexión con **Facebook Graph API** para importación de noticias sin duplicados.
4. **Seguridad & Bitácora**: Control de acceso por roles (RBAC) y Registro de Auditoría de Cambios (*Audit Logs*).

---

## Tabla de Contenidos
1. [Ficha Técnica y Tecnologías](#-ficha-técnica-y-tecnologías)
2. [Módulo CMS de Trámites y Servicios](#-módulo-cms-de-trámites-y-servicios)
3. [CMS de Centros de Atención](#-cms-de-centros-de-atención)
4. [CMS de Redes Sociales](#-cms-de-redes-sociales)
5. [Persistencia y configuración](#-persistencia-y-configuración-del-cms)
6. [Estructura Completa del Proyecto](#-estructura-completa-del-proyecto)
7. [Arquitectura del Backend](#-arquitectura-del-backend)
8. [Módulo de Sincronización con Facebook Graph API](#-módulo-de-sincronización-con-facebook-graph-api)
9. [Seguridad, roles y bitácora](#-seguridad-roles-y-bitácora)
10. [Autenticación y credenciales de desarrollo](#-autenticación-y-credenciales-de-desarrollo)
11. [Guía de Instalación y Ejecución](#-guía-de-instalación-y-ejecución)

---

## Ficha Técnica y Tecnologías

###  Frontend (React + Vite)
| Categoría | Tecnología | Versión | Propósito |
|---|---|---|---|
| **Framework Core** | React | `^19.2.8` | Interfaz de usuario reactiva basada en componentes |
| **Bundler / Server** | Vite | `^8.2.0` | Servidor HMR ultrarrápido y empaquetador |
| **Enrutamiento** | React Router DOM | `^7.18.2` | Rutas dinámicas y protegidas (`/`, `/admin/*`) |
| **Gestión de Estado** | TanStack React Query | `^5.102.5` | Sincronización asíncrona y caché remota |
| **Estilos & UI** | Bootstrap 5 + CSS | `^5.3.8` | Grid responsivo y componentes con Glassmorphism |
| **Notificaciones** | SweetAlert2 | `^11.26.25` | Modales interactivos de confirmación |
| **Carruseles / Mapas** | Swiper + Leaflet | `^14.1.0` / `^1.9.4` | Slider táctil y cartografía interactiva |

### 🚀 Backend (Node.js + Express + Firebase)
| Categoría | Tecnología | Versión | Propósito |
|---|---|---|---|
| **Entorno de Servidor** | Node.js (ESM) | `v20+` | Entorno de ejecución de lado del servidor |
| **Framework Web** | Express.js | `^4.21.2` | Infraestructura de rutas y middleware de API REST |
| **Base de Datos NoSQL** | Firebase Firestore Lite | `firebase` `^11.3.1` | Lectura y escritura de las colecciones conectadas a Firestore |
| **Almacenamiento Multimedia** | Multer + disco local | `multer` `^1.4.5-lts.1` | Las imágenes de noticias se guardan en `backend/uploads` y se sirven bajo `/uploads` |
| **Seguridad & Token** | JWT + bcryptjs | `^9.0.2` / `^3.0.3` | Encriptación de contraseñas y firma de tokens de sesión |
| **Social Sync** | Facebook Graph API | `v19.0` | Importación automática de noticias desde Facebook |

---

##  Módulo CMS de Trámites y Servicios

Se implementó una reestructuración de la sección **Trámites y Servicios** para mejorar la experiencia de usuario (*UX*) y simplificar la navegación:

1. **4 Categorías Principales**:
   - **Trámites Municipales**: Permisos de construcción, licencias de funcionamiento y constancias.
   -  **Impuestos y Pagos**: Pago de IBI, impuesto sobre ingresos/matrícula y solvencias.
   -  **Propiedades y Comercio**: Consultas catastrales, mercados municipales y registro de negocios.
   -  **Servicios y Atención**: Recolección de basura, cementerios, denuncias y reserva de citas.
2. **Visor Modal Interactivo**:
   - Desenfoque de fondo (*Glassmorphism*), selector rápido entre categorías y tarjetas de sub-servicios con soporte para enlaces externos o redirección interna a `#contacto`.
3. **Módulo CMS Administrativo (`/admin/servicios`)**:
   - Gestión integral de categorías (crear, editar, eliminar).
   - CRUD de trámites y sub-servicios con configuración de **texto de botón** y **URL/link de destino** personalizado.
   - Edición de los textos introductorios de la sección pública y del teléfono de orientación.
   - El portal público y el CMS consultan el mismo contenido mediante React Query.

La API expone `GET /api/servicios`, `GET/PUT /api/servicios/settings`, operaciones de categorías en `/api/servicios` y operaciones de trámites en `/api/servicios/:id/subservicios`. Las escrituras requieren JWT válido y rol `superadmin` o `editor`. El controlador usa la colección Firestore `servicios`; los textos de sección se guardan en `cmsMetadata/servicios`. Al inicializar una colección vacía se copian las categorías de ejemplo definidas en `src/services/initialData.js`.

##  CMS de Centros de Atención

La pantalla `/admin/centros-atencion` permite agregar, editar y eliminar puntos de atención. Cada registro incluye nombre, etiqueta, descripción, URL de fotografía, coordenadas y enlace a Google Maps. La landing muestra esos registros en la sección `#centros-atencion`.

##  CMS de Redes Sociales

La pantalla `/admin/redes-sociales` administra el rótulo, título y descripción de la sección, además de las plataformas configuradas (Facebook, Instagram, TikTok, YouTube y Twitter/X). Para cada plataforma se pueden editar nombre, usuario, enlace oficial, contador manual, texto del contador, color, descripción de perfil e imágenes de galería.

Los enlaces, contadores y galerías de la landing se leen desde esta configuración. Los contadores son valores ingresados manualmente; no se consultan automáticamente a las redes sociales.

##  Persistencia y configuración del CMS

- **Trámites y Servicios**: las lecturas y escrituras usan la API `/api/servicios` y Firestore. Firestore debe estar habilitado y configurado para que el guardado remoto funcione; si Firestore está desactivado, las escrituras fallan y el CMS muestra el error.
- **Centros de Atención**: se guardan en `localStorage` bajo `alcaldia_leon_centros_atencion`.
- **Redes Sociales**: se guardan en `localStorage` bajo `alcaldia_leon_redes_sociales`.
- Centros y Redes se sincronizan con la landing en el mismo navegador, incluidas otras pestañas abiertas. `localStorage` no comparte cambios entre dispositivos ni entre navegadores; para publicar esos cambios a todos los visitantes deben migrarse a persistencia del backend.
- La API del frontend se configura con `VITE_API_BASE_URL`; por defecto usa `http://localhost:5000/api`. En el servidor Vite se debe definir la variable antes de arrancar, por ejemplo `VITE_API_BASE_URL=http://localhost:5001/api`.
- El cliente invalida/refresca las consultas públicas de Centros y Redes al montar y cuando otra pestaña modifica sus claves de almacenamiento.

---

##  Estructura Completa del Proyecto

```text
alcaldia-leon-react/
├── backend/                       ← SERVIDOR BACKEND (Node.js + Express + Firebase)
│   ├── .env                       ← Credenciales de Firebase y Facebook Graph API
│   ├── package.json
│   ├── server.js                  ← Entrypoint + Cron Job de Sincronización (Puerto 5000)
│   ├── uploads/                   ← Almacenamiento local temporal / fallback
│   └── src/
│       ├── app.js                 ← Configuración de Express, CORS y montaje de rutas API
│       ├── config/
│       │   └── firebase.js        ← Inicialización de Firestore y Firebase Storage
│       ├── controllers/
│       │   ├── authController.js  ← Login JWT, encriptación bcrypt y cambio de clave
│       │   ├── serviciosController.js ← Categorías, trámites y textos de Servicios
│       │   ├── noticiasController.js ← CRUD de noticias + Auditoría
│       │   ├── proyectosController.js← CRUD de proyectos
│       │   ├── turismoController.js  ← CRUD de destinos turísticos
│       │   ├── culturaController.js  ← CRUD de agenda cultural
│       │   ├── statsController.js    ← CRUD de estadísticas demográficas
│       │   ├── contactoController.js ← Edición de datos institucionales
│       │   ├── facebookController.js ← Sincronización bajo demanda con Facebook
│       │   ├── auditController.js    ← Consulta de bitácora de eventos
│       │   └── usersController.js    ← Gestión de administradores y roles RBAC
│       ├── middlewares/
│       │   ├── authMiddleware.js  ← Protección JWT de rutas privadas
│       │   ├── roleMiddleware.js  ← Control de acceso por roles (RBAC)
│       │   └── uploadMiddleware.js← Carga de imágenes con Multer
│       ├── services/
│       │   ├── facebookService.js ← Conector con Facebook Graph API y filtro anti-duplicados
│       │   └── auditService.js    ← Servicio de registro de auditoría (activity_logs)
│       └── routes/
│           ├── authRoutes.js      ← Rutas /api/auth
│           ├── serviciosRoutes.js ← CRUD /api/servicios y control de acceso
│           ├── noticiasRoutes.js  ← Rutas /api/noticias
│           ├── proyectosRoutes.js ← Rutas /api/proyectos
│           ├── turismoRoutes.js   ← Rutas /api/turismo
│           ├── culturaRoutes.js   ← Rutas /api/cultura
│           ├── statsRoutes.js     ← Rutas /api/stats
│           ├── contactoRoutes.js  ← Rutas /api/contacto
│           ├── facebookRoutes.js  ← Rutas /api/facebook
│           ├── auditRoutes.js     ← Rutas /api/audit-logs
│           └── usersRoutes.js     ← Rutas /api/users
│
├── index.html
├── vite.config.js
├── package.json                   ← Dependencias del Frontend
└── src/                           ← FRONTEND (React 19)
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── services/
    │   ├── apiService.js          ← Cliente API unificado
    │   ├── mockStorage.js         ← Almacenamiento local asíncrono (Fallback)
    │   └── initialData.js         ← Datos por defecto de la aplicación
      ├── components/                ← Portal público; incluye CentrosAtencion y RedesSociales
    └── admin/                     ← Panel CMS Administrativo (/admin)
        ├── components/            ← Layout, Sidebar y Header de Administración
         └── pages/                 ← Incluye ServiciosAdmin, CentrosAtencionAdmin y RedesSocialesAdmin
```

##  Arquitectura del Backend

El backend Express se inicia desde `backend/server.js`, monta sus endpoints en `/api` y usa Firebase Firestore para los controladores que lo integran. La disponibilidad de una colección depende de que Firestore esté habilitado en el proyecto y de la configuración de credenciales y reglas correspondiente.

---

##  Seguridad, roles y bitácora

### Matriz de Roles (RBAC)
* **`superadmin`**: Acceso total al sistema (gestión de usuarios, auditoría, contenidos y configuración).
* **`editor`**: Permisos de creación y edición de noticias, proyectos, turismo y cultura.
* **`visor`**: Perfil de solo lectura.

### Bitácora de Auditoría (`activity_logs`)
Cada acción dentro del sistema (crear noticia, editar proyecto, eliminar registro, login exitoso o fallido) genera un registro de auditoría en Firestore que guarda:
`id`, `userEmail`, `userName`, `role`, `action`, `module`, `details`, `ip` y `timestamp`.

El middleware valida la firma y expiración del JWT, y rechaza solicitudes privadas sin token o con token inválido. Las rutas de Usuarios, Auditoría y Servicios aplican controles de rol; otras rutas de contenido actualmente exigen autenticación, pero no todas filtran por rol.

---

##  Módulo de Sincronización con Facebook Graph API

* **Cron Job en Segundo Plano**: Cada 30 minutos, el servidor Node.js consulta la página oficial de la Alcaldía de León en Facebook.
* **Filtro Anti-Duplicación**: Utiliza la clave `external_id` (ID de publicación de Facebook) para ignorar publicaciones ya registradas.
* **Sincronización Manual**: Los administradores pueden forzar la sincronización en tiempo real con 1 solo clic desde el CMS.

---

##  Autenticación y credenciales de desarrollo

* **URL predeterminada de la API Backend**: `http://localhost:5000/api`
* **URL predeterminada del Frontend React**: `http://localhost:5173`
* **Credenciales locales de demostración** (no usar en producción):
  * **Correo**: `admin@alcaldaleon.gob.ni`
  * **Contraseña**: `admin123`

El middleware de autenticación rechaza solicitudes privadas sin un JWT válido. En producción se debe configurar `JWT_SECRET`; el secreto predeterminado solo se usa en desarrollo. La autenticación mock del frontend es para demostración local y no sustituye una sesión JWT del backend.

---

##  Guía de Instalación y Ejecución

### 1. Iniciar el Backend (Node.js)
```bash
cd backend
npm ci
npm run dev
```

### 2. Iniciar el Frontend (React + Vite)
En una nueva terminal:
```bash
npm ci
npm run dev
```

Para usar otro puerto de API con Vite, configura `VITE_API_BASE_URL` antes de iniciar el frontend. Ejemplo:

```bash
VITE_API_BASE_URL=http://localhost:5001/api npm run dev -- --port 5174
```
