const pool = require('./db');

const richProducts = [
  {
    name: 'Sony WH-1000XM5 Noise Canceling Headphones',
    description: 'Industry-leading wireless noise-canceling headphones with 30-hour battery life, crystal clear hands-free calling, and multipoint connection.',
    price: 24999,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    stock: 18
  },
  {
    name: 'Apple Watch Series 9 GPS',
    description: 'Smartwatch with Always-On Retina display, advanced health and fitness trackers, Crash Detection, and water resistance up to 50m.',
    price: 41900,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    stock: 25
  },
  {
    name: 'Logitech MX Master 3S Wireless Mouse',
    description: 'Performance wireless mouse with 8K DPI tracking on glass, quiet clicks, and ultra-fast ergonomic scrolling.',
    price: 8995,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    stock: 35
  },
  {
    name: 'Minimalist Top-Grain Leather Wallet',
    description: 'Slim RFID-blocking bifold wallet crafted from premium full-grain Italian leather. Holds up to 10 cards and cash.',
    price: 1999,
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
    stock: 50
  },
  {
    name: 'Polarized Aviator Sunglasses',
    description: 'Classic luxury polarized sunglasses with lightweight titanium frames and 100% UV400 protective scratch-resistant lenses.',
    price: 3499,
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
    stock: 40
  },
  {
    name: 'Ceramic Matte Coffee Mug & Warmer Set',
    description: 'Handcrafted ceramic mug with intelligent temperature-controlled heating coaster. Keeps your coffee at the ideal 55°C temperature.',
    price: 2499,
    category: 'Home & Kitchen',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    stock: 30
  },
  {
    name: 'Nordic Wooden LED Desk Lamp',
    description: 'Minimalist dimmable eye-caring desk lamp with wireless smartphone charging base and warm 3000K-6000K lighting modes.',
    price: 3899,
    category: 'Home & Kitchen',
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    stock: 22
  },
  {
    name: 'Aroma Diffuser & Essential Oil Humidifier',
    description: 'Ultrasonic cool mist humidifier with 7 ambient LED colors and automatic shut-off timer for ultimate relaxation.',
    price: 1899,
    category: 'Home & Kitchen',
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80',
    stock: 45
  },
  {
    name: 'Vintage Distressed Denim Jacket',
    description: 'Classic heavy-wash 100% cotton denim jacket with reinforced stitching and interior utility pockets.',
    price: 4499,
    category: 'Clothing',
    image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
    stock: 28
  },
  {
    name: 'Organic Heavyweight Crewneck T-Shirt',
    description: '240 GSM combed organic cotton t-shirt with pre-shrunk fabric and a structured tailored relaxed fit.',
    price: 1299,
    category: 'Clothing',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    stock: 65
  },
  {
    name: 'Adjustable Quick-Select Dumbbell (2.5kg - 24kg)',
    description: 'All-in-one dumbbell with dial system for rapid weight adjustments. Ideal for home gym strength workouts.',
    price: 12499,
    category: 'Sports',
    image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80',
    stock: 14
  },
  {
    name: 'Non-Slip Eco-Friendly Yoga Mat with Strap',
    description: '6mm high-density natural rubber workout mat with body alignment lines and sweat-resistant textured grip.',
    price: 2199,
    category: 'Sports',
    image_url: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&auto=format&fit=crop&q=80',
    stock: 35
  },
  {
    name: 'Stainless Steel Insulated Water Bottle 1L',
    description: 'Vacuum insulated double-wall flask keeps beverages ice cold for 24 hours or piping hot for 12 hours.',
    price: 1499,
    category: 'Sports',
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    stock: 60
  },
  {
    name: 'Marshall Emberton II Portable Bluetooth Speaker',
    description: 'Compact portable speaker with signature 360° True Stereophonic sound and 30+ hours of wireless playtime.',
    price: 14999,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    stock: 15
  },
  {
    name: 'Automatic Mechanical Skeleton Watch',
    description: 'Self-winding luxury wristwatch featuring a transparent sapphire crystal skeleton dial and genuine leather band.',
    price: 18500,
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
    stock: 12
  }
];

async function seed() {
  console.log('Seeding rich products into database...');
  for (const p of richProducts) {
    const existing = await pool.query('SELECT id FROM products WHERE name = $1', [p.name]);
    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO products (name, description, price, category, image_url, stock)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [p.name, p.description, p.price, p.category, p.image_url, p.stock]
      );
      console.log(`+ Inserted: ${p.name}`);
    } else {
      console.log(`= Exists: ${p.name}`);
    }
  }
  console.log('✅ Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
