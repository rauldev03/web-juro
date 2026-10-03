import React, { useState, useEffect } from 'react';
import { ShoppingBag, Phone, User, MapPin, Calendar } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import AdminHeader from '../../components/layout/AdminHeader';
import { api } from '../../services/api';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.orders.getAll();
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-main">
        <AdminHeader
          title="GESTIÓN DE PEDIDOS"
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        />

        <main className="admin-content">
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', textTransform: 'uppercase' }}>
              REGISTRO DE ÓRDENES ({orders.length})
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#737373', marginTop: '0.2rem' }}>
              Historial de pedidos recibidos desde la tienda pública y confirmaciones de WhatsApp.
            </p>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#737373' }}>
              Cargando pedidos...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '4rem 2rem', backgroundColor: '#121212', border: '1px solid #222222', textAlign: 'center' }}>
              <ShoppingBag size={32} color="#555" style={{ marginBottom: '1rem' }} />
              <h3 style={{ textTransform: 'uppercase', marginBottom: '0.5rem' }}>No hay pedidos registrados aún</h3>
              <p style={{ color: '#737373', fontSize: '0.85rem' }}>
                Cuando los clientes agreguen prendas y finalicen pedido por WhatsApp, aparecerán aquí.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {orders.map(order => (
                <div key={order.id} className="form-card" style={{ padding: '1.5rem', marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #222', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: '#737373', textTransform: 'uppercase' }}>
                        ORDEN #{order.order_number}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>{order.customer_name}</h3>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
                        S/ {order.total.toFixed(2)}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#737373', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                        <Calendar size={12} /> {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#A3A3A3' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} color="#737373" />
                      <span>{order.customer_phone}</span>
                    </div>
                    {order.customer_address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} color="#737373" />
                        <span>{order.customer_address}</span>
                      </div>
                    )}
                    {order.customer_email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={14} color="#737373" />
                        <span>{order.customer_email}</span>
                      </div>
                    )}
                  </div>

                  {/* Order Items Table */}
                  <div style={{ backgroundColor: '#161616', padding: '1rem', border: '1px solid #222' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', color: '#737373', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      PRENDAS SOLICITADAS:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {order.items && order.items.map((item: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                          <span>
                            <strong>{item.product_name}</strong> · {item.color_name} (Talla {item.size_name}) x{item.quantity}
                          </span>
                          <span style={{ fontWeight: 700 }}>
                            S/ {item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
