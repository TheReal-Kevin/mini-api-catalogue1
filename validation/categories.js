// Validation des catégories pour l'API catalogue

/**
 * Valide les données d'une catégorie
 * @param {Object} category - Objet catégorie à valider
 * @returns {Object} - Résultat de validation avec isValid et errors
 */
function validateCategory(category) {
    const errors = [];
    
    // Validation du nom
    if (!category.name || typeof category.name !== 'string') {
        errors.push('Le nom de la catégorie est requis et doit être une chaîne de caractères');
    } else if (category.name.length < 2 || category.name.length > 100) {
        errors.push('Le nom de la catégorie doit contenir entre 2 et 100 caractères');
    }
    
    // Validation de la description (optionnelle)
    if (category.description && typeof category.description !== 'string') {
        errors.push('La description doit être une chaîne de caractères');
    } else if (category.description && category.description.length > 300) {
        errors.push('La description ne peut pas dépasser 300 caractères');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Valide les données de mise à jour d'une catégorie
 * @param {Object} updates - Objet contenant les champs à mettre à jour
 * @returns {Object} - Résultat de validation avec isValid et errors
 */
function validateCategoryUpdate(updates) {
    const errors = [];
    
    // Validation du nom si présent
    if (updates.name !== undefined) {
        if (typeof updates.name !== 'string') {
            errors.push('Le nom de la catégorie doit être une chaîne de caractères');
        } else if (updates.name.length < 2 || updates.name.length > 100) {
            errors.push('Le nom de la catégorie doit contenir entre 2 et 100 caractères');
        }
    }
    
    // Validation de la description si présente
    if (updates.description !== undefined) {
        if (typeof updates.description !== 'string') {
            errors.push('La description doit être une chaîne de caractères');
        } else if (updates.description.length > 300) {
            errors.push('La description ne peut pas dépasser 300 caractères');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Sanitise les données d'une catégorie
 * @param {Object} category - Catégorie à sanitiser
 * @returns {Object} - Catégorie sanitisée
 */
function sanitizeCategory(category) {
    const sanitized = {};
    
    if (category.name) {
        sanitized.name = category.name.trim();
    }
    
    if (category.description) {
        sanitized.description = category.description.trim();
    }
    
    return sanitized;
}

module.exports = {
    validateCategory,
    validateCategoryUpdate,
    sanitizeCategory
};