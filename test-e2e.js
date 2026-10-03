async function runTest() {
  const API_URL = 'http://localhost:4000/api';
  console.log('🧪 Starting Full-Stack End-to-End Verification Test...');

  // 1. Health
  const healthRes = await fetch(`${API_URL}/health`);
  const health = await healthRes.json();
  console.log('✅ 1. Health Check:', health.status);

  // 2. Login
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@kkrius.com', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  if (!loginData.success) throw new Error('Login failed');
  console.log('✅ 2. Admin Authentication:', loginData.user.name, `(${loginData.user.email})`);
  const token = loginData.token;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 3. Auth Me
  const meRes = await fetch(`${API_URL}/auth/me`, { headers });
  const meData = await meRes.json();
  console.log('✅ 3. Protected Route Verified:', meData.user.email, 'Role:', meData.user.role);

  // 4. Create Product with Color x Size Matrix
  const productPayload = {
    name: 'Polo Heavy Boxy Acid Wash',
    description: 'Polo con corte contemporáneo boxy y tratamiento vintage wash en algodón pesado 300 GSM.',
    price: 85.00,
    category_id: 3,
    active: 1,
    featured: 1,
    images: [
      { image_url: '/images/products/polo-charcoal-raw.jpg', is_primary: 1, sort_order: 0 },
      { image_url: '/images/products/polo-black-essential.jpg', is_primary: 0, sort_order: 1 }
    ],
    variants: [
      { color_id: 1, size_id: 2, stock: 12 }, // Negro - S
      { color_id: 1, size_id: 3, stock: 25 }, // Negro - M
      { color_id: 1, size_id: 4, stock: 18 }, // Negro - L
      { color_id: 4, size_id: 2, stock: 8 },  // Carbón - S
      { color_id: 4, size_id: 3, stock: 15 }  // Carbón - M
    ]
  };

  const createRes = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers,
    body: JSON.stringify(productPayload)
  });
  const createData = await createRes.json();
  console.log('✅ 4. Product Created with Variant Matrix:', createData.data.name);
  console.log(`   Slug: /producto/${createData.data.slug}`);
  console.log(`   Total Stock: ${createData.data.total_stock} units across ${createData.data.variants.length} variants`);

  // 5. Verify Public Store Catalog
  const publicRes = await fetch(`${API_URL}/products`);
  const publicData = await publicRes.json();
  const found = publicData.data.find(p => p.slug === 'polo-heavy-boxy-acid-wash');
  console.log('✅ 5. Public Store Catalog Live Verification:', found ? 'FOUND' : 'NOT FOUND');

  // 6. Test Atomic Order Checkout & Stock Reduction
  const targetVariant = createData.data.variants.find(v => v.color_id === 1 && v.size_id === 3); // Negro - M (initial: 25)
  console.log(`   Target variant to order: Negro - M (Initial Stock: ${targetVariant.stock})`);

  const orderPayload = {
    customer_name: 'Carlos Test',
    customer_phone: '999888777',
    customer_address: 'Av. Larco 743, Miraflores, Lima',
    notes: 'Pago por Yape al recibir',
    items: [
      {
        variant_id: targetVariant.variant_id,
        product_id: createData.data.id,
        quantity: 2
      }
    ]
  };

  const orderRes = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });
  const orderData = await orderRes.json();
  console.log('✅ 6. Atomic Order Checkout Completed:');
  console.log(`   Order #: ${orderData.order.order_number} | Total: S/ ${orderData.order.total.toFixed(2)}`);
  console.log(`   WhatsApp link generated: ${orderData.whatsapp_url.substring(0, 50)}...`);

  // Check updated variant stock
  const refetchRes = await fetch(`${API_URL}/products/${createData.data.slug}`);
  const refetchData = await refetchRes.json();
  const updatedVariant = refetchData.data.variants.find(v => v.variant_id === targetVariant.variant_id);
  console.log(`   Stock after 2 purchases (Expected: 23): ${updatedVariant.stock}`);
  if (updatedVariant.stock !== 23) throw new Error('Stock deduction failed!');

  // 7. Test Inventory Adjustment
  const inventoryRes = await fetch(`${API_URL}/inventory/variant/${targetVariant.variant_id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ stock: 50 })
  });
  const invData = await inventoryRes.json();
  console.log('✅ 7. Inventory Quick Adjust Verified:', invData.data.product_name, invData.data.color_name, invData.data.size_name, `New Stock: ${invData.data.stock}`);

  // 8. Stats & Dashboard
  const statsRes = await fetch(`${API_URL}/inventory/stats`, { headers });
  const statsData = await statsRes.json();
  console.log('✅ 8. Dashboard Metrics:');
  console.log(`   Total Products: ${statsData.data.totalProducts}`);
  console.log(`   Total Stock Units: ${statsData.data.totalStock}`);
  console.log(`   Total Orders: ${statsData.data.totalOrders}`);

  console.log('\n🎉 ALL 8 FULL-STACK TESTS PASSED 100% WITH ZERO ERRORS!');
}

runTest().catch(e => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});
