const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');

// Lit la liste des utilisateurs depuis le fichier JSON
const readUsers = () => {
  try {
    return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  } catch {
    return [];
  }
};

// Écrit la liste des utilisateurs dans le fichier JSON
const writeUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Route pour créer un nouveau compte utilisateur
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  const users = readUsers();
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ error: 'Cet email est déjà utilisé' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Math.max(0, ...users.map(u => u.id || 0)) + 1,
    name,
    email,
    password: hashedPassword,
    joinDate: new Date().toISOString().split('T')[0]
  };

  users.push(newUser);
  writeUsers(users);

  req.session.userId = newUser.id;
  req.session.userName = newUser.name;
  
  // Sauvegarder explicitement la session avant d'envoyer la réponse
  req.session.save((err) => {
    if (err) {
      console.error('Erreur lors de la sauvegarde de la session:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    res.json({
      success: true,
      message: 'Inscription réussie',
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
  });
});

// Route pour authentifier un utilisateur existant
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  req.session.userId = user.id;
  req.session.userName = user.name;
  
  // Sauvegarder explicitement la session avant d'envoyer la réponse
  req.session.save((err) => {
    if (err) {
      console.error('Erreur lors de la sauvegarde de la session:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      user: { id: user.id, name: user.name, email: user.email }
    });
  });
});

// Route pour se déconnecter et détruire la session
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    }
    res.json({ success: true, message: 'Déconnexion réussie' });
  });
});

// Route pour vérifier si un utilisateur est connecté
router.get('/current', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  res.json({
    userId: req.session.userId,
    userName: req.session.userName
  });
});

// Route pour générer un mot de passe aléatoire
router.post('/generate-password', (req, res) => {
  const length = req.body.length || 16;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  const strength = calculatePasswordStrength(password);

  res.json({
    password,
    strength,
    length,
    feedback: getPasswordFeedback(strength)
  });
});

// Calcule la force d'un mot de passe (score de 0 à 6)
const calculatePasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;
  return score;
};

// Renvoie un feedback textuel basé sur le score de force
const getPasswordFeedback = (strength) => {
  const feedbacks = [
    'Très faible',
    'Faible',
    'Faible à moyen',
    'Moyen',
    'Moyen à fort',
    'Fort',
    'Très fort'
  ];
  return feedbacks[strength] || 'Très fort';
};

module.exports = router;
