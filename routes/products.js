const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../data/products.json');
const categoriesPath = path.join(__dirname, '../data/categories.json');

// Fonctions utilitaires pour lire les données
const readData = (filePath) => {
  try {
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    return jsonData.trim() === '' ? [] : JSON.parse(jsonData);
  } catch (error) {
    return [];
  }
};

// Fonction utilitaire pour écrire les données
const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Erreur d'écriture dans le fichier ${path.basename(filePath)}:`, error);
  }
};

// Fonction de validation pour un produit
const validateProduct = (name, price, categoryId) => {
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return { valid: false, message: 'Le nom doit faire entre 2 et 100 caractères' };
  }
  
  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice <= 0) {
    return { valid: false, message: 'Le prix doit être un nombre positif' };
  }
  
  const numCategoryId = Number(categoryId);
  if (isNaN(numCategoryId) || !Number.isInteger(numCategoryId) || numCategoryId <= 0) {
    return { valid: false, message: "L'ID de catégorie est invalide" };
  }

  const categories = readData(categoriesPath);
  if (!categories.some(c => c.id === numCategoryId)) {
    return { valid: false, message: "La catégorie spécifiée n'existe pas" };
  }
  
  return { valid: true };
};

// GET /products - Lister tous les produits
router.get('/', (req, res) => {
  const products = readData(productsPath);
  res.json(products);
});

// GET /products/:id - Récupérer un produit
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const products = readData(productsPath);
    const product = products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /products - Créer un produit
router.post('/', (req, res) => {
  try {
    const { name, price, categoryId } = req.body;
    const validation = validateProduct(name, price, categoryId);

    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const products = readData(productsPath);
    const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

    const newProduct = {
      id: nextId,
      name: name.trim(),
      price: Number(price),
      categoryId: Number(categoryId)
    };

    products.push(newProduct);
    writeData(productsPath, products);

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
});

// PUT /products/:id - Mettre à jour un produit
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const { name, price, categoryId } = req.body;
    const validation = validateProduct(name, price, categoryId);

    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const products = readData(productsPath);
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    products[productIndex] = {
      ...products[productIndex],
      name: name.trim(),
      price: Number(price),
      categoryId: Number(categoryId)
    };
    
    writeData(productsPath, products);
    res.json(products[productIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// DELETE /products/:id - Supprimer un produit
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    let products = readData(productsPath);
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    products.splice(productIndex, 1);
    writeData(productsPath, products);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

module.exports = router;
