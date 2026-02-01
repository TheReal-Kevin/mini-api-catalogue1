// Validation des produits pour l'API catalogue

/**
 * Valide les données d'un produit
 * @param {Object} product - Objet produit à valider
 * @returns {Object} - Résultat de validation avec isValid et errors
 */
function validateProduct(product) {
    const errors = [];
    
    // Validation du nom
    if (!product.name || typeof product.name !== 'string') {
        errors.push('Le nom du produit est requis et doit être une chaîne de caractères');
    } else if (product.name.length < 2 || product.name.length > 100) {
        errors.push('Le nom du produit doit contenir entre 2 et 100 caractères');
    }
    
    // Validation du prix
    if (!product.price && product.price !== 0) {
        errors.push('Le prix du produit est requis');
    } else if (typeof product.price !== 'number' || product.price < 0) {
        errors.push('Le prix doit être un nombre positif');
    } else if (product.price > 999999) {
        errors.push('Le prix ne peut pas dépasser 999 999');
    }
    
    // Validation de la catégorie
    if (!product.categoryId || typeof product.categoryId !== 'string') {
        errors.push('L\'ID de catégorie est requis');
    }
    
    // Validation de la description (optionnelle)
    if (product.description && typeof product.description !== 'string') {
        errors.push('La description doit être une chaîne de caractères');
    } else if (product.description && product.description.length > 500) {
        errors.push('La description ne peut pas dépasser 500 caractères');
    }
    
    // Validation du stock
    if (product.stock !== undefined) {
        if (typeof product.stock !== 'number' || product.stock < 0 || !Number.isInteger(product.stock)) {
            errors.push('Le stock doit être un nombre entier positif');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Valide les données de mise à jour d'un produit
 * @param {Object} updates - Objet contenant les champs à mettre à jour
 * @returns {Object} - Résultat de validation avec isValid et errors
 */
function validateProductUpdate(updates) {
    const errors = [];
    
    // Validation du nom si présent
    if (updates.name !== undefined) {
        if (typeof updates.name !== 'string') {
            errors.push('Le nom du produit doit être une chaîne de caractères');
        } else if (updates.name.length < 2 || updates.name.length > 100) {
            errors.push('Le nom du produit doit contenir entre 2 et 100 caractères');
        }
    }
    
    // Validation du prix si présent
    if (updates.price !== undefined) {
        if (typeof updates.price !== 'number' || updates.price < 0) {
            errors.push('Le prix doit être un nombre positif');
        } else if (updates.price > 999999) {
            errors.push('Le prix ne peut pas dépasser 999 999');
        }
    }
    
    // Validation de la description si présente
    if (updates.description !== undefined) {
        if (typeof updates.description !== 'string') {
            errors.push('La description doit être une chaîne de caractères');
        } else if (updates.description.length > 500) {
            errors.push('La description ne peut pas dépasser 500 caractères');
        }
    }
    
    // Validation du stock si présent
    if (updates.stock !== undefined) {
        if (typeof updates.stock !== 'number' || updates.stock < 0 || !Number.isInteger(updates.stock)) {
            errors.push('Le stock doit être un nombre entier positif');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Sanitise les données d'un produit
 * @param {Object} product - Produit à sanitiser
 * @returns {Object} - Produit sanitisé
 */
function sanitizeProduct(product) {
    const sanitized = {};
    
    if (product.name) {
        sanitized.name = product.name.trim();
    }
    
    if (product.price !== undefined) {
        sanitized.price = Number(product.price);
    }
    
    if (product.categoryId) {
        sanitized.categoryId = product.categoryId.trim();
    }
    
    if (product.description) {
        sanitized.description = product.description.trim();
    }
    
    if (product.stock !== undefined) {
        sanitized.stock = Number(product.stock);
    }
    
    return sanitized;
}

module.exports = {
    validateProduct,
    validateProductUpdate,
    sanitizeProduct
};