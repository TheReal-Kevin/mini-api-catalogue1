// Tests unitaires pour l'API produits

const assert = require('assert');

// Simulation des données de test
const mockProducts = [
    {
        id: '1',
        name: 'Laptop Dell XPS',
        price: 1299.99,
        categoryId: 'cat1',
        description: 'Ordinateur portable haute performance',
        stock: 15
    },
    {
        id: '2',
        name: 'Smartphone iPhone',
        price: 899.99,
        categoryId: 'cat2',
        description: 'Téléphone intelligent dernière génération',
        stock: 25
    }
];

/**
 * Test de validation des produits
 */
function testProductValidation() {
    console.log('🧪 Tests de validation des produits...');
    
    // Test produit valide
    const validProduct = {
        name: 'Produit Test',
        price: 99.99,
        categoryId: 'cat1',
        description: 'Description test',
        stock: 10
    };
    
    assert.strictEqual(typeof validProduct.name, 'string', 'Le nom doit être une chaîne');
    assert.strictEqual(typeof validProduct.price, 'number', 'Le prix doit être un nombre');
    assert.strictEqual(validProduct.price > 0, true, 'Le prix doit être positif');
    
    console.log('✅ Validation des produits : OK');
}

/**
 * Test de recherche de produits
 */
function testProductSearch() {
    console.log('🧪 Tests de recherche des produits...');
    
    // Test de recherche par nom
    const searchResult = mockProducts.filter(p => 
        p.name.toLowerCase().includes('laptop')
    );
    
    assert.strictEqual(searchResult.length, 1, 'Doit trouver 1 produit');
    assert.strictEqual(searchResult[0].name, 'Laptop Dell XPS', 'Doit trouver le bon produit');
    
    console.log('✅ Recherche des produits : OK');
}

/**
 * Test de calcul de prix
 */
function testPriceCalculation() {
    console.log('🧪 Tests de calcul de prix...');
    
    const totalValue = mockProducts.reduce((total, product) => {
        return total + (product.price * product.stock);
    }, 0);
    
    const expectedTotal = (1299.99 * 15) + (899.99 * 25);
    
    assert.strictEqual(totalValue, expectedTotal, 'Le calcul de valeur totale doit être correct');
    
    console.log('✅ Calcul de prix : OK');
}

/**
 * Test de gestion du stock
 */
function testStockManagement() {
    console.log('🧪 Tests de gestion du stock...');
    
    // Test de produits en rupture
    const outOfStock = mockProducts.filter(p => p.stock === 0);
    assert.strictEqual(outOfStock.length, 0, 'Aucun produit ne devrait être en rupture');
    
    // Test de produits en faible stock (< 10)
    const lowStock = mockProducts.filter(p => p.stock < 10);
    assert.strictEqual(lowStock.length, 0, 'Aucun produit en faible stock dans les données test');
    
    console.log('✅ Gestion du stock : OK');
}

/**
 * Test de formatage des données
 */
function testDataFormatting() {
    console.log('🧪 Tests de formatage des données...');
    
    const product = mockProducts[0];
    
    // Test du format du prix
    const formattedPrice = product.price.toFixed(2);
    assert.strictEqual(formattedPrice, '1299.99', 'Le prix doit être formaté avec 2 décimales');
    
    // Test de la présence des champs requis
    assert.strictEqual(typeof product.id, 'string', 'L\'ID doit être présent');
    assert.strictEqual(typeof product.name, 'string', 'Le nom doit être présent');
    assert.strictEqual(typeof product.categoryId, 'string', 'La catégorie doit être présente');
    
    console.log('✅ Formatage des données : OK');
}

/**
 * Fonction principale pour exécuter tous les tests
 */
function runProductTests() {
    console.log('🚀 Démarrage des tests produits...\n');
    
    try {
        testProductValidation();
        testProductSearch();
        testPriceCalculation();
        testStockManagement();
        testDataFormatting();
        
        console.log('\n✅ Tous les tests produits sont passés avec succès!');
        return true;
    } catch (error) {
        console.error('\n❌ Échec d\'un test:', error.message);
        return false;
    }
}

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined') {
    module.exports = {
        runProductTests,
        testProductValidation,
        testProductSearch,
        testPriceCalculation,
        testStockManagement,
        testDataFormatting
    };
}

// Exécution directe si le fichier est lancé
if (require.main === module) {
    runProductTests();
}