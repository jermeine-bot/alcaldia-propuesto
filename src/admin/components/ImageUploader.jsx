import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Check } from 'lucide-react';

const ImageUploader = ({ value, onChange, label = 'Imagen Representativa' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (.jpg, .png, .webp).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target.result); // Base64 data URL
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-uploader-wrapper">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <label className="form-label fw-semibold small mb-0">{label}</label>
        <button
          type="button"
          className="btn btn-link text-decoration-none p-0 small text-danger"
          style={{ fontSize: '0.78rem' }}
          onClick={() => setShowUrlInput(!showUrlInput)}
        >
          {showUrlInput ? 'Usar arrastrar y soltar' : 'Ingresar URL/Ruta texto'}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="d-none"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {showUrlInput ? (
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-light">
            <ImageIcon size={16} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="/img/noticias/noticia1.jpg o https://..."
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : (
        <div
          className={`border rounded-3 p-3 text-center transition-all cursor-pointer ${
            isDragging ? 'border-danger bg-danger-subtle' : 'border-dashed bg-light'
          }`}
          style={{
            borderStyle: 'dashed',
            borderWidth: '2px',
            borderColor: isDragging ? '#B22222' : '#CBD5E1',
            cursor: 'pointer'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {value ? (
            <div className="position-relative d-inline-block">
              <img
                src={value}
                alt="Vista previa"
                className="rounded shadow-sm"
                style={{ maxHeight: '130px', maxWidth: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/img/hero-bg.jpg';
                }}
              />
              <button
                type="button"
                className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 translate-middle p-1"
                style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                title="Quitar imagen"
              >
                <X size={14} />
              </button>
              <div className="mt-1 small text-success fw-semibold d-flex align-items-center justify-content-center gap-1">
                <Check size={14} /> Imagen seleccionada
              </div>
            </div>
          ) : (
            <div className="py-2 text-muted">
              <UploadCloud size={32} className="text-danger mb-2" />
              <div className="fw-semibold text-dark small">Arrastra y suelta tu imagen aquí</div>
              <div className="small text-muted mt-1" style={{ fontSize: '0.78rem' }}>
                o haz clic para explorar en tu equipo (.jpg, .png, .webp)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
