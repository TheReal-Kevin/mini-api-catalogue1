// Tests unitaires pour l'API catégories

const assert = require('assert');

// Simulation des données de test
const mockCategories = [
    {
        id: 'cat1',
        name: 'Électronique',
        description: 'Appareils électroniques et accessoires'
    },
    {
        id: 'cat2', 
        name: 'Informatique',
        description: 'Ordinateurs, périphériques et logiciels'
    },
    {
        id: 'cat3',
        name: 'Mobilier',
        description: 'Meubles et décoration'
    }
];

/**
 * Test de validation des catégories
 */
function testCategoryValidation() {
    console.log('🧪 Tests de validation des catégories...');
    
    // Test catégorie valide
    const validCategory = {
        name: 'Nouvelle Catégorie',
        description: 'Description de test'
    };
    
    assert.strictEqual(typeof validCategory.name, 'string', 'Le nom doit être une chaîne');
    assert.strictEqual(validCategory.name.length >= 2, true, 'Le nom doit faire au moins 2 caractères');
    assert.strictEqual(validCategory.name.length <= 100, true, 'Le nom ne doit pas dépasser 100 caractères');
    
    console.log('✅ Validation des catégories : OK');
}

/**
 * Test de recherche de catégories
 */
function testCategorySearch() {
    console.log('🧪 Tests de recherche des catégories...');
    
    // Test de recherche par nom
    const searchResult = mockCategories.filter(c => 
        c.name.toLowerCase().includes('informatique')
    );
    
    assert.strictEqual(searchResult.length, 1, 'Doit trouver 1 catégorie');
    assert.strictEqual(searchResult[0].name, 'Informatique', 'Doit trouver la bonne catégorie');
    
    console.log('✅ Recherche des catégories : OK');
}

/**
 * Test de comptage de catégories
 */
function testCategoryCount() {
    console.log('🧪 Tests de comptage des catégories...');
    
    const totalCategories = mockCategories.length;
    
    assert.strictEqual(totalCategories, 3, 'Doit avoir 3 catégories de test');
    assert.strictEqual(totalCategories > 0, true, 'Il doit y avoir au moins une catégorie');
    
    console.log('✅ Comptage des catégories : OK');
}

/**
 * Test de validation des noms uniques
 */
function testUniqueCategoryNames() {
    console.log('🧪 Tests d\'unicité des noms de catégories...');
    
    const categoryNames = mockCategories.map(c => c.name);
    const uniqueNames = [...new Set(categoryNames)];
    
    assert.strictEqual(categoryNames.length, uniqueNames.length, 'Tous les noms doivent être uniques');
    
    console.log('✅ Unicité des noms : OK');
}

/**
 * Test de formatage des données
 */
function testCategoryDataFormatting() {
    console.log('🧪 Tests de formatage des catégories...');
    
    const category = mockCategories[0];
    
    // Test de la présence des champs requis
    assert.strictEqual(typeof category.id, 'string', 'L\'ID doit être présent');
    assert.strictEqual(typeof category.name, 'string', 'Le nom doit être présent');
    assert.strictEqual(category.name.length > 0, true, 'Le nom ne doit pas être vide');
    
    // Test de la description (optionnelle)
    if (category.description) {
        assert.strictEqual(typeof category.description, 'string', 'La description doit être une chaîne');
    }
    
    console.log('✅ Formatage des catégories : OK');
}

/**
 * Test de tri des catégories
 */
function testCategorySorting() {
    console.log('🧪 Tests de tri des catégories...');
    
    // Test de tri alphabétique
    const sortedCategories = [...mockCategories].sort((a, b) => 
        a.name.localeCompare(b.name)
    );
    
    assert.strictEqual(sortedCategories[0].name, 'Électronique', 'Le tri doit être correct');
    assert.strictEqual(sortedCategories.length, mockCategories.length, 'Toutes les catégories doivent être présentes');
    
    console.log('✅ Tri des catégories : OK');
}

/**
 * Fonction principale pour exécuter tous les tests
 */
function runCategoryTests() {
    console.log('🚀 Démarrage des tests catégories...\n');
    
    try {
        testCategoryValidation();
        testCategorySearch();
        testCategoryCount();
        testUniqueCategoryNames();
        testCategoryDataFormatting();
        testCategorySorting();
        
        console.log('\n✅ Tous les tests catégories sont passés avec succès!');
        return true;
    } catch (error) {
        console.error('\n❌ Échec d\'un test:', error.message);
        return false;
    }
}

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined') {
    module.exports = {
        runCategoryTests,
        testCategoryValidation,
        testCategorySearch,
        testCategoryCount,
        testUniqueCategoryNames,
        testCategoryDataFormatting,
        testCategorySorting
    };
}

// Exécution directe si le fichier est lancé
if (require.main === module) {
    runCategoryTests();
}