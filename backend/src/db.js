const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    role TEXT DEFAULT 'user',
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    discount REAL DEFAULT 0,
    finalTotal REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    deliveryAddress TEXT NOT NULL,
    deliveryNote TEXT DEFAULT '',
    customerName TEXT NOT NULL,
    customerEmail TEXT DEFAULT '',
    customerPhone TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    mealId TEXT NOT NULL,
    mealData TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id),
    UNIQUE(userId, mealId)
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    label TEXT DEFAULT 'Home',
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    phone TEXT NOT NULL,
    isDefault INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS wallet_transactions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS meals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    originalPrice REAL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    rating REAL DEFAULT 4.5,
    reviews INTEGER DEFAULT 0,
    discount INTEGER DEFAULT 0,
    isNew INTEGER DEFAULT 0
  );
`);

// Seed meals if table is empty
const mealCount = db.prepare('SELECT COUNT(*) as c FROM meals').get();
if (mealCount.c === 0) {
  const seedMeals = [
    { id: 'm1', name: 'Jollof Rice & Chicken', description: 'Classic Nigerian jollof rice with tender grilled chicken, plantains, and coleslaw.', price: 4500, originalPrice: 5500, category: 'Main Dishes', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&q=80', rating: 4.8, reviews: 124, discount: 18, isNew: 0 },
    { id: 'm2', name: 'Egusi Soup & Pounded Yam', description: 'Rich melon seed soup with assorted meat, served with smooth pounded yam.', price: 5000, category: 'Soups', image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400&q=80', rating: 4.7, reviews: 98, isNew: 0 },
    { id: 'm3', name: 'Fried Rice & Chicken', description: 'Savory fried rice with vegetables, liver, and spiced fried chicken.', price: 4200, originalPrice: 4800, category: 'Main Dishes', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80', rating: 4.6, reviews: 87, discount: 12, isNew: 0 },
    { id: 'm4', name: 'Pepper Soup (Catfish)', description: 'Spicy catfish pepper soup with native herbs — a warming delicacy.', price: 3800, category: 'Soups', image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400&q=80', rating: 4.5, reviews: 62, isNew: 1 },
    { id: 'm5', name: 'Banga Soup & Starch', description: 'Authentic Delta-style banga soup with fresh catfish, served with starch.', price: 5500, category: 'Soups', image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400&q=80', rating: 4.9, reviews: 45, isNew: 1 },
    { id: 'm6', name: 'Grilled Fish & Chips', description: 'Whole grilled tilapia with a side of crispy potato chips and sauce.', price: 4800, category: 'Grills', image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400&q=80', rating: 4.4, reviews: 56, isNew: 0 },
    { id: 'm7', name: 'Suya (Beef Skewers)', description: 'Spiced grilled beef suya with sliced onions, tomatoes, and pepper sauce.', price: 3500, category: 'Grills', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80', rating: 4.6, reviews: 134, isNew: 0 },
    { id: 'm8', name: 'Ofada Rice & Sauce', description: 'Local ofada rice with ayamase sauce — a burst of spicy flavors.', price: 4000, category: 'Main Dishes', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&q=80', rating: 4.3, reviews: 39, isNew: 0 },
    { id: 'm9', name: 'Zobo Drink', description: 'Refreshing hibiscus drink with ginger, pineapple, and cloves.', price: 800, category: 'Drinks', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', rating: 4.2, reviews: 212, isNew: 0 },
    { id: 'm10', name: 'Chapman Mocktail', description: 'Classic Nigerian chapman cocktail with grenadine, cucumber, and lemon.', price: 1500, category: 'Drinks', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80', rating: 4.5, reviews: 178, isNew: 0 },
    { id: 'm11', name: 'Moi Moi (Bean Pudding)', description: 'Steamed bean pudding with fish, eggs, and crayfish — a protein-rich snack.', price: 1200, category: 'Small Chops', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&q=80', rating: 4.4, reviews: 93, isNew: 0 },
    { id: 'm12', name: 'Puff Puff (5 pieces)', description: 'Deep-fried fluffy dough balls, lightly sweetened — the perfect street snack.', price: 1500, category: 'Small Chops', image: 'https://images.unsplash.com/photo-1624378459401-b13fab33ebd2?w=400&q=80', rating: 4.7, reviews: 256, isNew: 0 },
  ];
  const insert = db.prepare('INSERT INTO meals (id, name, description, price, originalPrice, category, image, rating, reviews, discount, isNew) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const tx = db.transaction(() => {
    for (const m of seedMeals) insert.run(m.id, m.name, m.description, m.price, m.originalPrice || null, m.category, m.image, m.rating, m.reviews, m.discount, m.isNew);
  });
  tx();
}

module.exports = db;
