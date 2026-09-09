# 🏛️ Portal Institucional, Panel Administrativo y Backend — Alcaldía Municipal de León, Nicaragua

Bienvenido a la documentación oficial y actualizada del sistema web completo de la **Alcaldía Municipal de León, Nicaragua**. 

Este proyecto se compone de una **Arquitectura Fullstack Profesional**:
1. **Frontend (SPA)**: Desarrollado con **React 19** + **Vite 8**, que incluye un portal público ciudadano de alto impacto visual y un **Panel Administrativo (CMS Dashboard)**.
2. **Backend (API REST)**: Desarrollado con **Node.js** + **Express.js**, integrado con **Firebase (Firestore Database + Firebase Storage)** para la gestión de datos en tiempo real y almacenamiento en la nube.
3. **Módulo de Sincronización Automática**: Conexión con **Facebook Graph API** para importación de noticias sin duplicados.
4. **Seguridad & Bitácora**: Control de acceso por roles (RBAC) y Registro de Auditoría de Cambios (*Audit Logs*).

---

## 📋 Tabla de Contenidos
1. [Ficha Técnica y Tecnologías](#-ficha-técnica-y-tecnologías)
2. [Estructura Completa del Proyecto](#-estructura-completa-del-proyecto)
3. [Arquitectura del Backend (Node.js + Firebase)](#-arquitectura-del-backend-nodejs--firebase)
4. [Módulo de Sincronización con Facebook Graph API](#-módulo-de-sincronización-con-facebook-graph-api)
5. [Seguridad Avanzada, Roles (RBAC) y Bitácora de Auditoría](#-seguridad-avanzada-roles-rbac-y-bit%C3%A1cora-de-auditor%C3%ADa)
6. [Autenticación y Credenciales Admin](#-autenticación-y-credenciales-admin)
7. [Guía de Instalación y Ejecución](#-guía-de-instalación-y-ejecución)

---

## 🚀 Ficha Técnica y Tecnologías

### 🎨 Frontend (React + Vite)
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
| **Base de Datos NoSQL** | Firebase Firestore | `^11.3.1` / Admin SDK | Almacenamiento en la nube de contenidos y auditoría |
| **Almacenamiento Multimedia** | Firebase Storage | `^11.3.1` / Admin SDK | Subida y alojamiento de imágenes con URLs públicas |
| **Seguridad & Token** | JWT + bcryptjs | `^9.0.2` / `^3.0.3` | Encriptación de contraseñas y firma de tokens de sesión |
| **Social Sync** | Facebook Graph API | `v19.0` | Importación automática de noticias desde Facebook |

---

## 📂 Estructura Completa del Proyecto

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
    │   └── apiService.js          ← Cliente API unificado que consume http://localhost:5000/api
    ├── components/                ← Portal público (Hero, Noticias, Proyectos, etc.)
    └── admin/                     ← Panel CMS Administrativo (/admin)
```

---

## 🛡️ Seguridad Avanzada, Roles (RBAC) y Bitácora de Auditoría

### Matriz de Roles (RBAC)
* **`superadmin`**: Acceso total al sistema (gestión de usuarios, auditoría, contenidos y configuración).
* **`editor`**: Permisos de creación y edición de noticias, proyectos, turismo y cultura.
* **`visor`**: Perfil de solo lectura.

### Bitácora de Auditoría (`activity_logs`)
Cada acción dentro del sistema (crear noticia, editar proyecto, eliminar registro, login exitoso o fallido) genera un registro de auditoría en Firestore que guarda:
`id`, `userEmail`, `userName`, `role`, `action`, `module`, `details`, `ip` y `timestamp`.

---

## 🔷 Módulo de Sincronización con Facebook Graph API

* **Cron Job en Segundo Plano**: Cada 30 minutos, el servidor Node.js consulta la página oficial de la Alcaldía de León en Facebook.
* **Filtro Anti-Duplicación**: Utiliza la clave `external_id` (ID de publicación de Facebook) para ignorar publicaciones ya registradas.
* **Sincronización Manual**: Los administradores pueden forzar la sincronización en tiempo real con 1 solo clic desde el CMS.

---

## 🔑 Autenticación y Credenciales Admin

* **URL de la API Backend**: `http://localhost:5000/api`
* **URL del Frontend React**: `http://localhost:5173`
* **Credenciales de Superadmin por Defecto**:
  * **Correo**: `admin@alcaldaleon.gob.ni`
  * **Contraseña**: `admin123`

---

## 🛠️ Guía de Instalación y Ejecución

### 1. Iniciar el Backend (Node.js)
```bash
cd /home/jermeine/Documentos/alcaldia-leon-react/backend
npm install
npm run dev
```

### 2. Iniciar el Frontend (React + Vite)
En una nueva terminal:
```bash
cd /home/jermeine/Documentos/alcaldia-leon-react
npm run dev
```
