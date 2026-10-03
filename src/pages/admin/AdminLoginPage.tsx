import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, Mail } from 'lucide-react';
import Logo from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@kkrius.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Ingresa tu correo y contraseña', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showToast('Sesión iniciada correctamente', 'success');
      navigate('/admin/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Credenciales incorrectas', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Back Link to Shop */}
        <Link
          to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#737373', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
        >
          <ArrowLeft size={13} /> Volver a la Tienda
        </Link>

        {/* Header */}
        <div className="admin-login-header">
          <Logo showSubtitle to="" />
          <h2 className="admin-login-title">PANEL ADMINISTRATIVO</h2>
          <p className="admin-login-sub">Ingresa tus credenciales para gestionar el catálogo e inventario.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={13} /> Correo Electrónico
            </label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="admin@kkrius.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={13} /> Contraseña
            </label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <ShieldCheck size={16} />
              {loading ? 'AUTENTICANDO...' : 'INICIAR SESIÓN'}
            </button>
          </div>
        </form>

        {/* Demo Credentials Helper */}
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#171717', border: '1px dashed #333333', fontSize: '0.75rem', color: '#888888' }}>
          <div style={{ fontWeight: 700, color: '#D4D4D4', marginBottom: '0.25rem' }}>CREDENCIALES DE ACCESO:</div>
          <div>Usuario: <code style={{ color: '#FFFFFF' }}>admin@kkrius.com</code></div>
          <div>Clave: <code style={{ color: '#FFFFFF' }}>admin123</code></div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
