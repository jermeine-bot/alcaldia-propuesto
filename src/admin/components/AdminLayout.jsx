import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import '../css/admin.css';

const titleMap = {
  '/admin': 'Dashboard Principal',
  '/admin/dashboard': 'Dashboard Principal',
  '/admin/hero': 'Gestión de Portada y Hero',
  '/admin/noticias': 'Gestión de Noticias Institucionales',
  '/admin/proyectos': 'Gestión de Proyectos y Obras',
  '/admin/turismo': 'Gestión de Lugares Turísticos',
  '/admin/cultural': 'Agenda Cultural y Tradiciones',
  '/admin/estadisticas': 'Indicadores y Estadísticas de León',
  '/admin/centros-atencion': 'Gestión de Centros de Atención',
  '/admin/redes-sociales': 'Gestión de Redes Sociales',
  '/admin/contacto': 'Información Institucional y Contacto',
};

const AdminLayout = () => {
  const location = useLocation();
  const mainRef = useRef(null);
  const title = titleMap[location.pathname] || 'Panel Administrativo';

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="admin-wrapper admin-body">
      <AdminSidebar />
      <div className="admin-main" ref={mainRef}>
        <AdminHeader title={title} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
