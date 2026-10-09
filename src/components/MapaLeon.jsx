import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const lugares = [
  {
    nombre: '🏛️ Catedral de León',
    lat: 12.4350,
    lng: -86.8785,
    categoria: 'Patrimonio',
    color: '#C8A951',
    icono: 'fa-church',
    imagen: '/img/Mapa/catedral.jpg',
    descripcion: 'La catedral más grande de Centroamérica, Patrimonio de la Humanidad.',
    horario: '8:00 AM - 5:00 PM',
    precio: 'Nacionales: C$40 | Extranjeros: $3'
  },
  {
    nombre: '🏺 León Viejo',
    lat: 12.3975,
    lng: -86.6180,
    categoria: 'Arqueología',
    color: '#003B6D',
    icono: 'fa-archway',
    imagen: '/img/Mapa/leon viejo.jpg',
    descripcion: 'Primer asentamiento de la ciudad, Patrimonio de la Humanidad.',
    horario: '8:30 AM - 4:30 PM',
    precio: 'Nacionales: C$50 | Extranjeros: $4'
  },
  {
    nombre: '🌋 Cerro Negro',
    lat: 12.5058,
    lng: -86.7024,
    categoria: 'Aventura',
    color: '#DC2626',
    icono: 'fa-mountain',
    imagen: '/img/turismo/cerro-negro.jpg',
    descripcion: 'Volcán activo famoso por sandboarding sobre ceniza.',
    horario: '6:00 AM - 2:00 PM',
    precio: 'Tour desde $20'
  },
  {
    nombre: '🏖️ Las Peñitas',
    lat: 12.3833,
    lng: -87.0333,
    categoria: 'Playas',
    color: '#0EA5E9',
    icono: 'fa-umbrella-beach',
    imagen: '/img/turismo/las-penitas.jpg',
    descripcion: 'Playas ideales para surf y atardeceres espectaculares.',
    horario: '24 horas',
    precio: 'Entrada libre'
  },
  {
    nombre: '📚 Museo Rubén Darío',
    lat: 12.4362,
    lng: -86.8778,
    categoria: 'Cultura',
    color: '#8B5CF6',
    icono: 'fa-book-open',
    imagen: '/img/Mapa/museo rubendario.jpg',
    descripcion: 'Casa natal del poeta Rubén Darío, padre del Modernismo.',
    horario: '9:00 AM - 5:00 PM',
    precio: 'Nacionales: C$20 | Extranjeros: $2'
  },
  {
    nombre: '🎨 Ortiz Gurdián',
    lat: 12.4345,
    lng: -86.8790,
    categoria: 'Arte',
    color: '#F59E0B',
    icono: 'fa-palette',
    imagen: 'https://via.placeholder.com/400x180/F59E0B/FFFFFF?text=Ortiz+Gurdi%C3%A1n',
    descripcion: 'El museo de arte más importante de Nicaragua.',
    horario: '10:00 AM - 6:00 PM',
    precio: 'Nacionales: C$30 | Extranjeros: $3.50'
  },
  {
    nombre: '🚩 Museo Revolución',
    lat: 12.4358,
    lng: -86.8795,
    categoria: 'Historia',
    color: '#EF4444',
    icono: 'fa-flag',
    imagen: '/img/Mapa/museo de revulocion.jpg',
    descripcion: 'Historia de la Revolución Sandinista con guías excombatientes.',
    horario: '8:00 AM - 6:00 PM',
    precio: 'Nacionales: C$20 | Extranjeros: $2'
  },
  {
    nombre: '⛪ La Recolección',
    lat: 12.4365,
    lng: -86.8810,
    categoria: 'Patrimonio',
    color: '#D97706',
    icono: 'fa-church',
    imagen: '/img/Mapa/recoleccion.jpg',
    descripcion: 'Iglesia barroca del siglo XVIII, ícono arquitectónico.',
    horario: '7:00 AM - 7:00 PM',
    precio: 'Entrada libre'
  },
  {
    nombre: '🌿 Isla Juan Venado',
    lat: 12.3667,
    lng: -87.0167,
    categoria: 'Naturaleza',
    color: '#10B981',
    icono: 'fa-tree',
    imagen: '/img/Mapa/Isla Juan Venado.jpg',
    descripcion: 'Reserva natural con manglares y tortugas marinas.',
    horario: '6:00 AM - 4:00 PM',
    precio: 'Tour desde $20'
  },
  {
    nombre: '👥 Barrio Sutiaba',
    lat: 12.4333,
    lng: -86.8850,
    categoria: 'Cultura',
    color: '#06B6D4',
    icono: 'fa-people-arrows',
    imagen: '/img/Mapa/sutiaba.jpg',
    descripcion: 'Comunidad indígena con más de 500 años de historia.',
    horario: 'Todo el día',
    precio: 'Entrada libre'
  },
  {
    nombre: '🌊 Poneloya',
    lat: 12.3667,
    lng: -87.0500,
    categoria: 'Playas',
    color: '#0EA5E9',
    icono: 'fa-water',
    imagen: '/img/turismo/las-penitas.jpg',
    descripcion: 'Playa familiar con ambiente local y mariscos frescos.',
    horario: '24 horas',
    precio: 'Entrada libre'
  }
];

const MapaLeon = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // evitar doble renderizado

    // Inicializar Leaflet map
    const mapa = L.map(mapContainerRef.current, {
      center: [12.4371, -86.8780],
      zoom: 13,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(mapa);

    const markersGroup = [];

    lugares.forEach((lugar) => {
      const icono = L.divIcon({
        className: 'marcador-simple',
        html: `<i class="fas ${lugar.icono}" style="color:white;font-size:1.1rem;line-height:1;display:flex;align-items:center;justify-content:center;width:100%;height:100%;"></i>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -20]
      });

      const popupContent = `
        <div class="popup-simple">
          <img src="${lugar.imagen}" alt="${lugar.nombre}" class="popup-simple-imagen" 
               onerror="this.src='https://via.placeholder.com/400x180/cccccc/666666?text=Imagen+no+disponible'">
          <div class="popup-simple-body">
            <span class="popup-categoria" style="background:${lugar.color}">${lugar.categoria}</span>
            <h4>${lugar.nombre}</h4>
            <p class="popup-descripcion">${lugar.descripcion}</p>
            <div class="popup-detalles">
              <span><i class="fas fa-clock"></i> ${lugar.horario}</span>
              <span><i class="fas fa-tag"></i> ${lugar.precio}</span>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([lugar.lat, lugar.lng], { icon: icono, riseOnHover: true });
      marker.bindPopup(popupContent, { maxWidth: 300, minWidth: 260 });
      marker.addTo(mapa);
      markersGroup.push(marker);

      // Abrir catedral por defecto
      if (lugar.nombre.includes('Catedral')) {
        setTimeout(() => marker.openPopup(), 800);
      }
    });

    mapInstanceRef.current = mapa;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <section id="mapa-simple" className="mapa-simple-section py-5">
      <div className="container">
        <div className="section-header text-center mb-4">
          <span className="section-subtitle">📍 Explora León</span>
          <h2 className="section-title">Mapa Turístico de la Ciudad</h2>
          <p className="section-description">Haz clic en los marcadores para descubrir cada lugar</p>
        </div>
      </div>

      <div className="mapa-simple-container">
        <div ref={mapContainerRef} className="mapa-leon-simple"></div>
      </div>
    </section>
  );
};

export default MapaLeon;
