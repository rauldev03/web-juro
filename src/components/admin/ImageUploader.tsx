import React, { useState, useRef } from 'react';
import { UploadCloud, Star, Trash2, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { ProductImage } from '../../types';

interface ImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onChange }) => {
  const { showToast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const fileArray = Array.from(files);
      const res = await api.upload.uploadMultiple(fileArray);

      if (res.data && res.data.length > 0) {
        const newImages: ProductImage[] = res.data.map((item, idx) => ({
          image_url: item.image_url,
          is_primary: images.length === 0 && idx === 0 ? 1 : 0,
          sort_order: images.length + idx
        }));

        onChange([...images, ...newImages]);
        showToast(`${newImages.length} imagen(es) subida(s) con éxito`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Error al subir imágenes', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const newImg: ProductImage = {
      image_url: urlInput.trim(),
      is_primary: images.length === 0 ? 1 : 0,
      sort_order: images.length
    };

    onChange([...images, newImg]);
    setUrlInput('');
    showToast('Imagen agregada desde URL', 'success');
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, idx) => ({
      ...img,
      is_primary: idx === index ? 1 : 0
    }));
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    // If the deleted image was primary, set the first one as primary
    if (updated.length > 0 && !updated.some(img => img.is_primary === 1)) {
      updated[0].is_primary = 1;
    }
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // re-assign sort order
    updated.forEach((img, i) => { img.sort_order = i; });
    onChange(updated);
  };

  return (
    <div className="image-uploader-container">
      {/* Dropzone */}
      <div
        className={`dropzone-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud size={32} color={isDragging ? '#FFFFFF' : '#737373'} />
        <div>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>
            {isUploading ? 'Subiendo imágenes...' : 'Arrastra y suelta tus fotos aquí o haz clic para explorar'}
          </p>
          <p style={{ fontSize: '0.72rem', color: '#737373', marginTop: '0.25rem' }}>
            Formatos permitidos: JPG, PNG, WEBP (Hasta 10 MB)
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Alternative URL Input */}
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="O ingresa una URL de imagen (/images/products/... o https://...)"
          className="form-input"
          style={{ fontSize: '0.8rem', padding: '0.6rem 0.85rem' }}
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAddUrl(e); }}
        />
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={handleAddUrl}
          style={{ whiteSpace: 'nowrap' }}
        >
          <Plus size={14} /> Agregar URL
        </button>
      </div>

      {/* Sample Quick Library Suggestions */}
      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.7rem', color: '#737373' }}>Muestras de estudio:</span>
        {[
          { label: 'Polo Negro', url: '/images/products/polo-black-essential.jpg' },
          { label: 'Polo Blanco', url: '/images/products/polo-white-cotton.jpg' },
          { label: 'Polo Gris Melange', url: '/images/products/polo-grey-heather.jpg' },
          { label: 'Polo Carbón', url: '/images/products/polo-charcoal-raw.jpg' }
        ].map((sample, i) => (
          <button
            key={i}
            type="button"
            className="badge badge-dark"
            style={{ cursor: 'pointer', fontSize: '0.68rem' }}
            onClick={() => {
              const newImg: ProductImage = {
                image_url: sample.url,
                is_primary: images.length === 0 ? 1 : 0,
                sort_order: images.length
              };
              onChange([...images, newImg]);
            }}
          >
            + {sample.label}
          </button>
        ))}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((img, idx) => {
            const isPrimary = img.is_primary === 1 || img.is_primary === true;
            return (
              <div
                key={idx}
                className={`image-preview-card ${isPrimary ? 'primary' : ''}`}
              >
                <img src={img.image_url} alt={`Vista ${idx + 1}`} />

                <div className="image-preview-actions">
                  <button
                    type="button"
                    className={`primary-badge-btn ${isPrimary ? 'is-primary' : ''}`}
                    onClick={() => handleSetPrimary(idx)}
                    title={isPrimary ? 'Imagen principal de portada' : 'Hacer imagen principal'}
                  >
                    <Star size={11} fill={isPrimary ? '#0A0A0A' : 'none'} />
                    {isPrimary ? 'PORTADA' : 'HACER PORTADA'}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    {idx > 0 && (
                      <button
                        type="button"
                        className="image-delete-btn"
                        onClick={() => handleMove(idx, 'left')}
                        title="Mover a la izquierda"
                      >
                        <ArrowLeft size={13} />
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        type="button"
                        className="image-delete-btn"
                        onClick={() => handleMove(idx, 'right')}
                        title="Mover a la derecha"
                      >
                        <ArrowRight size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="image-delete-btn"
                      onClick={() => handleDelete(idx)}
                      title="Eliminar imagen"
                      style={{ color: '#E8CECE' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
