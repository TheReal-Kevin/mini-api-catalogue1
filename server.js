const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

const sessionSecret = process.env.SESSION_SECRET || 'dev-secret-key-change-in-production';

app.use(express.json());
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: false // Mettre à true en production avec HTTPS
  }
}));

app.use((req, res, next) => {
  res.locals.isAuthenticated = !!req.session.userId;
  res.locals.userName = req.session.userName;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

const requireAuth = (req, res, next) => {
  console.log('Vérification auth - Session userId:', req.session.userId);
  if (req.session.userId) {
    next();
  } else {
    console.log('Accès refusé - Utilisateur non authentifié');
    res.status(401).json({ error: 'Non authentifié' });
  }
};

const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const statsRoutes = require('./routes/stats');
const authRoutes = require('./routes/auth');

app.use('/api/auth', authRoutes);
app.use('/api/categories', requireAuth, categoriesRoutes);
app.use('/api/products', requireAuth, productsRoutes);
// Stats protégé pour éviter l'accès aux données réelles non authentifiées
app.use('/api/stats', requireAuth, statsRoutes);

// Endpoint racine - affiche la page appropriée selon l'état d'authentification
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.redirect('/auth.html');
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
