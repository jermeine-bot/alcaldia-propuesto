import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

const turismoData = [
  {
    id: 1,
    img: '/img/turismo/catedral.jpg',
    title: 'Basílica Catedral',
    desc: 'La catedral más grande de Centroamérica'
  },
  {
    id: 2,
    img: '/img/turismo/leon-viejo.jpg',
    title: 'León Viejo',
    desc: 'Patrimonio de la Humanidad'
  },
  {
    id: 3,
    img: '/img/turismo/cerro-negro.jpg',
    title: 'Cerro Negro',
    desc: 'Volcán activo para sandboard'
  },
  {
    id: 4,
    img: '/img/turismo/las-penitas.jpg',
    title: 'Las Peñitas',
    desc: 'Playas paradisíacas'
  }
];

const Turismo = () => {
  return (
    <section id="turismo" className="turismo-section py-5">
      <div className="container">
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">Destinos</span>
          <h2 className="section-title">Descubre León</h2>
          <p className="section-description">Una ciudad llena de historia, cultura y belleza natural</p>
        </div>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          loop={true}
          navigation
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            768: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 30 }
          }}
          className="turismo-swiper"
        >
          {turismoData.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="turismo-slide">
                <img
                  src={item.img}
                  alt={item.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400?text=Turismo';
                  }}
                />
                <div className="turismo-overlay">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Turismo;
