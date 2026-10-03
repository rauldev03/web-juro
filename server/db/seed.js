import bcrypt from 'bcryptjs';
import db, { initDatabase } from './index.js';

export function seedDatabase() {
  initDatabase();

  // 1. Seed Admin User (if not exists)
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@kkrius.com');
  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    db.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run('Admin KKRIUS', 'admin@kkrius.com', hash, 'admin');
    console.log('✅ Admin user created: admin@kkrius.com / admin123');
  }

  // 2. Seed Categories
  const categories = [
    { name: 'Oversize', slug: 'oversize', description: 'Corte holgado contemporáneo con hombros caídos.' },
    { name: 'Heavyweight', slug: 'heavyweight', description: 'Algodón peruano pesado de 280-320 GSM para máxima caída.' },
    { name: 'Boxy Fit', slug: 'boxy-fit', description: 'Silueta cuadrada y corta, diseño vanguardista streetwear.' },
    { name: 'Vintage Wash', slug: 'vintage-wash', description: 'Acabados lavados al ácido con tonos sutilmente desvanecidos.' },
    { name: 'Minimal Raw', slug: 'minimal-raw', description: 'Líneas puras y acabados limpios para uso diario premium.' }
  ];

  for (const cat of categories) {
    const exists = db.prepare('SELECT id FROM categories WHERE slug = ?').get(cat.slug);
    if (!exists) {
      db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)').run(cat.name, cat.slug, cat.description);
    }
  }

  // 3. Seed Colors
  const colors = [
    { name: 'Negro Pitch', hex_code: '#0A0A0A', slug: 'negro' },
    { name: 'Blanco Crudo', hex_code: '#F4F4F2', slug: 'blanco' },
    { name: 'Gris Melange', hex_code: '#9E9E9E', slug: 'gris-melange' },
    { name: 'Carbón Lavado', hex_code: '#2A2A2A', slug: 'carbon-lavado' }
  ];

  for (const col of colors) {
    const exists = db.prepare('SELECT id FROM colors WHERE slug = ?').get(col.slug);
    if (!exists) {
      db.prepare('INSERT INTO colors (name, hex_code, slug) VALUES (?, ?, ?)').run(col.name, col.hex_code, col.slug);
    }
  }

  // 4. Seed Sizes
  const sizes = [
    { name: 'XS', sort_order: 1 },
    { name: 'S', sort_order: 2 },
    { name: 'M', sort_order: 3 },
    { name: 'L', sort_order: 4 },
    { name: 'XL', sort_order: 5 },
    { name: 'XXL', sort_order: 6 }
  ];

  for (const sz of sizes) {
    const exists = db.prepare('SELECT id FROM sizes WHERE name = ?').get(sz.name);
    if (!exists) {
      db.prepare('INSERT INTO sizes (name, sort_order) VALUES (?, ?)').run(sz.name, sz.sort_order);
    }
  }

  // 5. Seed Initial Demo Products
  const countProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (countProducts.count === 0) {
    console.log('Seeding initial products...');

    // Fetch mapped categories, colors, and sizes
    const catMap = {};
    db.prepare('SELECT id, slug FROM categories').all().forEach(c => { catMap[c.slug] = c.id; });

    const colMap = {};
    db.prepare('SELECT id, slug FROM colors').all().forEach(c => { colMap[c.slug] = c.id; });

    const sizeMap = {};
    db.prepare('SELECT id, name FROM sizes').all().forEach(s => { sizeMap[s.name] = s.id; });

    const demoProducts = [
      {
        name: 'Polo Oversize Essential',
        slug: 'polo-oversize-essential',
        description: 'Polo de silueta oversize confeccionado en 100% algodón peinado pesado (280 GSM). Cuello camisero abierto minimalista sin botones, hombros caídos y costuras reforzadas. El balance perfecto entre comodidad streetwear y sofisticación contemporánea.',
        price: 59.90,
        category_id: catMap['oversize'],
        active: 1,
        featured: 1,
        images: [
          { url: '/images/products/polo-black-essential.jpg', primary: 1, sort: 0 },
          { url: '/images/products/polo-white-cotton.jpg', primary: 0, sort: 1 },
          { url: '/images/products/polo-grey-heather.jpg', primary: 0, sort: 2 }
        ],
        variants: [
          // Negro
          { color: 'negro', size: 'S', stock: 10 },
          { color: 'negro', size: 'M', stock: 20 },
          { color: 'negro', size: 'L', stock: 15 },
          { color: 'negro', size: 'XL', stock: 8 },
          { color: 'negro', size: 'XXL', stock: 3 },
          // Blanco
          { color: 'blanco', size: 'S', stock: 8 },
          { color: 'blanco', size: 'M', stock: 14 },
          { color: 'blanco', size: 'L', stock: 12 },
          { color: 'blanco', size: 'XL', stock: 6 },
          // Gris Melange
          { color: 'gris-melange', size: 'S', stock: 5 },
          { color: 'gris-melange', size: 'M', stock: 10 },
          { color: 'gris-melange', size: 'L', stock: 8 },
          { color: 'gris-melange', size: 'XL', stock: 2 }
        ]
      },
      {
        name: 'Polo Heavyweight Raw Cut',
        slug: 'polo-heavyweight-raw-cut',
        description: 'Estructura robusta de 320 GSM con caída pronunciada. Cuello polo sin ribetes tradicionales para un acabado arquitectónico y pulido. Diseñado para resistir lavados continuos manteniendo su forma y textura original.',
        price: 79.90,
        category_id: catMap['heavyweight'],
        active: 1,
        featured: 1,
        images: [
          { url: '/images/products/polo-white-cotton.jpg', primary: 1, sort: 0 },
          { url: '/images/products/polo-charcoal-raw.jpg', primary: 0, sort: 1 }
        ],
        variants: [
          { color: 'blanco', size: 'S', stock: 12 },
          { color: 'blanco', size: 'M', stock: 18 },
          { color: 'blanco', size: 'L', stock: 15 },
          { color: 'blanco', size: 'XL', stock: 7 },
          { color: 'carbon-lavado', size: 'S', stock: 8 },
          { color: 'carbon-lavado', size: 'M', stock: 14 },
          { color: 'carbon-lavado', size: 'L', stock: 10 },
          { color: 'carbon-lavado', size: 'XL', stock: 5 }
        ]
      },
      {
        name: 'Polo Boxy Street Dark Edition',
        slug: 'polo-boxy-street-dark-edition',
        description: 'Corte boxy amplio a la altura del torso con largo ligeramente recortado para encajar a la perfección con pantalones sueltos o cargo. Algodón premium texturizado y cuello tipo polo abierto en tono negro profundo.',
        price: 69.90,
        category_id: catMap['boxy-fit'],
        active: 1,
        featured: 1,
        images: [
          { url: '/images/products/polo-charcoal-raw.jpg', primary: 1, sort: 0 },
          { url: '/images/products/polo-black-essential.jpg', primary: 0, sort: 1 }
        ],
        variants: [
          { color: 'carbon-lavado', size: 'S', stock: 10 },
          { color: 'carbon-lavado', size: 'M', stock: 16 },
          { color: 'carbon-lavado', size: 'L', stock: 12 },
          { color: 'carbon-lavado', size: 'XL', stock: 4 },
          { color: 'negro', size: 'S', stock: 9 },
          { color: 'negro', size: 'M', stock: 15 },
          { color: 'negro', size: 'L', stock: 11 }
        ]
      },
      {
        name: 'Polo Acid Wash Heather Edition',
        slug: 'polo-acid-wash-heather-edition',
        description: 'Tratamiento especial de lavado artesanal para obtener tonalidades grises minerales únicas en cada prenda. Tacto ultra suave, caída fluida y cuello polo limpio sin apliques plásticos.',
        price: 74.90,
        category_id: catMap['vintage-wash'],
        active: 1,
        featured: 0,
        images: [
          { url: '/images/products/polo-grey-heather.jpg', primary: 1, sort: 0 }
        ],
        variants: [
          { color: 'gris-melange', size: 'S', stock: 8 },
          { color: 'gris-melange', size: 'M', stock: 12 },
          { color: 'gris-melange', size: 'L', stock: 9 },
          { color: 'gris-melange', size: 'XL', stock: 3 }
        ]
      },
      {
        name: 'Polo Minimal Raw Studio',
        slug: 'polo-minimal-raw-studio',
        description: 'La expresión más depurada del polo contemporáneo. Líneas sobrias, corte regular amplio y terminaciones invisibles. Diseñado como prenda clave de fondo de armario para entusiastas del diseño neutro.',
        price: 49.90,
        category_id: catMap['minimal-raw'],
        active: 1,
        featured: 0,
        images: [
          { url: '/images/products/polo-black-essential.jpg', primary: 1, sort: 0 },
          { url: '/images/products/polo-white-cotton.jpg', primary: 0, sort: 1 }
        ],
        variants: [
          { color: 'negro', size: 'S', stock: 15 },
          { color: 'negro', size: 'M', stock: 25 },
          { color: 'negro', size: 'L', stock: 20 },
          { color: 'blanco', size: 'S', stock: 12 },
          { color: 'blanco', size: 'M', stock: 20 },
          { color: 'blanco', size: 'L', stock: 18 }
        ]
      }
    ];

    for (const p of demoProducts) {
      const result = db.prepare(`
        INSERT INTO products (name, slug, description, price, category_id, active, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(p.name, p.slug, p.description, p.price, p.category_id, p.active, p.featured);

      const productId = result.lastInsertRowid;

      for (const img of p.images) {
        db.prepare(`
          INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, ?, ?)
        `).run(productId, img.url, img.primary, img.sort);
      }

      for (const v of p.variants) {
        const colorId = colMap[v.color];
        const sizeId = sizeMap[v.size];
        if (colorId && sizeId) {
          db.prepare(`
            INSERT INTO product_variants (product_id, color_id, size_id, stock)
            VALUES (?, ?, ?, ?)
          `).run(productId, colorId, sizeId, v.stock);
        }
      }
    }

    console.log('✅ Demo products seeded successfully!');
  }
}
