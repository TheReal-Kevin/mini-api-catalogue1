const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/categories.json');

// Fonction utilitaire pour lire les données depuis le fichier JSON
const readData = () => {
  try {
    const jsonData = fs.readFileSync(dataPath, 'utf-8');
    // Si le fichier est vide, retourner un tableau vide
    if (jsonData.trim() === '') {
      return [];
    }
    return JSON.parse(jsonData);
  } catch (error) {
    // Si le fichier n'existe pas ou autre erreur, retourner un tableau vide
    return [];
  }
};

// Fonction utilitaire pour écrire les données dans le fichier JSON
const writeData = (data) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Erreur d'écriture dans le fichier categories.json:", error);
  }
};

// Fonction de validation pour le nom de la catégorie
const validateCategoryName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 100;
};

// GET /categories - Lister toutes les catégories
router.get('/', (req, res) => {
  const categories = readData();
  res.json(categories);
});

// GET /categories/:id - Récupérer une seule catégorie
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const categories = readData();
    const category = categories.find(c => c.id === id);

    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /categories - Créer une nouvelle catégorie
router.post('/', (req, res) => {
  try {
    const { name } = req.body;

    if (!validateCategoryName(name)) {
      return res.status(400).json({ error: 'Le nom doit faire entre 2 et 100 caractères' });
    }

    const categories = readData();
    const nextId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;

    const newCategory = { id: nextId, name: name.trim() };
    categories.push(newCategory);
    writeData(categories);

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
});

// PUT /categories/:id - Mettre à jour une catégorie
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const { name } = req.body;
    if (!validateCategoryName(name)) {
      return res.status(400).json({ error: 'Le nom doit faire entre 2 et 100 caractères' });
    }

    const categories = readData();
    const categoryIndex = categories.findIndex(c => c.id === id);

    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    categories[categoryIndex].name = name.trim();
    writeData(categories);

    res.json(categories[categoryIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// DELETE /categories/:id - Supprimer une catégorie
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    let categories = readData();
    const categoryIndex = categories.findIndex(c => c.id === id);

    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    categories.splice(categoryIndex, 1);
    writeData(categories);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

module.exports = router;
