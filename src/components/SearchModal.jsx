import React, { useEffect, useRef } from 'react';

const SearchModal = ({ isOpen, onClose }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <button className="search-close" onClick={onClose} aria-label="Cerrar">&times;</button>
        <h5 className="mb-3 font-semibold text-dark">Buscador Municipal</h5>
        <input
          ref={inputRef}
          type="text"
          placeholder="¿Qué estás buscando en el portal?"
        />
      </div>
    </div>
  );
};

export default SearchModal;
