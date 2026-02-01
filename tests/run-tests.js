// Lanceur de tests principal pour l'API catalogue

const { runProductTests } = require('./products.test.js');
const { runCategoryTests } = require('./categories.test.js');

/**
 * Lance tous les tests de l'application
 */
function runAllTests() {
    console.log('🎯 === SUITE DE TESTS API CATALOGUE ===\n');
    
    let allTestsPassed = true;
    
    // Tests des produits
    console.log('📦 TESTS PRODUITS');
    console.log('================');
    const productTestsOK = runProductTests();
    allTestsPassed = allTestsPassed && productTestsOK;
    
    console.log('\n');
    
    // Tests des catégories
    console.log('📂 TESTS CATÉGORIES');
    console.log('==================');
    const categoryTestsOK = runCategoryTests();
    allTestsPassed = allTestsPassed && categoryTestsOK;
    
    // Résumé final
    console.log('\n🏁 === RÉSUMÉ DES TESTS ===');
    
    if (allTestsPassed) {
        console.log('✅ Tous les tests sont passés avec succès!');
        console.log('🎉 L\'API catalogue fonctionne correctement.');
        process.exit(0);
    } else {
        console.log('❌ Certains tests ont échoué.');
        console.log('🔧 Veuillez vérifier les erreurs ci-dessus.');
        process.exit(1);
    }
}

/**
 * Fonction utilitaire pour obtenir des statistiques de tests
 */
function getTestStats() {
    return {
        productTests: 5,
        categoryTests: 6,
        totalTests: 11
    };
}

// Exécution si le fichier est lancé directement
if (require.main === module) {
    const stats = getTestStats();
    console.log(`🧪 Exécution de ${stats.totalTests} tests...`);
    console.log(`📦 ${stats.productTests} tests produits`);
    console.log(`📂 ${stats.categoryTests} tests catégories\n`);
    
    runAllTests();
}

module.exports = {
    runAllTests,
    getTestStats
};