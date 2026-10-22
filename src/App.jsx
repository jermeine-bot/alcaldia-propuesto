import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import CentrosAtencion from './components/CentrosAtencion';
import Galeria from './components/Galeria';
import RedesSociales from './components/RedesSociales';
import Contacto from './components/Contacto';
import Footer from './components/Footer'; 
import AnuncioModal from './components/AnuncioModal';
import ProyectosPage from './pages/ProyectosPage';
import CulturaPage from './pages/CulturaPage';

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
import CentrosAtencionAdmin from './admin/pages/CentrosAtencionAdmin';
import RedesSocialesAdmin from './admin/pages/RedesSocialesAdmin';
import AnuncioAdmin from './admin/pages/AnuncioAdmin';

function PublicLanding() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);
  const mainRef = useRef(null);
  const location = useLocation();

  // Controlar que el Preloader solo aparezca la primera vez en la sesión actual
  useEffect(() => {
    const hasLoadedBefore = sessionStorage.getItem('hasLoadedBefore');
    
    if (!hasLoadedBefore) {
      setShowPreloader(true);
      sessionStorage.setItem('hasLoadedBefore', 'true');
    }
  }, []);

  // Permite llegar desde otra página a una sección concreta (ej. /#contacto).
  useEffect(() => {
    if (!location.hash) return undefined;

    const id = decodeURIComponent(location.hash.slice(1));
    let attempts = 0;
    let timerId = null;
    let cancelled = false;

    const cancelOnUserAction = () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
    };

    const scrollToTarget = () => {
      if (cancelled) return;
      const target = document.getElementById(id);
      const headerOffset = 70;

      if (target) {
        const rect = target.getBoundingClientRect();
        const distance = Math.abs(rect.top - headerOffset);

        if (distance > 10) {
          window.scrollTo({
            top: Math.max(0, rect.top + window.pageYOffset - headerOffset),
            behavior: 'instant'
          });
        } else {
          cancelled = true;
          return;
        }
      }

      attempts += 1;
      if (attempts < 32) {
        timerId = window.setTimeout(scrollToTarget, 150);
      }
    };

    window.addEventListener('wheel', cancelOnUserAction, { passive: true, once: true });
    window.addEventListener('touchstart', cancelOnUserAction, { passive: true, once: true });
    window.addEventListener('keydown', cancelOnUserAction, { once: true });

    timerId = window.setTimeout(scrollToTarget, 120);

    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
      window.removeEventListener('wheel', cancelOnUserAction);
      window.removeEventListener('touchstart', cancelOnUserAction);
      window.removeEventListener('keydown', cancelOnUserAction);
    };
  }, [location]);

  useEffect(() => {
    const sections = mainRef.current?.querySelectorAll(':scope > section:not(:first-child)');
    if (!sections?.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -6% 0px'
    });

    sections.forEach((section, index) => {
      section.classList.add('scroll-reveal');
      section.style.setProperty('--scroll-reveal-delay', `${Math.min(index, 4) * 55}ms`);
      const revealItems = section.querySelectorAll(
        '.section-header, .row > [class*="col-"], .gallery-item, .centro-atencion-card, .cultura-card'
      );
      revealItems.forEach((item, itemIndex) => {
        item.classList.add('scroll-reveal-item');
        item.style.setProperty('--scroll-item-delay', `${Math.min(itemIndex, 7) * 75}ms`);
      });
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
      sections.forEach((section) => {
        section.classList.remove('scroll-reveal', 'scroll-reveal-visible');
        section.style.removeProperty('--scroll-reveal-delay');
        section.querySelectorAll('.scroll-reveal-item').forEach((item) => {
          item.classList.remove('scroll-reveal-item');
          item.style.removeProperty('--scroll-item-delay');
        });
      });
    };
  }, []);

  return (
    <div className="app-container">
      {showPreloader && <Preloader />}
      <AnuncioModal />
      <Header onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <main ref={mainRef}>
        <Hero />
        <Noticias />
        <Autoridades />
        <Servicios />
        <Estadisticas />
        <Proyectos />
        <Turismo />
        <MapaLeon />
        <Cultura />
        <CentrosAtencion />
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

        {/* Página pública de Proyectos */}
        <Route path="/proyectos" element={<ProyectosPage />} />

        {/* Página pública de Cultura y Efemérides */}
        <Route path="/cultura" element={<CulturaPage />} />

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
          <Route path="centros-atencion" element={<CentrosAtencionAdmin />} />
          <Route path="redes-sociales" element={<RedesSocialesAdmin />} />
          <Route path="anuncios" element={<AnuncioAdmin />} />
          <Route path="anuncio" element={<AnuncioAdmin />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}