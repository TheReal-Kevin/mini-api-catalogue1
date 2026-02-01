document.addEventListener('DOMContentLoaded', function() {
  /**
   *Dashboard Modernisé - Mini API Catalogue
   */
  const app = {
    charts: {},
    data: {
      products: [],
      orders: [],
      users: []
    },
    currentUser: null,
    theme: localStorage.getItem('theme') || 'light',
    notifications: [],
    loadingStates: new Set(),
    animationTimeline: anime.timeline({
      duration: 750,
      easing: 'easeOutExpo'
    })
  };

  /**
   * Échappe les caractères HTML spéciaux pour prévenir les attaques XSS.
   * @param {string} text - Le texte à échapper.
   * @returns {string} Le texte échappé.
   */
  const escapeHtml = (text) => {
    if (text === null || text === undefined) {
      return '';
    }
    const map = {
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  };

  /**
   * Effectue une requête fetch et retourne la réponse en JSON.
   * Gère les erreurs de réseau et les réponses non-OK.
   * @param {string} url - L'URL de l'API à appeler.
   * @returns {Promise<any>} Les données JSON de la réponse.
   */
  async function fetchJSON(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Inclure les cookies de session
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      // Si réponse 401, c'est une erreur d'authentification
      if (response.status === 401) {
        throw new Error(`Erreur HTTP 401: Non authentifié`);
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(`Erreur HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Erreur lors du fetch de ${url}:`, error);
      // Ne pas afficher de notification ici, laisser la fonction appelante gérer
      throw error;
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié.
   * Redirige vers la page de connexion si ce n'est pas le cas.
   */
  async function checkAuth() {
    try {
      app.currentUser = await fetchJSON('/api/auth/current');
      console.log('Utilisateur authentifié:', app.currentUser);
      updateUserHeader();
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      window.location.href = '/auth.html';
    }
  }

  /**
   * Met à jour l'en-tête avec le nom de l'utilisateur connecté et anime l'affichage.
   */
  function updateUserHeader() {
    const userInfo = document.querySelector('.user-info');
    const userInitial = document.getElementById('userInitial');
    if (userInfo && app.currentUser) {
      userInfo.textContent = escapeHtml(app.currentUser.userName);
      if (userInitial && app.currentUser.userName) {
        userInitial.textContent = app.currentUser.userName.charAt(0).toUpperCase();
      }

      // Animation de fade-in pour le nom d'utilisateur
      anime({
        targets: [userInfo, userInitial.closest('div')],
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 500,
        easing: 'easeOutExpo'
      });
    }
  }

  /**
   * Gère la déconnexion de l'utilisateur.
   */
  async function logout() {
    try {
      document.getElementById('logoutOverlay').classList.add('show');
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' // Inclure les cookies de session
      });
      setTimeout(() => {
        window.location.href = '/auth.html';
      }, 1500);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      window.location.href = '/auth.html';
    }
  }

  /**
   * Affiche une notification moderne avec animations.
   * @param {string} msg - Le message à afficher.
   * @param {string} type - Le type de notification ('success' ou 'error').
   * @param {number} duration - Durée en ms.
   */
  function showNotification(msg, type = 'success', duration = 4000) {
    const notificationContainer = document.getElementById('notificationContainer');

    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification ${type} flex items-center gap-3 p-4 rounded-xl text-sm font-medium shadow-xl backdrop-blur-xl border transform translate-x-full`;

    // Configuration des styles selon le type
    const styles = {
      success: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-800 dark:text-green-200',
        border: 'border-green-200 dark:border-green-800',
        icon: '✓'
      },
      error: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-800 dark:text-red-200',
        border: 'border-red-200 dark:border-red-800',
        icon: '✕'
      },
      info: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-800 dark:text-blue-200',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'ℹ'
      },
      warning: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-800 dark:text-yellow-200',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: '⚠'
      }
    };

    const style = styles[type] || styles.info;
    notification.classList.add(...style.bg.split(' '), ...style.text.split(' '), ...style.border.split(' '));

    // Contenu de la notification
    notification.innerHTML = `
      <div class="flex-shrink-0 w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold">
        ${style.icon}
      </div>
      <span class="flex-1">${escapeHtml(msg)}</span>
      <button class="notification-close w-5 h-5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    `;

    // Ajouter au conteneur
    notificationContainer.appendChild(notification);

    // Animation d'entrée
    anime({
      targets: notification,
      translateX: [20, 0],
      opacity: [0, 1],
      duration: 300,
      easing: 'easeOutExpo'
    });

    // Bouton de fermeture
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => removeNotification(notification));

    // Auto-suppression après la durée
    const timeoutId = setTimeout(() => removeNotification(notification), duration);

    function removeNotification(element) {
      clearTimeout(timeoutId);
      anime({
        targets: element,
        translateX: [0, 20],
        opacity: [1, 0],
        duration: 200,
        easing: 'easeInOutQuad',
        complete: () => element.remove()
      });
    }
  }

  /**
   * Configuration pour les différents tableaux de données.
   */
  const tableConfigs = {
    products: {
      tbodyId: 'productsFullTableBody',
      filterKey: 'name',
      rowTemplate: p => `
        <tr>
          <td class="cursor-pointer text-blue-600 font-semibold" onclick="app.showProductModal(${p.id})">${escapeHtml(p.name)}</td>
          <td><span class="badge badge-primary">${escapeHtml(p.categoryName)}</span></td>
          <td class="font-semibold">${p.price.toFixed(2)}€</td>
          <td>
            <button onclick="app.showProductModal(${p.id})" class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">Voir</button>
          </td>
        </tr>`
    },
    orders: {
      tbodyId: 'ordersFullTableBody',
      filterKey: 'userName',
      rowTemplate: o => `
        <tr>
          <td>${escapeHtml(o.userName)}</td>
          <td>${escapeHtml(o.productName)}</td>
          <td class="text-green-600 font-semibold">${o.total.toFixed(2)}€</td>
          <td>${escapeHtml(o.date)}</td>
          <td><span class="badge ${o.status === 'completed' ? 'badge-success' : 'badge-warning'}">${escapeHtml(o.status)}</span></td>
        </tr>`
    },
    users: {
      tbodyId: 'usersFullTableBody',
      filterKey: 'name',
      rowTemplate: u => `
        <tr>
          <td class="font-semibold">${escapeHtml(u.name)}</td>
          <td>${escapeHtml(u.email)}</td>
          <td><span class="badge badge-primary">${u.orders}</span></td>
          <td class="text-green-600 font-semibold">${u.totalSpent.toFixed(2)}€</td>
          <td class="text-sm text-gray-600">${escapeHtml(u.joinDate)}</td>
        </tr>`
    }
  };

  /**
   * Affiche les données dans un tableau.
   * @param {string} type - Le type de données ('products', 'orders', 'users').
   * @param {Array} data - Les données à afficher.
   */
  function displayTable(type, data) {
    const config = tableConfigs[type];
    const tbody = document.getElementById(config.tbodyId);
    if (tbody) {
      tbody.innerHTML = data.map(config.rowTemplate).join('');
    }
  }

  /**
   * Filtre les données d'un tableau en fonction de la saisie de l'utilisateur.
   * @param {string} type - Le type de données à filtrer.
   */
  function filterTable(type) {
    const config = tableConfigs[type];
    const searchTerm = (document.querySelector(`#${type} input`)?.value || '').toLowerCase();
    const filteredData = app.data[type].filter(item =>
      String(item[config.filterKey]).toLowerCase().includes(searchTerm)
    );
    displayTable(type, filteredData);
  }

  /**
   * Affiche les détails d'un produit dans une modale de manière sécurisée.
   * @param {number} productId - L'ID du produit à afficher.
   */
  function showProductModal(productId) {
    const product = app.data.products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('modalTitle').textContent = escapeHtml(product.name);
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = ''; // Vider le contenu précédent

    const createDetail = (label, value) => {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = `${label}: `;
      p.appendChild(strong);
      p.append(document.createTextNode(value));
      return p;
    };

    modalBody.appendChild(createDetail('Catégorie', escapeHtml(product.categoryName)));
    modalBody.appendChild(createDetail('Prix', `${product.price.toFixed(2)}€`));

    document.getElementById('productModal').classList.add('active');
  }

  /**
   * Charge toutes les données initiales de l'application (statistiques, tableaux, graphiques).
   */
  async function loadData() {
    try {
      document.getElementById('loading').classList.remove('hidden');

      const [stats, products, orders, users] = await Promise.all([
        fetchJSON('/api/stats/overview'),
        fetchJSON('/api/stats/all-products'),
        fetchJSON('/api/stats/orders'),
        fetchJSON('/api/stats/users')
      ]);

      app.data = { products, orders, users };

      // Mettre à jour les KPIs
      document.getElementById('totalProducts').textContent = stats.totalProducts;
      document.getElementById('totalCategories').textContent = stats.totalCategories;
      document.getElementById('totalRevenue').textContent = stats.totalRevenue.toFixed(0) + '€';
      document.getElementById('totalOrders').textContent = stats.totalOrders;
      document.getElementById('totalUsers').textContent = stats.totalUsers;

      // Afficher les tableaux
      displayTable('products', app.data.products);
      displayTable('orders', app.data.orders);
      displayTable('users', app.data.users);

      await loadCharts();

    } catch (error) {
      console.error("Échec du chargement des données principales:", error);
      // Si erreur 401 (non authentifié), rediriger vers la page de connexion
      if (error.message && error.message.includes('401')) {
        showNotification('❌ Session expirée. Veuillez vous reconnecter.', 'error');
        setTimeout(() => {
          window.location.href = '/auth.html';
        }, 2000);
      } else {
        showNotification('❌ Erreur de chargement des données. Veuillez réessayer.', 'error');
      }
    } finally {
      document.getElementById('loading').classList.add('hidden');
    }
  }

  /**
   * Charge les données et génère les graphiques.
   */
  async function loadCharts() {
    try {
      const [prod, price, sales, top, dist] = await Promise.all([
        fetchJSON('/api/stats/products-by-category'),
        fetchJSON('/api/stats/price-by-category'),
        fetchJSON('/api/stats/sales-by-date'),
        fetchJSON('/api/stats/top-products'),
        fetchJSON('/api/stats/price-distribution')
      ]);

      Object.values(app.charts).forEach(c => c?.destroy?.());

      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        animation: false
      };

      app.charts.products = new Chart(document.getElementById('productsChart').getContext('2d'), {
        type: 'doughnut',
        data: { labels: prod.map(d => d.name), datasets: [{ data: prod.map(d => d.value), backgroundColor: ['#667eea', '#f093fb', '#fa709a', '#fee140'], borderWidth: 0 }] },
        options: { ...chartOptions, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 5 } } } }
      });

      app.charts.price = new Chart(document.getElementById('priceChart').getContext('2d'), {
        type: 'doughnut',
        data: { labels: price.map(d => d.name), datasets: [{ data: price.map(d => d.avgPrice), backgroundColor: ['#667eea', '#f093fb', '#fa709a', '#fee140'], borderWidth: 0 }] },
        options: { ...chartOptions, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 5 } } } }
      });

      app.charts.distribution = new Chart(document.getElementById('priceDistributionChart').getContext('2d'), {
        type: 'bar',
        data: { labels: Object.keys(dist), datasets: [{ data: Object.values(dist), backgroundColor: '#fa709a', borderRadius: 4 }] },
        options: chartOptions
      });

      app.charts.sales = new Chart(document.getElementById('salesChart').getContext('2d'), {
        type: 'bar',
        data: { labels: sales.map(d => d.date), datasets: [{ data: sales.map(d => d.sales), backgroundColor: '#667eea', borderRadius: 4 }] },
        options: chartOptions
      });

      app.charts.top = new Chart(document.getElementById('topProductsChart').getContext('2d'), {
        type: 'bar',
        data: { labels: top.slice(0, 5).map(p => p.name.substring(0, 8)), datasets: [{ data: top.slice(0, 5).map(p => p.orders), backgroundColor: '#f093fb', borderRadius: 4 }] },
        options: { ...chartOptions, indexAxis: 'y' }
      });
    } catch (error) {
      console.error("Échec du chargement des graphiques:", error);
    }
  }

  /**
   * Navigation entre les sections avec animations fluides.
   */
  function navigateToSection(sectionName) {
    // Mettre à jour les classes actives
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    document.querySelectorAll('.page-section').forEach(section => {
      section.classList.remove('active');
    });

    // Activer la section sélectionnée
    const targetSection = document.getElementById(sectionName);
    const targetLink = document.querySelector(`[onclick*="navigateToSection('${sectionName}')"]`) || document.querySelector(`button[onclick*="${sectionName}"]`);

    if (targetSection) {
      targetSection.classList.add('active');
    }
    if (targetLink) {
      targetLink.classList.add('active');
    }

    // Animer la transition
    anime({
      targets: '.page-section',
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 400,
      easing: 'easeOutExpo'
    });

    // Fermer la sidebar sur mobile
    if (window.innerWidth < 768) {
      closeSidebar();
    }

    // Mettre à jour l'URL
    history.pushState(null, null, `#${sectionName}`);
  }

  /**
   * Gestion de la sidebar mobile.
   */
  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    const isOpen = !sidebar.classList.contains('hidden');

    if (isOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    sidebar.classList.remove('hidden');
    overlay.classList.remove('hidden');

    anime({
      targets: sidebar,
      translateX: [0, 0],
      duration: 300,
      easing: 'easeOutExpo'
    });

    anime({
      targets: overlay,
      opacity: [0, 1],
      duration: 200,
      easing: 'easeOutExpo'
    });
  }

  function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    anime({
      targets: sidebar,
      translateX: [-280, -280],
      duration: 300,
      easing: 'easeInOutQuad',
      complete: () => {
        sidebar.classList.add('hidden');
        overlay.classList.add('hidden');
      }
    });

    anime({
      targets: overlay,
      opacity: [1, 0],
      duration: 200,
      easing: 'easeInOutQuad'
    });
  }

  /**
   * Gestion du thème sombre/clair.
   */
  function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark');
    const themeToggle = document.getElementById('darkModeToggle');

    if (isDark) {
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      themeToggle.innerHTML = '<svg class="w-4 h-4 text-gray-600 dark:text-yellow-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>';
    } else {
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      themeToggle.innerHTML = '<svg class="w-4 h-4 text-gray-600 dark:text-yellow-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>';
    }

    // Animation du toggle
    anime({
      targets: themeToggle,
      rotate: [0, 180],
      duration: 400,
      easing: 'easeInOutCubic'
    });
  }

  /**
   * Animation des cartes KPI au chargement.
   */
  function animateKPICards() {
    const kpiCards = document.querySelectorAll('.kpi-card');
    anime({
      targets: kpiCards,
      scale: [0.8, 1],
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      delay: anime.stagger(100),
      easing: 'easeOutExpo'
    });
  }

  /**
   * Animation des graphiques au chargement.
   */
  function animateCharts() {
    const charts = document.querySelectorAll('.chart-container');
    anime({
      targets: charts,
      scale: [0.9, 1],
      opacity: [0, 1],
      duration: 800,
      delay: anime.stagger(150),
      easing: 'easeOutExpo'
    });
  }

  /**
   * Gestion du FAB (Floating Action Button).
   */
  function initFAB() {
    const fab = document.getElementById('fab');
    let isExpanded = false;

    fab.addEventListener('click', () => {
      if (!isExpanded) {
        // Ouvrir le menu
        fab.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        `;

        anime({
          targets: fab,
          scale: [1, 1.1],
          duration: 200,
          easing: 'easeOutExpo'
        });
      } else {
        // Fermer le menu
        fab.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        `;

        anime({
          targets: fab,
          scale: [1.1, 1],
          duration: 200,
          easing: 'easeOutExpo'
        });
      }
      isExpanded = !isExpanded;
    });
  }

  /**
   * Gestion des recherches en temps réel.
   */
  function initSearch() {
    const searchInputs = document.querySelectorAll('.search-box input');

    searchInputs.forEach(input => {
      let searchTimeout;

      input.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        const sectionType = e.target.closest('.page-section').id;

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          if (searchTerm.length > 0) {
            showNotification(`Recherche pour "${searchTerm}"...`, 'info', 2000);
          }
          filterTable(sectionType);
        }, 300);
      });
    });
  }

  /**
   * Gestion des animations au scroll.
   */
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          anime({
            targets: entry.target,
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 600,
            easing: 'easeOutExpo'
          });
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observer tous les éléments avec animation
    document.querySelectorAll('.chart-container, .kpi-card, .enhanced-table-container').forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Initialisation des gestes tactiles pour mobile.
   */
  function initTouchGestures() {
    let startX = 0;
    let startY = 0;

    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const diffX = startX - endX;
      const diffY = startY - endY;

      // Swipe depuis le bord gauche pour ouvrir la sidebar
      if (Math.abs(diffX) > Math.abs(diffY) && diffX < -50 && startX < 30 && window.innerWidth < 768) {
        openSidebar();
      }

      // Swipe pour fermer la sidebar
      if (Math.abs(diffX) > Math.abs(diffY) && diffX > 50 && window.innerWidth < 768) {
        closeSidebar();
      }
    });
  }

  /**
   * Animation du chargement initial.
   */
  function initLoadingAnimation() {
    const loadingScreen = document.getElementById('initialLoading');
    const mainApp = document.getElementById('mainApp');

    // Attendre que tout soit chargé
    setTimeout(() => {
      loadingScreen.classList.add('fade-out');

      anime({
        targets: mainApp,
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutExpo',
        complete: () => {
          loadingScreen.remove();
          // animateKPICards(); // Désactivé pour éviter le clignottement
          // animateCharts(); // Désactivé pour éviter le clignottement

          // Notification de bienvenue
          // setTimeout(() => {
          //   showNotification('Bienvenue dans votre dashboard modernisé !', 'success');
          // }, 1000); // Désactivée aussi pour simplifier
        }
      });
    }, 2000);
  }

  /**
   * Initialise les écouteurs d'événements modernes.
   */
  function initEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionName = link.textContent.trim().toLowerCase();
        navigateToSection(sectionName === 'dashboard' ? 'dashboard' :
                         sectionName === 'produits' ? 'products' :
                         sectionName === 'commandes' ? 'orders' : 'users');
      });
    });

    // Boutons de retour
    document.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateToSection('dashboard');
      });
    });

    // Thème
    document.getElementById('darkModeToggle').addEventListener('click', toggleTheme);

    // Refresh
    document.getElementById('refreshBtn').addEventListener('click', async () => {
      const refreshBtn = document.getElementById('refreshBtn');
      refreshBtn.disabled = true;

      anime({
        targets: refreshBtn,
        rotate: [0, 360],
        duration: 1000,
        easing: 'easeInOutCubic'
      });

      await loadData();
      showNotification('Données rafraîchies avec succès !', 'success');

      setTimeout(() => {
        refreshBtn.disabled = false;
      }, 1000);
    });

    // Sidebar mobile
    document.getElementById('menuBtn').addEventListener('click', toggleSidebar);
    document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

    // Modale
    document.getElementById('productModal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget || e.target.classList.contains('close-modal')) {
        anime({
          targets: '#productModal',
          opacity: [1, 0],
          duration: 300,
          easing: 'easeInOutQuad',
          complete: () => {
            document.getElementById('productModal').classList.remove('active');
          }
        });
      }
    });

    // Logout
    document.addEventListener('click', (e) => {
      if (e.target.closest('#logoutButton') || e.target.closest('[title="Déconnexion"]')) {
        logout();
      }
    });

    // Chargement initial
    initLoadingAnimation();
    initFAB();
    initSearch();
    initScrollAnimations();
    initTouchGestures();
  }

  /**
   * Point d'entrée de l'application modernisée.
   */
  async function main() {
    // Exposer les fonctions nécessaires globalement via l'objet app
    window.app = {
      showProductModal,
      filterTable,
      navigateToSection,
      toggleTheme,
      showNotification,
      loadData,
      animateKPICards,
      animateCharts
    };

    // Initialisation du thème
    if (app.theme === 'dark') {
      document.body.classList.add('dark');
      const themeToggle = document.getElementById('darkModeToggle');
      themeToggle.innerHTML = '<svg class="w-4 h-4 text-gray-600 dark:text-yellow-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>';
    } else {
      document.body.classList.remove('dark');
    }

    // Initialisation complete
    initEventListeners();
    await checkAuth();
    await loadData();

    // Mise à jour automatique des données - Désactivée pour éviter les rafraîchissements gênants
    // setInterval(async () => {
    //   try {
    //     await loadData();
    //     showNotification('Données automatiquement mises à jour', 'info', 2000);
    //   } catch (error) {
    //     console.warn('Erreur lors de la mise à jour automatique:', error);
    //   }
    // }, 30000);

    // Gestionnaire d'historique du navigateur
    window.addEventListener('popstate', (event) => {
      const hash = window.location.hash.substring(1);
      if (hash && document.getElementById(hash)) {
        navigateToSection(hash);
      }
    });

    // Vérification de la navigation initiale via URL
    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
      navigateToSection(initialHash);
    }

    // Optimisation des performances
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Réoptimiser les graphiques après redimensionnement
        Object.values(app.charts).forEach(chart => {
          if (chart) chart.resize();
        });
      }, 250);
    });

    // Préchargement intelligent (Performance)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          // Simuler le préchargement des ressources visuelles
          observer.unobserve(img);
        }
      });
    });

    // Surveillance des métriques de performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            console.log('FCP:', entry.startTime);
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    }

    console.log('🚀 Dashboard modernisé avec succès !');
    console.log('✨ Fonctionnalités: Glassmorphism, Animations avancées, Navigation fluide, UX optimisée');
  }

  main();
});
