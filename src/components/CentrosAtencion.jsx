import React from 'react';

const centrosAtencion = [
  {
    id: 1,
    title: 'Plantel Augusto C. Sandino - Fundeci',
    description:
      'Centro de atención tributaria para realizar consultas y recibir orientación sobre los tributos municipales.',
    image:
      'https://s3.laprensani.com/wp-content/uploads/2020/08/20200827_054944-1536x1152.jpg',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Centro+de+Atenci%C3%B3n+Tributaria+Plantel+Augusto+C.+Sandino+Fundeci%2C+Le%C3%B3n%2C+Nicaragua',
    coordinates: null
  },
  {
    id: 2,
    title: 'Cabildo de Sutiava',
    description:
      'Punto de atención tributaria para acercar las gestiones y la orientación municipal a las familias de Sutiava.',
    image:
      'https://scontent-mia3-2.xx.fbcdn.net/v/t1.6435-9/53316618_394104814483648_4424533071907258368_n.jpg?stp=dst-jpg_tt6&cstp=mx960x720&ctp=s960x720&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3PcCQj0ryUEQ7kNvwG3XSx2&_nc_oc=AdoxAGoshRtNEGX_QHNMI9aD6lIi_chPm-o43ljxO_Oz7pAu_UuOdJsClIbSZYgYYWU&_nc_zt=23&_nc_ht=scontent-mia3-2.xx&_nc_gid=jxOMDZYlSyA9Zk_-543mfg&_nc_ss=7b289&oh=00_AQOXamRbOgltC3qL1kyyigzMPEhiGYW5FWAJdpNVF9_nXg&oe=6AE759F1',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=12.4334625%2C-86.8962656',
    coordinates: '12.4334625, -86.8962656'
  },
  {
    id: 3,
    title: 'Plantel Rigoberto López Pérez - San Felipe',
    description:
      'Centro de atención para consultas y orientación sobre servicios y obligaciones tributarias municipales.',
    image:
      'https://scontent-mia3-3.xx.fbcdn.net/v/t39.30808-6/476904691_939569444988682_3573219317361155107_n.jpg?stp=dst-jpg_tt6&cstp=mx1280x853&ctp=s1280x853&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=JUqxMr1TfV4Q7kNvwHq84HC&_nc_oc=AdqTkGA-CddnuwnmLiLVVF5GRm_yIa2PR9IzcLvpi3AuwLuILReCEtsqg0IzI2K33z8&_nc_zt=23&_nc_ht=scontent-mia3-3.xx&_nc_gid=9qlya_IIbWhNiapJLGy3JQ&_nc_ss=7b289&oh=00_AQOcOsbnWkS47JJEu-B-MWKRNPkijxlszF7SReE7XtHUCg&oe=6AC5CA98',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Centro+de+Atenci%C3%B3n+Tributaria+Plantel+Rigoberto+L%C3%B3pez+P%C3%A9rez+San+Felipe%2C+Le%C3%B3n%2C+Nicaragua',
    coordinates: null
  },
  {
    id: 4,
    title: 'Parque Forestal - León Sureste',
    description:
      'Punto de atención tributaria para facilitar el acceso a las gestiones municipales en el sector sureste de León.',
    image:
      'https://scontent-mia3-3.xx.fbcdn.net/v/t1.6435-9/118441073_170572441204275_3221589260549251588_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1072&ctp=s2048x1072&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=o_gqKv5d38QQ7kNvwGrxh47&_nc_oc=AdrpB7QL_pU3b6N3tpaH5qdG2D0anL2q_DXP4xhDddj2ZxpBIhnIoYcCewIn6u3_M60&_nc_zt=23&_nc_ht=scontent-mia3-3.xx&_nc_gid=RPn-oKU82s85HMVwN8954g&_nc_ss=7b289&oh=00_AQOe8C_lAr16C0-AtBbqyBUhKAxKLf1gy3Ya1rKoiZVgNg&oe=6AE73BC9',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=12.4283875%2C-86.8527031',
    coordinates: '12.4283875, -86.8527031'
  },
  {
    id: 5,
    title: 'Edificio Central - Alcaldía Municipal de León',
    description:
      'Sede central de la Alcaldía para recibir atención y orientación sobre los servicios tributarios municipales.',
    image:
      'https://scontent-mia5-2.xx.fbcdn.net/v/t39.99422-6/789388685_1815192082973542_1054571313588336725_n.png?stp=dst-jpg_tt6&cstp=mx1599x1066&ctp=s1599x1066&_nc_cat=100&ccb=1-7&_nc_sid=833d8c&_nc_ohc=BTdimcd-Jz4Q7kNvwFmNTTs&_nc_oc=AdpigJop75FwQOgIn0j8Lp6ysRNptMFKlbISmHKSCGOS61BcwI-VJbQQyttWMpzkyCA&_nc_zt=14&_nc_ht=scontent-mia5-2.xx&_nc_gid=Wyae-OVUEYma3uKbK6Jjzg&_nc_ss=7b289&oh=00_AQOfn-jQ1FnmOHa3S0r8MoExqUkKDh5gKgk25b1oOtNVSQ&oe=6AC5BDD7',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=12.4354141%2C-86.8789709',
    coordinates: '12.4354141, -86.8789709'
  }
];

const CentrosAtencion = () => (
  <section id="centros-atencion" className="centros-atencion-section py-5">
    <div className="container">
      <div className="section-header text-center mb-5">
        <span className="section-subtitle">Servicios municipales</span>
        <h2 className="section-title">Centros de Atención Tributaria</h2>
        <p className="section-description">
          Encuentra nuestros centros de atención y consulta su ubicación en Google Maps.
        </p>
      </div>

      <div className="row g-4">
        {centrosAtencion.map((centro) => (
          <div key={centro.id} className="col-lg-4 col-md-6">
            <article className="centro-atencion-card h-100">
              <img
                className="centro-atencion-image"
                src={centro.image}
                alt={`Foto ilustrativa de ${centro.title}`}
                loading="lazy"
              />
              <div className="centro-atencion-content">
                <span className="centro-atencion-label">Atención tributaria</span>
                <h3>{centro.title}</h3>
                <p>{centro.description}</p>
                <div className="centro-atencion-location">
                  <i className="fas fa-location-dot" aria-hidden="true"></i>
                  <span>
                    {centro.coordinates
                      ? `Coordenadas: ${centro.coordinates}`
                      : 'Ubicación en Google Maps; coordenadas por confirmar'}
                  </span>
                </div>
                <a
                  className="centro-atencion-map-link"
                  href={centro.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Ver ubicación de ${centro.title} en Google Maps`}
                >
                  Ver ubicación en Google Maps
                  <i className="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
                </a>
                <small className="centro-atencion-image-note">Fotografía ilustrativa</small>
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default CentrosAtencion;
