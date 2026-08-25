import React, { useEffect, useState } from 'react';

const Preloader = () => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHidden(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="preloader" className={hidden ? 'hidden' : ''}>
      <div className="preloader-content">
        <div className="preloader-logo">
          <i className="fas fa-city"></i>
        </div>
        <h2>Alcaldía Municipal de <span>León</span></h2>
        <p>Portal Oficial 2026</p>
        <div className="preloader-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
