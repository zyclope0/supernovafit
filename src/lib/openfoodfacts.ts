/**
 * Service API Open Food Facts optimisé
 * Documentation : https://openfoodfacts.github.io/api-documentation/
 */

import { OpenFoodFactsProduct } from '@/types';
import Fuse from 'fuse.js'

// Configuration de l'API
const API_CONFIG = {
  userAgent: 'SuperNovaFit/1.0 (https://supernovafit.com)',
};

// Dictionnaire de synonymes français pour améliorer la recherche
const FRENCH_SYNONYMS: Record<string, string> = {
  // Fruits
  'pomme': 'pomme',
  'banane': 'banane',
  'orange': 'orange',
  'fraise': 'fraise',
  'framboise': 'framboise',
  'myrtille': 'myrtille',
  'cerise': 'cerise',
  'pêche': 'pêche',
  'abricot': 'abricot',
  'kiwi': 'kiwi',
  'ananas': 'ananas',
  'mangue': 'mangue',
  'avocat': 'avocat',
  
  // Légumes
  'carotte': 'carotte',
  'brocoli': 'brocoli',
  'épinard': 'épinard',
  'tomate': 'tomate',
  'concombre': 'concombre',
  'courgette': 'courgette',
  'aubergine': 'aubergine',
  'poivron': 'poivron',
  'oignon': 'oignon',
  'ail': 'ail',
  'pomme de terre': 'pomme de terre',
  'patate': 'pomme de terre',
  'salade': 'salade',
  'laitue': 'laitue',
  
  // Protéines
  'poulet': 'poulet',
  'boeuf': 'bœuf',
  'bœuf': 'bœuf',
  'porc': 'porc',
  'agneau': 'agneau',
  'saumon': 'saumon',
  'thon': 'thon',
  'cabillaud': 'cabillaud',
  'crevette': 'crevette',
  'oeuf': 'œuf',
  'œuf': 'œuf',
  
  // Produits laitiers
  'lait': 'lait',
  'yaourt': 'yaourt',
  'yogourt': 'yaourt',
  'fromage': 'fromage',
  'séré': 'fromage blanc',
  'fromage blanc': 'fromage blanc',
  'beurre': 'beurre',
  'crème': 'crème',
  
  // Céréales et légumineuses
  'riz': 'riz',
  'pâtes': 'pâtes',
  'pasta': 'pâtes',
  'quinoa': 'quinoa',
  'avoine': 'avoine',
  'blé': 'blé',
  'lentille': 'lentille',
  'haricot': 'haricot',
  'pois chiche': 'pois chiche',
  
  // Noix et graines
  'amande': 'amande',
  'noix': 'noix',
  'noisette': 'noisette',
  'pistache': 'pistache',
  'graine': 'graine',
  'tournesol': 'graine de tournesol',
};

/**
 * Cache simple pour éviter les requêtes répétées
 */
const searchCache = new Map<string, OpenFoodFactsProduct[]>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Améliorer la requête de recherche
 */
function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]+/g, '') // retire accents (combining marks)
    .replace(/[^a-z0-9\s]/g, ' ') // retire ponctuation
    .replace(/\s+/g, ' ') // espaces multiples
    .trim()
}

function singularize(input: string): string {
  // Règles de singularisation françaises plus précises et moins agressives
  const singularRules = [
    // Règles spécifiques pour pluriels français
    { pattern: /(aux|eaux)\b/g, replacement: '' }, // chevaux -> cheval, châteaux -> château
    { pattern: /(eux)\b/g, replacement: 'eu' }, // cheveux -> cheveu
    { pattern: /(euses?)\b/g, replacement: 'euse' }, // danseuses -> danseuse
    { pattern: /(rices?)\b/g, replacement: 'rice' }, // actrices -> actrice
    
    // Règle générale plus intelligente : seulement si le mot fait plus de 3 caractères
    { pattern: /(?<=.{3,})(s)\b/g, replacement: '' }, // pommes -> pomme, mais pas "as" -> "a"
  ];
  
  let result = input;
  for (const rule of singularRules) {
    result = result.replace(rule.pattern, rule.replacement);
  }
  
  return result;
}

function enhanceSearchQuery(query: string): string {
  const normalizedQuery = singularize(normalizeText(query));
  
  // Pour les aliments simples, garder la requête originale ET la version normalisée
  const words = normalizedQuery.split(' ');
  
  // Chercher des synonymes pour chaque mot
  const enhancedWords = words.map(word => {
    return FRENCH_SYNONYMS[word] || word;
  });
  
  // Construire une requête optimisée pour Open Food Facts
  const enhanced = enhancedWords.join(' ');
  
  // Pour les aliments non transformés, être moins agressif
  const isUnprocessedFood = words.some(word => 
    ['pomme', 'banane', 'carotte', 'brocoli', 'tomate', 'concombre', 'salade'].includes(word)
  );
  
  if (isUnprocessedFood) {
    // Retourner la requête originale + normalisée + synonymes
    return `${query} ${normalizedQuery} ${enhanced}`;
  }
  
  return enhanced !== normalizedQuery ? `${normalizedQuery} ${enhanced}` : normalizedQuery;
}

/**
 * Calculer un score de "fraîcheur" pour favoriser les produits frais
 */
function calculateFreshnessScore(productName: string): number {
  const name = productName.toLowerCase();
  let score = 0;
  
  // Bonus pour produits frais/simples (français + anglais)
  const freshKeywords = [
    // Fruits frais
    'pomme', 'banane', 'orange', 'fraise', 'framboise', 'myrtille', 'cerise',
    'pêche', 'abricot', 'kiwi', 'ananas', 'mangue', 'avocat', 'citron', 'citron vert',
    'raisin', 'melon', 'pastèque', 'figue', 'datte', 'grenade',
    'apple', 'banana', 'orange', 'strawberry', 'raspberry', 'blueberry',
    'lemon', 'lime', 'grape', 'melon', 'watermelon', 'fig', 'date', 'pomegranate',
    
    // Légumes frais
    'carotte', 'brocoli', 'épinard', 'tomate', 'concombre', 'courgette',
    'aubergine', 'poivron', 'oignon', 'ail', 'salade', 'laitue', 'chou', 'chou-fleur',
    'radis', 'navet', 'betterave', 'céleri', 'fenouil', 'asperge', 'artichaut',
    'carrot', 'broccoli', 'spinach', 'tomato', 'cucumber', 'zucchini',
    'cabbage', 'cauliflower', 'radish', 'turnip', 'beetroot', 'celery', 'fennel',
    
    // Protéines naturelles
    'poulet', 'bœuf', 'porc', 'agneau', 'saumon', 'thon', 'œuf', 'dinde', 'veau',
    'cabillaud', 'crevette', 'moule', 'huître', 'homard', 'crabe',
    'chicken', 'beef', 'pork', 'lamb', 'salmon', 'tuna', 'egg', 'turkey', 'veal',
    'cod', 'shrimp', 'mussel', 'oyster', 'lobster', 'crab',
    
    // Produits laitiers naturels
    'lait', 'yaourt', 'fromage', 'beurre', 'crème', 'fromage blanc', 'ricotta',
    'milk', 'yogurt', 'cheese', 'butter', 'cream', 'cottage cheese',
    
    // Céréales et légumineuses
    'riz', 'quinoa', 'avoine', 'blé', 'orge', 'sarrasin', 'lentille', 'haricot',
    'pois chiche', 'fève', 'soja', 'riz complet', 'pâtes complètes',
    'rice', 'quinoa', 'oats', 'wheat', 'barley', 'buckwheat', 'lentil', 'bean',
    'chickpea', 'broad bean', 'soy', 'brown rice', 'whole wheat pasta',
    
    // Noix et graines
    'amande', 'noix', 'noisette', 'pistache', 'cajou', 'pécan', 'graine de tournesol',
    'graine de courge', 'graine de lin', 'graine de chia', 'sésame',
    'almond', 'walnut', 'hazelnut', 'pistachio', 'cashew', 'pecan', 'sunflower seed',
    'pumpkin seed', 'flax seed', 'chia seed', 'sesame',
    
    // Qualité et origine
    'bio', 'biologique', 'nature', 'natural', 'organic', 'fresh', 'frais', 'cru', 'raw',
    'local', 'artisanal', 'fermier', 'traditionnel'
  ];
  
  // Malus pour produits transformés
  const processedKeywords = [
    'sauce', 'prepared', 'cooked', 'frozen', 'canned', 'conserve',
    'pizza', 'burger', 'sandwich', 'cake', 'cookie', 'biscuit',
    'chips', 'chocolate', 'candy', 'industrial', 'transformé',
    'préparé', 'cuit', 'congelé', 'en conserve', 'industriel'
  ];
  
  freshKeywords.forEach(keyword => {
    if (name.includes(keyword)) score += 10;
  });
  
  processedKeywords.forEach(keyword => {
    if (name.includes(keyword)) score -= 5;
  });
  
  // Bonus noms courts (produits simples)
  if (name.length <= 20) score += 3;
  if (name.length > 50) score -= 2;
  
  return score;
}

/**
 * Rechercher des produits alimentaires (version optimisée)
 */
export async function searchProducts(query: string, limit: number = 12): Promise<OpenFoodFactsProduct[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = singularize(normalizeText(query));
  const cacheKey = `${normalizedQuery}-${limit}`;
  
  // Vérifier le cache
  if (searchCache.has(cacheKey)) {
    const cached = searchCache.get(cacheKey)!;
    return cached;
  }

     try {
     // Optimisation : Une seule requête intelligente
     const smartQuery = FRENCH_SYNONYMS[normalizedQuery] || enhanceSearchQuery(normalizedQuery) || normalizedQuery;
     const queries = [smartQuery]; // Une seule requête optimisée
     
     
      const allProducts: unknown[] = [];
     
     for (const queryTerm of queries) {
       const url = new URL('https://world.openfoodfacts.org/cgi/search.pl');
       url.searchParams.set('search_terms', queryTerm);
       url.searchParams.set('search_simple', '1');
       url.searchParams.set('action', 'process');
       url.searchParams.set('json', '1');
       url.searchParams.set('page_size', '20'); // Plus de résultats pour mieux filtrer
       url.searchParams.set('page', '1');
       url.searchParams.set('sort_by', 'popularity'); // Par popularité pour aliments frais
       url.searchParams.set('fields', 'code,product_name,brands,image_front_url,nutriments,categories_tags');

       try {
         const response = await fetch(url.toString(), {
           headers: { 'User-Agent': API_CONFIG.userAgent },
           // Timeout optimisé pour meilleure UX
           signal: AbortSignal.timeout(5000), // 5 secondes
         });

         if (response.ok) {
           const data = await response.json();
           const products = data.products || [];
           allProducts.push(...products);
         }
       } catch (error) {
         console.warn(`Erreur requête "${queryTerm}":`, error);
       }
       
       // Si on a assez de résultats, arrêter
       if (allProducts.length >= limit * 3) break;
     }
         
          // Supprimer les doublons par code produit
     const uniqueProducts = allProducts.filter((product, index, self) => 
       index === self.findIndex(p => (p as { code?: string }).code === (product as { code?: string }).code)
     );
     
      // Pré-filtre produits valides
       const candidates: OpenFoodFactsProduct[] = uniqueProducts
        .filter((product) => (product as unknown as { product_name?: string; nutriments?: unknown }).product_name && (product as unknown as { product_name?: string; nutriments?: unknown }).nutriments)
        .map(p => transformProduct(p as unknown as Record<string, unknown>))

      // Fuzzy matching avec Fuse.js (normalisation accents + pluriels)
      const fuse = new Fuse(candidates, {
        keys: [
          { name: 'product_name', weight: 0.7 },
          { name: 'brands', weight: 0.2 },
        ],
        threshold: 0.38, // assez strict pour pertinence
        ignoreLocation: true,
        minMatchCharLength: 2,
        shouldSort: false,
        getFn: (obj: OpenFoodFactsProduct, path: string | string[]) => {
          const key = Array.isArray(path) ? path[0] : path
          return normalizeText(String((obj as unknown as Record<string, unknown>)[key] ?? ''))
        },
      })

      const fuseQuery = normalizedQuery
      const fuseResults = fuse.search(fuseQuery).slice(0, limit * 3)
      const fuzzyMatched = fuseResults.map(r => r.item)

      // Scoring final: fuzzy score (implicite via ordre), + fraîcheur, + catégorie
      const CATEGORY_BOOSTS: Array<{ tag: string; boost: number }> = [
        // PRODUITS FRAIS - PRIORITÉ MAXIMALE
        { tag: 'en:fruits', boost: 10 },
        { tag: 'en:vegetables', boost: 10 },
        { tag: 'en:meats', boost: 8 },
        { tag: 'en:fish-and-seafood', boost: 8 },
        
        // PRODUITS NATURELS - PRIORITÉ ÉLEVÉE
        { tag: 'en:legumes', boost: 8 },
        { tag: 'en:legumes-and-their-products', boost: 8 },
        { tag: 'en:cereals', boost: 6 },
        { tag: 'en:cereals-and-potatoes', boost: 6 },
        { tag: 'en:nuts', boost: 7 },
        { tag: 'en:seeds', boost: 7 },
        
        // PRODUITS LAITIERS NATURELS
        { tag: 'en:dairies', boost: 4 },
        { tag: 'en:milk', boost: 5 },
        { tag: 'en:yogurts', boost: 4 },
        { tag: 'en:cheeses', boost: 3 },
        
        // PRODUITS TRANSFORMÉS - PRIORITÉ FAIBLE
        { tag: 'en:prepared-meals', boost: -2 },
        { tag: 'en:sauces', boost: -3 },
        { tag: 'en:sweetened-beverages', boost: -5 },
        { tag: 'en:chocolate', boost: -2 },
        { tag: 'en:snacks', boost: -3 },
      ]

      const products = fuzzyMatched
        .map((p) => {
          const name = normalizeText(p.product_name)
          const freshScore = calculateFreshnessScore(name)
          let categoryBoost = 0
          const tags = (p as unknown as { categories_tags?: string[] }).categories_tags || []
          
          // Calculer le boost de catégorie
          CATEGORY_BOOSTS.forEach(({ tag, boost }) => {
            if (tags.includes(tag)) categoryBoost += boost
          })
          
          // Boost pour données nutritionnelles complètes
          const nutritionBoost = hasCompleteNutritionalData(p) ? 5 : 0
          
          // Bonus pour produits bio/organiques
          const organicBoost = tags.some(tag => 
            tag.includes('organic') || tag.includes('bio') || tag.includes('biologique')
          ) ? 3 : 0
          
          // Malus pour noms trop longs (produits transformés)
          const lengthPenalty = Math.max(0, Math.floor((name.length - 25) / 8))
          
          // Bonus pour ingrédients simples (moins d'additifs)
          const simpleIngredientBonus = name.split(' ').length <= 3 ? 2 : 0
          
          // Malus pour produits avec additifs
          const additivePenalty = name.includes('E') && /\bE\d{3}\b/.test(name) ? 5 : 0
          
          const finalScore = freshScore + categoryBoost + nutritionBoost + organicBoost - lengthPenalty + simpleIngredientBonus - additivePenalty
          return { p, finalScore }
        })
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, limit)
        .map(x => x.p)

         // Mettre en cache
     searchCache.set(cacheKey, products);
     setTimeout(() => searchCache.delete(cacheKey), CACHE_DURATION);

     return products;
    
  } catch (error) {
    console.error('Erreur recherche Open Food Facts:', error);
    return [];
  }
}


/**
 * Transformer les données brutes Open Food Facts
 */
function transformProduct(rawProduct: Record<string, unknown>): OpenFoodFactsProduct {
  const nutriments = (rawProduct as { nutriments?: Record<string, unknown> }).nutriments || {};
  
  return {
    code: (rawProduct as { code?: string; _id?: string }).code || (rawProduct as { code?: string; _id?: string })._id || '',
    product_name: (rawProduct as { product_name?: string; product_name_fr?: string }).product_name || (rawProduct as { product_name?: string; product_name_fr?: string }).product_name_fr || 'Produit sans nom',
    brands: (rawProduct as { brands?: string }).brands || '',
    image_url: (rawProduct as { image_front_url?: string; image_url?: string }).image_front_url || (rawProduct as { image_front_url?: string; image_url?: string }).image_url || '',
    nutriments: {
      energy_100g: (() => {
        // Priorité 1: energy-kcal_100g (déjà en kcal)
        const kcalValue = parseFloat((nutriments as Record<string, unknown>)['energy-kcal_100g'] as string);
        if (kcalValue && kcalValue > 0) {
          return kcalValue;
        }
        
        // Priorité 2: energy_100g (en kJ, à convertir en kcal)
        const kjValue = parseFloat((nutriments as Record<string, unknown>).energy_100g as string);
        if (kjValue && kjValue > 0) {
          // Convertir kJ en kcal (1 kJ = 0.239 kcal)
          return kjValue * 0.239;
        }
        
        return 0;
      })(),
      proteins_100g: parseFloat((nutriments as Record<string, unknown>).proteins_100g as string) || 0,
      carbohydrates_100g: parseFloat((nutriments as Record<string, unknown>).carbohydrates_100g as string) || 0,
      fat_100g: parseFloat((nutriments as Record<string, unknown>).fat_100g as string) || 0,
    },
  };
}


/**
 * Vérifier si un produit a des données nutritionnelles complètes
 */
export function hasCompleteNutritionalData(product: OpenFoodFactsProduct): boolean {
  const { nutriments } = product;
  return (
    nutriments.energy_100g > 0 &&
    nutriments.proteins_100g >= 0 &&
    nutriments.carbohydrates_100g >= 0 &&
    nutriments.fat_100g >= 0
  );
}
