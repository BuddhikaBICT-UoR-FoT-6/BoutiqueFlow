/*
  Seed script for MongoDB Atlas / Azure Cosmos DB.
  - Generates 100 realistic Product records.
  - Inserts sample Users, Inventory, Orders, Financials.
*/

require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/user');
const Product = require('./models/product');
const Inventory = require('./models/inventory');
const Order = require('./models/order');
const Financial = require('./models/financial');

const FASHION_IMAGES = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80',
  'https://images.unsplash.com/photo-1434389678369-182328d73b09?w=800&q=80',
  'https://images.unsplash.com/photo-1485230405346-71acb9518d9c?w=800&q=80',
  'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&q=80',
  'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=800&q=80',
  'https://images.unsplash.com/photo-1618932260643-e4bc117a23c5?w=800&q=80',
  'https://images.unsplash.com/photo-1542272604-780c8d197609?w=800&q=80',
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80',
  'https://images.unsplash.com/photo-1591369822096-11440f935398?w=800&q=80',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
  'https://images.unsplash.com/photo-1520975954732-38dd512ba24e?w=800&q=80',
  'https://images.unsplash.com/photo-1550614000-4b95d466f284?w=800&q=80',
  'https://images.unsplash.com/photo-1489987707023-afc6a463c656?w=800&q=80'
];

const ADJECTIVES = ['Classic', 'Premium', 'Essential', 'Vintage', 'Modern', 'Minimalist', 'Cozy', 'Elegant', 'Urban', 'Relaxed', 'Signature', 'Tailored', 'Chic'];
const COLORS = ['Black', 'White', 'Navy', 'Olive', 'Burgundy', 'Charcoal', 'Beige', 'Cream', 'Dusty Rose', 'Slate', 'Camel'];
const CATEGORIES = [
  { cat: 'Shirts', sub: ['T-Shirts', 'Blouses', 'Button-Downs'], names: ['Tee', 'Blouse', 'Shirt', 'Top'] },
  { cat: 'Pants', sub: ['Jeans', 'Trousers', 'Chinos'], names: ['Jeans', 'Trousers', 'Chinos', 'Pants'] },
  { cat: 'Dresses', sub: ['Casual', 'Formal', 'Summer'], names: ['Dress', 'Gown', 'Sundress', 'Wrap Dress'] },
  { cat: 'Outerwear', sub: ['Jackets', 'Coats', 'Sweaters'], names: ['Jacket', 'Coat', 'Sweater', 'Cardigan'] },
  { cat: 'Accessories', sub: ['Bags', 'Belts', 'Scarves'], names: ['Tote Bag', 'Belt', 'Scarf', 'Crossbody'] }
];

function randomEl(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateProducts(count) {
  const products = [];
  for (let i = 0; i < count; i++) {
    const categoryGroup = randomEl(CATEGORIES);
    const category = categoryGroup.cat;
    const sub_category = randomEl(categoryGroup.sub);
    const baseName = randomEl(categoryGroup.names);
    const adjective = randomEl(ADJECTIVES);
    const color = randomEl(COLORS);
    
    // Add padded index to ensure unique names (e.g. Classic Black Jeans #042)
    const name = `${adjective} ${color} ${baseName} #${(i + 1).toString().padStart(3, '0')}`;
    const price = Math.floor(Math.random() * 120) + 20; // 20 to 139
    const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0;
    
    products.push({
      name,
      description: `Experience ultimate comfort and style with our ${name.toLowerCase()}. Crafted from premium materials for a perfect fit, ideal for any occasion.`,
      category,
      sub_category,
      price,
      discount,
      image: [randomEl(FASHION_IMAGES), randomEl(FASHION_IMAGES)],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [color],
      tags: [category, adjective, 'Fashion', 'New'],
      stock: {
        S: Math.floor(Math.random() * 20),
        M: Math.floor(Math.random() * 30),
        L: Math.floor(Math.random() * 30),
        XL: Math.floor(Math.random() * 15)
      }
    });
  }
  return products;
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error('Missing MONGO_URI in server/.env');
  }

  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected.');

  console.log('Clearing old data via sequential deleteMany...');
  try { await User.deleteMany({}); } catch (e) { console.log('User clear skip', e.message); }
  await delay(1000);
  try { await Product.deleteMany({}); } catch (e) { console.log('Product clear skip', e.message); }
  await delay(1000);
  try { await Order.deleteMany({}); } catch (e) { console.log('Order clear skip', e.message); }
  await delay(1000);
  try { await Inventory.deleteMany({}); } catch (e) { console.log('Inventory clear skip', e.message); }
  await delay(1000);
  try { await Financial.deleteMany({}); } catch (e) { console.log('Financial clear skip', e.message); }
  await delay(1000);

  // --- Create Users ---
  console.log('Creating users...');
  const [superadmin, admin, customer] = await User.insertMany([
    {
      role: 'superadmin',
      full_name: 'Super Admin',
      email: 'superadmin@demo.com',
      password: '123456',
      phone: '+1-555-0100',
      address: { street: '1 Admin Way', city: 'Metropolis', country: 'US' }
    },
    {
      role: 'admin',
      full_name: 'Store Admin',
      email: 'admin@demo.com',
      password: '123456',
      phone: '+1-555-0101',
      address: { street: '2 Admin Way', city: 'Metropolis', country: 'US' }
    },
    {
      role: 'customer',
      full_name: 'Demo Customer',
      email: 'customer@demo.com',
      password: '123456',
      phone: '+1-555-0102',
      address: { street: '10 Market St', city: 'Metropolis', country: 'US' }
    }
  ]);

  // --- Create Products one by one to avoid Cosmos DB RU limit ---
  console.log('Generating and inserting 100 products one by one...');
  const productData = generateProducts(100);
  const products = [];
  
  for (let i = 0; i < productData.length; i++) {
    const inserted = await Product.create(productData[i]);
    products.push(inserted);
    if ((i + 1) % 10 === 0) console.log(`Inserted ${i + 1} products...`);
    await delay(300); // Wait 300ms between each insert to stay well under 1000 RU/s
  }

  // --- Create Inventory rows one by one ---
  console.log('Inserting inventory records one by one...');
  const inventoryData = products.map((p) => ({
    product_id: p._id,
    stock_by_size: {
      S: p.stock?.S ?? 0,
      M: p.stock?.M ?? 0,
      L: p.stock?.L ?? 0,
      XL: p.stock?.XL ?? 0
    },
    supplier: 'BoutiqueFlow Wholesale',
    supplier_email: 'wholesale@boutiqueflow.com'
  }));

  for (let i = 0; i < inventoryData.length; i++) {
    await Inventory.create(inventoryData[i]);
    if ((i + 1) % 10 === 0) console.log(`Inserted ${i + 1} inventory rows...`);
    await delay(300);
  }

  // --- Create a sample Order for the customer ---
  console.log('Creating sample orders...');
  const order = await Order.create({
    user_id: customer._id,
    items: [
      {
        product_id: products[0]._id,
        name: products[0].name,
        size: 'M',
        color: products[0].colors[0],
        quantity: 2,
        price: products[0].price
      },
      {
        product_id: products[3]._id,
        name: products[3].name,
        size: 'L',
        color: products[3].colors[0],
        quantity: 1,
        price: products[3].price
      }
    ],
    total_amount: products[0].price * 2 + products[3].price,
    status: 'pending',
    shipping_address: customer.address,
    payment_method: 'cash_on_delivery'
  });

  // --- Create Financial record for the order ---
  await Financial.create({
    order_id: order._id,
    user_id: customer._id,
    amount: order.total_amount,
    Payment_status: 'paid',
    notes: 'Seed transaction'
  });

  console.log('✅ Seed complete!');
  console.log(`Users: 3, Products: ${products.length}, Inventory: ${products.length}, Orders: 1, Financials: 1`);
  console.log('Demo logins:');
  console.log('  superadmin@demo.com / 123456');
  console.log('  admin@demo.com / 123456');
  console.log('  customer@demo.com / 123456');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  });
