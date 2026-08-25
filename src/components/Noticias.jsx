import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

const noticiasData = [
  {
    id: 1,
    img: '/img/noticias/noticia1.jpg',
    date: '15 Enero 2026',
    title: 'Inauguración del nuevo Parque Central',
    desc: 'Un espacio renovado para el disfrute de todas las familias leonesas.'
  },
  {
    id: 2,
    img: '/img/noticias/noticia2.jpg',
    date: '12 Enero 2026',
    title: 'Nuevo sistema de recolección de basura',
    desc: 'Modernizamos el servicio para una ciudad más limpia y sostenible.'
  },
  {
    id: 3,
    img: '/img/noticias/festival de la poseia.jpg',
    date: '10 Enero 2026',
    title: 'Festival de Poesía 2026',
    desc: 'León se prepara para el evento cultural más importante del año.'
  },
  {
    id: 4,
    img: '/img/noticias/noticia3.jpg',
    date: '8 Enero 2026',
    title: 'Obras de pavimentación avanzan',
    desc: 'Transformando las calles de León para mejorar la movilidad.'
  }
];

const Noticias = () => {
  return (
    <section id="noticias" className="noticias-section py-5">
      <div className="container">
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">Actualidad</span>
          <h2 className="section-title">Últimas Noticias</h2>
          <p className="section-description">Mantente informado sobre los acontecimientos de nuestra ciudad</p>
        </div>

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 30 }
          }}
          className="noticias-swiper"
        >
          {noticiasData.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="noticia-card">
                <img
                  src={item.img}
                  alt={item.title}
                  className="noticia-img"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x250?text=Noticia';
                  }}
                />
                <div className="noticia-body">
                  <span className="noticia-date">{item.date}</span>
                  <h5>{item.title}</h5>
                  <p>{item.desc}</p>
                  <a href="#contacto" className="noticia-link">
                    Leer más <i className="fas fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Noticias;
