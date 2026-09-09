import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Preloader from './components/Preloader';
import Header from './components/Header';
import SearchModal from './components/SearchModal';
import Hero from './components/Hero';
import Noticias from './components/Noticias';
import Autoridades from './components/Autoridades';
import Servicios from './components/Servicios';
import Estadisticas from './components/Estadisticas';
import Proyectos from './components/Proyectos';
import Turismo from './components/Turismo';
import MapaLeon from './components/MapaLeon';
import Cultura from './components/Cultura';
import Transparencia from './components/Transparencia';
import Galeria from './components/Galeria';
import RedesSociales from './components/RedesSociales';
import Contacto from './components/Contacto';
import Footer from './components/Footer';

// Admin imports
import ProtectedRoute from './admin/components/ProtectedRoute';
import AdminLayout from './admin/components/AdminLayout';
import LoginPage from './admin/pages/LoginPage';
import DashboardOverview from './admin/pages/DashboardOverview';
import HeroAdmin from './admin/pages/HeroAdmin';
import ServiciosAdmin from './admin/pages/ServiciosAdmin';
import NoticiasAdmin from './admin/pages/NoticiasAdmin';
import ProyectosAdmin from './admin/pages/ProyectosAdmin';
import TurismoAdmin from './admin/pages/TurismoAdmin';
import CulturaAdmin from './admin/pages/CulturaAdmin';
import EstadisticasAdmin from './admin/pages/EstadisticasAdmin';
import ContactoAdmin from './admin/pages/ContactoAdmin';

function PublicLanding() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="app-container">
      <Preloader />
      <Header onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <main>
        <Hero />
        <Noticias />
        <Autoridades />
        <Servicios />
        <Estadisticas />
        <Proyectos />
        <Turismo />
        <MapaLeon />
        <Cultura />
        <Transparencia />
        <Galeria />
        <RedesSociales />
        <Contacto />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* Landing Page Pública */}
        <Route path="/" element={<PublicLanding />} />

        {/* Login de Administración */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Panel Administrativo Protegido */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="hero" element={<HeroAdmin />} />
          <Route path="servicios" element={<ServiciosAdmin />} />
          <Route path="noticias" element={<NoticiasAdmin />} />
          <Route path="proyectos" element={<ProyectosAdmin />} />
          <Route path="turismo" element={<TurismoAdmin />} />
          <Route path="cultural" element={<CulturaAdmin />} />
          <Route path="estadisticas" element={<EstadisticasAdmin />} />
          <Route path="contacto" element={<ContactoAdmin />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
