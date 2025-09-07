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
  'pomme': 'apple',
  'banane': 'banana', 
  'séré': 'fromage blanc',
  'yaourt': 'yogurt',
  'yogourt': 'yogurt',
  'poulet': 'chicken',
  'boeuf': 'beef',
  'bœuf': 'beef',
  'porc': 'pork',
  'saumon': 'salmon',
  'thon': 'tuna',
  'riz': 'rice',
  'pâtes': 'pasta',
  'fromage': 'cheese',
  'lait': 'milk',
  'beurre': 'butter',
  'oeuf': 'egg',
  'œuf': 'egg',
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
  // simplification FR basique: pommes -> pomme, fraises -> fraise, oeufs -> oeuf
  return input.replace(/(es|s)\b/g, '')
}

function enhanceSearchQuery(query: string): string {
  const normalizedQuery = singularize(normalizeText(query));
  
  // Chercher des synonymes pour chaque mot
  const words = normalizedQuery.split(' ');
  const enhancedWords = words.map(word => {
    return FRENCH_SYNONYMS[word] || word;
  });
  
  // Retourner la requête originale ET les synonymes
  const enhanced = enhancedWords.join(' ');
  return enhanced !== normalizedQuery ? `${normalizedQuery} ${enhanced}` : normalizedQuery;
}

/**
 * Calculer un score de "fraîcheur" pour favoriser les produits frais
 */
function calculateFreshnessScore(productName: string): number {
  const name = productName.toLowerCase();
  let score = 0;
  
  // Bonus pour produits frais/simples
  const freshKeywords = [
    'apple', 'banana', 'orange', 'chicken', 'salmon', 'beef',
    'milk', 'egg', 'cheese', 'yogurt', 'rice', 'pasta',
    'fresh', 'bio', 'nature', 'natural', 'organic'
  ];
  
  // Malus pour produits transformés
  const processedKeywords = [
    'sauce', 'prepared', 'cooked', 'frozen', 'canned',
    'pizza', 'burger', 'sandwich', 'cake', 'cookie',
    'chips', 'chocolate', 'candy', 'industrial'
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
export async function searchProducts(query: string, limit: number = 8): Promise<OpenFoodFactsProduct[]> {
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
     // Essayer plusieurs requêtes pour maximiser les résultats
     const queries = [
       normalizedQuery, // Requête originale
       FRENCH_SYNONYMS[normalizedQuery] || normalizedQuery, // Synonyme direct
       enhanceSearchQuery(normalizedQuery) // Requête élargie
     ].filter((q, index, arr) => arr.indexOf(q) === index); // Supprimer doublons
     
      const allProducts: unknown[] = [];
     
     for (const queryTerm of queries) {
       const url = new URL('https://world.openfoodfacts.org/cgi/search.pl');
       url.searchParams.set('search_terms', queryTerm);
       url.searchParams.set('search_simple', '1');
       url.searchParams.set('action', 'process');
       url.searchParams.set('json', '1');
       url.searchParams.set('page_size', '20'); // Plus de résultats pour mieux filtrer
       url.searchParams.set('page', '1');
       url.searchParams.set('sort_by', 'unique_scans_n'); // Par popularité réelle
       url.searchParams.set('fields', 'code,product_name,brands,image_front_url,nutriments,categories_tags');

       try {
         const response = await fetch(url.toString(), {
           headers: { 'User-Agent': API_CONFIG.userAgent },
           // Timeout augmenté car l'API peut être lente
           signal: AbortSignal.timeout(10000), // 10 secondes
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
        { tag: 'en:fruits', boost: 6 },
        { tag: 'en:meats', boost: 5 },
        { tag: 'en:vegetables', boost: 5 },
        { tag: 'en:fish-and-seafood', boost: 5 },
        { tag: 'en:dairies', boost: 2 },
      ]

      const products = fuzzyMatched
        .map((p) => {
          const name = normalizeText(p.product_name)
          const freshScore = calculateFreshnessScore(name)
          let categoryBoost = 0
          const tags = (p as unknown as { categories_tags?: string[] }).categories_tags || []
          CATEGORY_BOOSTS.forEach(({ tag, boost }) => {
            if (tags.includes(tag)) categoryBoost += boost
          })
          const nutritionBoost = hasCompleteNutritionalData(p) ? 3 : 0
          const lengthPenalty = Math.max(0, Math.floor((name.length - 30) / 10))
          const finalScore = freshScore + categoryBoost + nutritionBoost - lengthPenalty
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
      energy_100g: parseFloat((nutriments as Record<string, unknown>)['energy-kcal_100g'] as string) || parseFloat((nutriments as Record<string, unknown>).energy_100g as string) || 0,
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
