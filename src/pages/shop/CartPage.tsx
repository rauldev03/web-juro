import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, Send, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      showToast('Por favor completa tu nombre y número de WhatsApp', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = cart.map(item => ({
        variant_id: item.variant_id,
        product_id: item.product_id,
        quantity: item.quantity
      }));

      const res = await api.orders.create({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        notes: orderNotes,
        items: orderItems,
        payment_method: 'whatsapp'
      });

      if (res.success) {
        showToast('¡Pedido generado con éxito!', 'success');
        clearCart();
        if (res.whatsapp_url) {
          window.open(res.whatsapp_url, '_blank');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Error al procesar pedido', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-page" style={{ padding: '3rem 0 6rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <Link
            to="/productos"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#737373' }}
          >
            <ArrowLeft size={14} /> CONTINUAR COMPRANDO
          </Link>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginTop: '0.5rem', textTransform: 'uppercase' }}>
            BOLSA DE COMPRAS
          </h1>
        </div>

        {cart.length === 0 ? (
          <div style={{ padding: '5rem 1rem', textAlign: 'center', backgroundColor: '#121212', border: '1px solid #222222' }}>
            <ShoppingBag size={40} color="#555" style={{ marginBottom: '1.25rem' }} />
            <h3 style={{ textTransform: 'uppercase', marginBottom: '0.75rem' }}>Tu bolsa está vacía</h3>
            <p style={{ color: '#737373', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              No tienes polos agregados en este momento.
            </p>
            <Link to="/productos" className="btn btn-primary">
              EXPLORAR CATÁLOGO
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem' }}>
            {/* Left: Items list */}
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {cart.map(item => (
                  <div
                    key={item.cart_id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '100px 1fr auto',
                      gap: '1.25rem',
                      padding: '1.25rem',
                      backgroundColor: '#121212',
                      border: '1px solid #222222'
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100px', aspectRatio: '3/4', objectFit: 'cover' }}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{item.name}</h4>
                        <div style={{ fontSize: '0.8rem', color: '#737373', marginTop: '0.25rem' }}>
                          Color: {item.color.name} · Talla: {item.size.name}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <div className="cart-item-qty">
                          <button onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}>
                            <Minus size={13} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                            disabled={item.quantity >= item.max_stock}
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                          S/ {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cart_id)}
                      style={{ color: '#555', cursor: 'pointer', padding: '0.25rem' }}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Checkout summary */}
            <div>
              <div className="form-card" style={{ position: 'sticky', top: 'calc(var(--header-height) + 2rem)' }}>
                <h3 className="form-card-title">DATOS DE ENVÍO & PEDIDO</h3>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Daniel Castillo"
                      className="form-input"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej: 998877665"
                      className="form-input"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dirección y Ciudad de Envío</label>
                    <input
                      type="text"
                      placeholder="Ej: Calle Los Sauces 450, San Isidro, Lima"
                      className="form-input"
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notas Especiales</label>
                    <textarea
                      placeholder="Indicaciones para el despacho..."
                      className="form-textarea"
                      style={{ minHeight: '60px' }}
                      value={orderNotes}
                      onChange={e => setOrderNotes(e.target.value)}
                    />
                  </div>

                  <div style={{ borderTop: '1px solid #262626', paddingTop: '1.25rem', marginTop: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      TOTAL:
                    </span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                      S/ {totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary btn-full btn-lg"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
                  >
                    <Send size={16} />
                    {isSubmitting ? 'PROCESANDO...' : 'FINALIZAR POR WHATSAPP'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
