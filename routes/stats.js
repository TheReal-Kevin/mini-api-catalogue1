const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Chemins des fichiers de données
const categoriesFilePath = path.join(__dirname, '../data/categories.json');
const productsFilePath = path.join(__dirname, '../data/products.json');
const usersFilePath = path.join(__dirname, '../data/users.json');

// Fonction pour lire les fichiers JSON
const readJson = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
};

router.get('/overview', (req, res) => {
  const products = readJson(productsFilePath);
  const categories = readJson(categoriesFilePath);
  const users = readJson(usersFilePath);

  // Statistiques générales
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalUsers = users.length;
  const totalRevenue = products.reduce((sum, p) => sum + p.price * (Math.floor(Math.random() * 50) + 1), 0); // Revenu fictif
  const totalOrders = Math.floor(Math.random() * 200) + 50; // Commandes fictives

  res.json({
    totalProducts,
    totalCategories,
    totalRevenue,
    totalOrders,
    totalUsers
  });
});

router.get('/all-products', (req, res) => {
  const products = readJson(productsFilePath);
  const categories = readJson(categoriesFilePath);

  // fonction pour ajouter le nom de la catégorie categoryName à chaque produit
  const productsWithCategory = products.map(p => {
    const category = categories.find(c => c.id === p.categoryId);
    return {
      ...p,
      categoryName: category ? category.name : 'Catégorie inconnue'
    };
  });

  res.json(productsWithCategory);
});

router.get('/orders', (req, res) => {
  // Données fictives de commandes
  const fakeOrders = [
    {
      id: 1,
      userName: 'Jean Dupont',
      productName: 'Ordinateur portable',
      total: 899.99,
      date: '2024-12-01',
      status: 'completed'
    },
    {
      id: 2,
      userName: 'Marie Martin',
      productName: 'Clavier mécanique',
      total: 79.9,
      date: '2024-12-02',
      status: 'pending'
    },
    {
      id: 3,
      userName: 'Pierre Durand',
      productName: 'Canapé 3 places',
      total: 499.0,
      date: '2024-12-03',
      status: 'completed'
    }
  ];

  res.json(fakeOrders);
});

router.get('/users', (req, res) => {
  const users = readJson(usersFilePath);

  //fonction pour générer des données fictives pour les stats
  const usersWithStats = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    orders: Math.floor(Math.random() * 10),
    totalSpent: Math.random() * 1000 + 100,
    joinDate: u.joinDate
  }));

  res.json(usersWithStats);
});

router.get('/products-by-category', (req, res) => {
  const products = readJson(productsFilePath);
  const categories = readJson(categoriesFilePath);

  const categoryCount = {};
  categories.forEach(c => {
    categoryCount[c.id] = 0;
  });

  products.forEach(p => {
    if (categoryCount[p.categoryId] !== undefined) {
      categoryCount[p.categoryId]++;
    }
  });

  const result = Object.keys(categoryCount).map(catId => {
    const cat = categories.find(c => c.id === parseInt(catId));
    return {
      name: cat ? cat.name : 'Inconnue',
      value: categoryCount[catId]
    };
  });

  res.json(result);
});

router.get('/price-by-category', (req, res) => {
  const products = readJson(productsFilePath);
  const categories = readJson(categoriesFilePath);

  const categoryPrices = {};
  categories.forEach(c => {
    categoryPrices[c.id] = [];
  });

  products.forEach(p => {
    if (categoryPrices[p.categoryId]) {
      categoryPrices[p.categoryId].push(p.price);
    }
  });

  const result = Object.keys(categoryPrices)
    .filter(catId => categoryPrices[catId].length > 0)
    .map(catId => {
      const cat = categories.find(c => c.id === parseInt(catId));
      const prices = categoryPrices[catId];
      const avgPrice = prices.length ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 0;
      return {
        name: cat ? cat.name : 'Inconnue',
        avgPrice
      };
    });

  res.json(result);
});

router.get('/sales-by-date', (req, res) => {
  // Données fictives de ventes par date
  const result = [
    { date: '2024-11-01', sales: 50 },
    { date: '2024-11-02', sales: 70 },
    { date: '2024-11-03', sales: 45 },
    { date: '2024-11-04', sales: 80 },
    { date: '2024-11-05', sales: 60 },
    { date: '2024-12-01', sales: 90 },
    { date: '2024-12-02', sales: 75 },
    { date: '2024-12-03', sales: 85 },
    { date: '2024-12-04', sales: 95 },
    { date: '2024-12-05', sales: 100 }
  ];

  res.json(result);
});

router.get('/top-products', (req, res) => {
  // Données fictives, basées sur produits existants
  const fakeTopProducts = [
    { id: 1, name: 'Ordinateur portable', orders: 45 },
    { id: 2, name: 'Clavier mécanique', orders: 30 },
    { id: 3, name: 'Canapé 3 places', orders: 25 },
    { id: 4, name: 'Ballon de football', orders: 20 }
  ];

  res.json(fakeTopProducts);
});

router.get('/price-distribution', (req, res) => {
  // Distribution fictive des prix
  const result = {
    'Moins de 50€': 15,
    '50€-100€': 25,
    '100€-500€': 45,
    '500€+': 15
  };

  res.json(result);
});

module.exports = router;
