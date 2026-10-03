import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import type { Product } from '../../types';

interface SearchBarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchBarModal: React.FC<SearchBarModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setLoading(true);
        try {
          const res = await api.products.getAll({ search: searchTerm.trim() });
          setResults(res.data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-box" onClick={e => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <Search size={22} color="#737373" />
          <input
            type="text"
            className="search-input-field"
            placeholder="BUSCAR POLO POR NOMBRE, CORTE O COLOR..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            autoFocus
          />
          <button onClick={onClose} style={{ color: '#737373', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Live Results */}
        {loading && <div style={{ textAlign: 'center', padding: '1rem', color: '#737373' }}>Buscando prendas...</div>}

        {!loading && results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
            {results.map(prod => (
              <div
                key={prod.id}
                onClick={() => {
                  onClose();
                  navigate(`/producto/${prod.slug}`);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.6rem',
                  backgroundColor: '#181818',
                  cursor: 'pointer',
                  border: '1px solid #262626'
                }}
              >
                <img
                  src={prod.primary_image}
                  alt={prod.name}
                  style={{ width: '45px', height: '55px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{prod.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#737373' }}>
                    S/ {prod.price.toFixed(2)} · {prod.category_name}
                  </div>
                </div>
                <ArrowRight size={16} color="#737373" />
              </div>
            ))}
          </div>
        )}

        {!loading && searchTerm.trim().length >= 2 && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#737373', fontSize: '0.85rem' }}>
            No se encontraron polos para "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
};
