import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, ExternalLink, Megaphone, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '../services/apiService';

const formatUrl = url => {
  if (!url || !url.trim()) return '';
  const value = url.trim();
  return /^(https?:\/\/|\/|#)/i.test(value) ? value : `https://${value}`;
};

const AnuncioModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: anuncios = [] } = useQuery({ queryKey: ['anuncios', 'public'], queryFn: apiService.getPublicAnuncios, staleTime: 60_000 });
  useEffect(() => { if (activeIndex >= anuncios.length) setActiveIndex(0); }, [activeIndex, anuncios.length]);
  const anuncio = anuncios[activeIndex];
  useEffect(() => {
    if (!anuncios.length) { setIsOpen(false); setActiveIndex(0); return; }
    const isPreloaderFinished = () => ![...document.querySelectorAll('.preloader, #preloader, .intro-screen, .splash-screen, [class*="preloader"], [class*="Preloader"], [id*="preloader"]')].some(el => {
      const style = window.getComputedStyle(el); const rect = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0.05 && rect.width > 0 && rect.height > 0;
    });
    let interval; let timer;
    const initial = setTimeout(() => {
      if (isPreloaderFinished()) timer = setTimeout(() => setIsOpen(true), 450);
      else interval = setInterval(() => { if (isPreloaderFinished()) { clearInterval(interval); timer = setTimeout(() => setIsOpen(true), 450); } }, 250);
    }, 600);
    return () => { clearTimeout(initial); clearTimeout(timer); clearInterval(interval); };
  }, [anuncios]);
  useEffect(() => {
    const onKey = e => { if (!isOpen) return; if (e.key === 'Escape') setIsOpen(false); if (e.key === 'ArrowRight') setActiveIndex(i => (i + 1) % anuncios.length); if (e.key === 'ArrowLeft') setActiveIndex(i => (i - 1 + anuncios.length) % anuncios.length); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, anuncios.length]);
  if (!isOpen || !anuncio?.image) return null;
  const link = formatUrl(anuncio.linkUrl || anuncio.link_url);
  const navigate = direction => setActiveIndex(i => (i + direction + anuncios.length) % anuncios.length);
  const close = () => setIsOpen(false);
  return <div className="modal d-block" tabIndex="-1" onClick={close} style={{ backgroundColor: 'rgba(10,12,16,.82)', backdropFilter: 'blur(7px)', zIndex: 2050 }}>
    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}><div className="modal-content border-0 shadow-lg overflow-hidden position-relative" style={{ borderRadius: 18 }}>
      <div className="position-absolute top-0 end-0 m-3 d-flex gap-2" style={{ zIndex: 3 }}><button type="button" onClick={close} className="btn btn-dark btn-sm rounded-pill px-3 d-flex align-items-center gap-1"><span>Saltar anuncio</span><SkipForward size={14}/></button><button type="button" onClick={close} className="btn btn-light btn-sm rounded-circle" aria-label="Cerrar"><X size={16}/></button></div>
      {link ? <a href={link} target="_blank" rel="noopener noreferrer" onClick={close}><img src={anuncio.image} alt={anuncio.title || 'Aviso institucional'} className="img-fluid w-100 d-block" style={{ maxHeight: '65vh', objectFit: 'contain', background: '#0d0f12' }}/></a> : <img src={anuncio.image} alt={anuncio.title || 'Aviso institucional'} className="img-fluid w-100 d-block" style={{ maxHeight: '65vh', objectFit: 'contain', background: '#0d0f12' }}/>}
      <div className="p-3 bg-white text-center border-top">{anuncio.badge && <span className="badge bg-danger-subtle text-danger mb-2 d-inline-flex align-items-center gap-1"><Megaphone size={12}/>{anuncio.badge}</span>}{anuncio.title && <h5 className="fw-bold text-dark mb-1">{anuncio.title}</h5>}{anuncio.description && <p className="text-secondary small mb-3">{anuncio.description}</p>}<div className="d-flex justify-content-center flex-wrap gap-2">{link && <a href={link} target="_blank" rel="noopener noreferrer" onClick={close} className="btn btn-danger btn-sm px-4 fw-semibold d-flex align-items-center gap-2 rounded-pill">{anuncio.buttonText || 'Ver más información'}<ExternalLink size={15}/></a>}<button onClick={close} className="btn btn-outline-secondary btn-sm px-4 rounded-pill">Continuar al sitio</button></div>
        {anuncios.length > 1 && <div className="d-flex justify-content-center align-items-center gap-3 mt-3"><button className="btn btn-outline-secondary btn-sm rounded-circle" onClick={() => navigate(-1)} aria-label="Anuncio anterior"><ChevronLeft size={17}/></button><div className="d-flex gap-2" role="tablist" aria-label="Seleccionar anuncio">{anuncios.map((item, i) => <button key={item.id || i} onClick={() => setActiveIndex(i)} aria-label={`Mostrar anuncio ${i + 1}`} aria-current={i === activeIndex ? 'true' : undefined} className="border-0 rounded-circle p-0" style={{ width: 9, height: 9, background: i === activeIndex ? '#B22222' : '#cbd5e1' }}/>)}</div><span className="small text-muted">{activeIndex + 1}/{anuncios.length}</span><button className="btn btn-outline-secondary btn-sm rounded-circle" onClick={() => navigate(1)} aria-label="Siguiente anuncio"><ChevronRight size={17}/></button></div>}
      </div>
    </div></div>
  </div>;
};
export default AnuncioModal;
