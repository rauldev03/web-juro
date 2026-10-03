import db from '../db/index.js';

export class OrdersService {
  /**
   * Place a new order, atomically check & deduct stock for each specific variant
   */
  static createOrder({ customer_name, customer_phone, customer_email, customer_address, items, notes, payment_method = 'whatsapp' }) {
    if (!customer_name || !customer_phone) {
      throw new Error('Nombre y teléfono de contacto requeridos.');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('El carrito está vacío.');
    }

    // Begin atomic transaction
    db.exec('BEGIN TRANSACTION');

    try {
      let totalAmount = 0;
      const validatedItems = [];

      for (const item of items) {
        // Find the variant
        const variant = db.prepare(`
          SELECT 
            pv.id as variant_id,
            pv.product_id,
            pv.stock,
            p.name as product_name,
            p.price as unit_price,
            p.active as product_active,
            c.name as color_name,
            s.name as size_name
          FROM product_variants pv
          JOIN products p ON pv.product_id = p.id
          JOIN colors c ON pv.color_id = c.id
          JOIN sizes s ON pv.size_id = s.id
          WHERE pv.id = ?
        `).get(item.variant_id);

        if (!variant) {
          throw new Error(`Variante no encontrada para el producto #${item.product_id || ''}`);
        }

        if (variant.product_active !== 1) {
          throw new Error(`El producto "${variant.product_name}" ya no se encuentra disponible.`);
        }

        const qty = parseInt(item.quantity) || 1;
        if (variant.stock < qty) {
          throw new Error(`Stock insuficiente para "${variant.product_name} - ${variant.color_name} (${variant.size_name})". Disponible: ${variant.stock}, Solicitado: ${qty}`);
        }

        // Deduct variant stock
        db.prepare('UPDATE product_variants SET stock = stock - ? WHERE id = ?').run(qty, variant.variant_id);

        const subtotal = variant.unit_price * qty;
        totalAmount += subtotal;

        validatedItems.push({
          variant_id: variant.variant_id,
          product_id: variant.product_id,
          product_name: variant.product_name,
          color_name: variant.color_name,
          size_name: variant.size_name,
          unit_price: variant.unit_price,
          quantity: qty,
          subtotal
        });
      }

      // Generate order number
      const orderNumber = 'KKR-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);

      const orderResult = db.prepare(`
        INSERT INTO orders (order_number, customer_name, customer_phone, customer_email, customer_address, total, payment_method, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        orderNumber,
        customer_name.trim(),
        customer_phone.trim(),
        customer_email ? customer_email.trim() : null,
        customer_address ? customer_address.trim() : null,
        totalAmount,
        payment_method,
        notes || null
      );

      const orderId = orderResult.lastInsertRowid;

      for (const item of validatedItems) {
        db.prepare(`
          INSERT INTO order_items (order_id, product_id, variant_id, product_name, color_name, size_name, unit_price, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          orderId,
          item.product_id,
          item.variant_id,
          item.product_name,
          item.color_name,
          item.size_name,
          item.unit_price,
          item.quantity,
          item.subtotal
        );
      }

      db.exec('COMMIT');

      // Prepare WhatsApp message
      const itemsListText = validatedItems
        .map(i => `• ${i.product_name} | ${i.color_name} [${i.size_name}] x${i.quantity} - S/ ${(i.subtotal).toFixed(2)}`)
        .join('\n');

      const waText = `*NUEVO PEDIDO JURO*\n` +
        `Orden: #${orderNumber}\n` +
        `Cliente: ${customer_name}\n` +
        `Teléfono: ${customer_phone}\n` +
        (customer_address ? `Dirección: ${customer_address}\n` : '') +
        `\n*PRENDAS:*\n${itemsListText}\n\n` +
        `*TOTAL: S/ ${totalAmount.toFixed(2)}*\n` +
        (notes ? `Notas: ${notes}\n` : '') +
        `\n_Por favor confirmar disponibilidad y método de pago (Yape / Plin / Transferencia)._`;

      return {
        success: true,
        order: {
          id: orderId,
          order_number: orderNumber,
          customer_name,
          total: totalAmount,
          items: validatedItems
        },
        whatsapp_url: `https://wa.me/51999999999?text=${encodeURIComponent(waText)}`
      };
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }

  /**
   * Get all orders for admin
   */
  static getAllOrders() {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    return orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return { ...order, items };
    });
  }
}
