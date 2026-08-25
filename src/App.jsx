import React, { useState } from 'react';
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

function AppContent() {
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
      <AppContent />
    </ThemeProvider>
  );
}
