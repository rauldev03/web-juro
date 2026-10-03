import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Send, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
  const { showToast } = useToast();

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      showToast('Por favor completa tu nombre y número de teléfono / WhatsApp', 'error');
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
        setIsCheckoutModalOpen(false);
        setIsCartOpen(false);

        // Open WhatsApp link if available
        if (res.whatsapp_url) {
          window.open(res.whatsapp_url, '_blank');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Error al procesar el pedido. Verifica el stock.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={18} />
            <h3 className="cart-drawer-title">BOLSA DE COMPRAS ({cart.length})</h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{ color: '#A3A3A3', cursor: 'pointer', padding: '0.25rem' }}
            aria-label="Cerrar bolsa"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto 0', color: '#737373' }}>
              <p style={{ fontSize: '0.95rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
                Tu bolsa de compras está vacía
              </p>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setIsCartOpen(false)}
              >
                VER PRODUCTOS
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cart_id} className="cart-item">
                <img
                  src={item.image || '/images/products/polo-black-essential.jpg'}
                  alt={item.name}
                  className="cart-item-img"
                />

                <div className="cart-item-details">
                  <div>
                    <h4 className="cart-item-name">{item.name}</h4>
                    <div className="cart-item-variant">
                      {item.color.name} · Talla {item.size.name}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <div className="cart-item-qty">
                      <button
                        onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
                        aria-label="Disminuir"
                      >
                        <Minus size={12} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                        disabled={item.quantity >= item.max_stock}
                        aria-label="Aumentar"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="cart-item-price">
                      S/ {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.cart_id)}
                  style={{ color: '#525252', alignSelf: 'flex-start', padding: '0.25rem' }}
                  title="Eliminar del carrito"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal-row">
              <span className="cart-subtotal-label">SUBTOTAL:</span>
              <span className="cart-subtotal-value">S/ {totalAmount.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={() => setIsCheckoutModalOpen(true)}
            >
              FINALIZAR PEDIDO (WHATSAPP)
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="search-modal-overlay" onClick={() => setIsCheckoutModalOpen(false)}>
          <div className="search-modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #262626', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase' }}>COMPLETAR DATOS DE ENTREGA</h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} style={{ color: '#737373' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Paredes"
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
                  placeholder="Ej: 987654321"
                  className="form-input"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Dirección / Ciudad de Envío</label>
                <input
                  type="text"
                  placeholder="Ej: Av. Benavides 1234, Miraflores, Lima"
                  className="form-input"
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notas o Indicaciones Adicionales</label>
                <textarea
                  placeholder="Instrucciones para la entrega o preferencia de pago (Yape / Plin / Transferencia)..."
                  className="form-textarea"
                  style={{ minHeight: '70px' }}
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                />
              </div>

              <div style={{ borderTop: '1px solid #262626', paddingTop: '1rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#737373' }}>TOTAL A PAGAR:</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>S/ {totalAmount.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={isSubmitting}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Send size={16} />
                {isSubmitting ? 'PROCESANDO...' : 'ENVIAR PEDIDO A WHATSAPP'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CartDrawer;
