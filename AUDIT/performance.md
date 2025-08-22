# 🚀 Analyse de Performance - SuperNovaFit

## Résumé exécutif

L'analyse révèle des **bundles JavaScript trop lourds** (jusqu'à 602KB), des **requêtes Firestore non optimisées** (60+ appels dans un seul hook), et un **manque d'optimisations critiques** (lazy loading, memoization, pagination). Les métriques Web Vitals sont mitigées avec un TBT de 0.72s à améliorer.

## 1. 📊 Métriques de bundle

### Tailles des bundles par page

| Page | Size | First Load JS | Statut |
|------|------|---------------|---------|
| **/export** | 236 KB | **602 KB** | ❌ CRITIQUE |
| **/coach/athlete/[id]** | 112 KB | **465 KB** | ❌ Élevé |
| **/diete** | 28.4 KB | **402 KB** | ⚠️ Lourd |
| **/entrainements** | 11.1 KB | **392 KB** | ⚠️ Lourd |
| **/journal** | 14.7 KB | **373 KB** | ⚠️ Acceptable |
| **/mesures** | 7.69 KB | **366 KB** | ✅ OK |
| **Shared JS** | - | **216 KB** | ✅ OK |

### Problèmes identifiés

1. **Page Export (602 KB)** - 3x la taille recommandée
   - Imports de toutes les librairies de graphiques
   - Pas de code splitting
   - Toutes les fonctions d'export chargées

2. **Page Coach Detail (465 KB)** - 2.3x la taille recommandée
   - Charge toutes les données athlète d'un coup
   - Components non optimisés

## 2. ⚡ Performance Web Vitals

### Métriques actuelles (Lighthouse)

| Métrique | Valeur | Objectif | Statut |
|----------|--------|----------|---------|
| **FCP** | 0.44s | < 1.8s | ✅ Excellent |
| **LCP** | 1.31s | < 2.5s | ✅ Bon |
| **TBT** | 0.72s | < 0.3s | ❌ À améliorer |
| **CLS** | 0.08 | < 0.1 | ✅ Excellent |

### Analyse TBT (Total Blocking Time)
- **0.72s** indique trop de JavaScript bloquant
- Causé par l'initialisation Firebase + React

## 3. 🔥 Firestore & Requêtes

### Problèmes détectés

#### 1. Hook useFirestore monolithique
**Lieu**: `src/hooks/useFirestore.ts` (1591 lignes, 60+ requêtes)
```typescript
// Problème: Toutes les requêtes dans un seul hook
export function useFirestore() {
  // 60+ fonctions de requête
  // Pas de memoization
  // Pas de cache
}
```

#### 2. Requêtes N+1
**Lieu**: Multiple endroits
```typescript
// Exemple dans coach/all-athletes
athletes.forEach(async (athlete) => {
  const stats = await getAthleteStats(athlete.id) // N requêtes
})
```

#### 3. Absence de pagination côté serveur
**Lieu**: Collections avec beaucoup de données
- Journal: charge tout l'historique
- Entraînements: charge tous les workouts
- Mesures: charge toutes les mesures

#### 4. onSnapshot non optimisés
**Lieu**: Listeners temps réel partout
```typescript
// Écoute TOUTE la collection
onSnapshot(collection(db, 'repas'), ...)
// Au lieu de requêtes ciblées
```

## 4. 🎯 Optimisations manquantes

### Dynamic imports insuffisants

**Actuellement**: Seulement 5 imports dynamiques
```typescript
// src/app/diete/page.tsx
const MacrosChart = dynamic(() => import('@/components/ui/MacrosChart'), { ssr: false })
```

**Manquent**: 
- Modals (tous chargés au démarrage)
- Forms complexes
- Export components
- Charts additionnels

### Imports d'icônes non optimisés

**Lieu**: `src/app/export/page.tsx:13-26`
```typescript
import { 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  BarChart3, 
  Calendar,
  Download,
  CheckCircle,
  Loader2,
  Sparkles,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react'
```
**Impact**: Charge TOUTE la librairie lucide-react

### Images non optimisées

**Problèmes détectés**:
- Pas de `sizes` sur certaines images
- Pas de formats WebP/AVIF
- Photos utilisateur non compressées

### Absence de memoization

**Composants lourds sans memo**:
- `MesuresCharts` (362 lignes)
- `CoachDieteCharts` (77 lignes)
- `PhotosLibresGallery` (542 lignes)

## 5. 📦 Bundle Analysis

### Dépendances lourdes

| Package | Size | Impact | Alternative |
|---------|------|---------|-------------|
| **recharts** | ~150KB | Charts interactifs | Chart.js (plus léger) |
| **jspdf** | ~100KB | Export PDF | Dynamic import only |
| **xlsx** | ~80KB | Export Excel | Dynamic import only |
| **firebase** | ~60KB | Non tree-shakable | Imports sélectifs |
| **lucide-react** | ~50KB | Icônes | Import individuel |

### Duplication détectée
- **recharts** ET **chart.js** présents
- **react-chartjs-2** non utilisé mais installé
- Multiple librairies de dates

## 6. 🛠️ Recommandations

### 🔴 Actions critiques (< 1 semaine)

#### 1. Optimiser la page Export
```typescript
// Avant
import { useExportData } from '@/hooks/useExportData'

// Après
const ExportModal = dynamic(
  () => import('@/components/ExportModal'),
  { 
    loading: () => <Spinner />,
    ssr: false 
  }
)
```

#### 2. Code splitting agressif
```typescript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: [
      'recharts',
      'lucide-react',
      '@heroicons/react',
      'firebase/firestore',
      'firebase/auth',
      'jspdf',
      'xlsx'
    ],
  }
}
```

#### 3. Pagination Firestore
```typescript
// Implémenter la pagination côté serveur
const PAGE_SIZE = 20

export async function getPaginatedRepas(lastDoc?: DocumentSnapshot) {
  let q = query(
    collection(db, 'repas'),
    where('user_id', '==', userId),
    orderBy('date', 'desc'),
    limit(PAGE_SIZE)
  )
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc))
  }
  
  return getDocs(q)
}
```

### 🟠 Actions importantes (< 2 semaines)

#### 1. Optimiser les requêtes
```typescript
// Utiliser des requêtes composites
const athleteWithStats = await getDoc(doc(db, 'athletes_stats', athleteId))
// Au lieu de N requêtes séparées
```

#### 2. Implémenter le cache
```typescript
// Service de cache Firestore
class FirestoreCache {
  private cache = new Map()
  private ttl = 5 * 60 * 1000 // 5 minutes
  
  async get(key: string, fetcher: () => Promise<any>) {
    if (this.cache.has(key)) {
      const { data, timestamp } = this.cache.get(key)
      if (Date.now() - timestamp < this.ttl) {
        return data
      }
    }
    
    const data = await fetcher()
    this.cache.set(key, { data, timestamp: Date.now() })
    return data
  }
}
```

#### 3. React.memo sur composants lourds
```typescript
export const MesuresCharts = React.memo(({ data }) => {
  // Component code
}, (prevProps, nextProps) => {
  return prevProps.data.length === nextProps.data.length
})
```

### 🟡 Optimisations avancées (< 1 mois)

#### 1. Service Worker pour cache
```javascript
// sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('firebasestorage')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          return caches.open('v1').then((cache) => {
            cache.put(event.request, response.clone())
            return response
          })
        })
      })
    )
  }
})
```

#### 2. Image optimization
```typescript
// Component optimisé
<Image
  src={photo.url}
  alt={photo.description}
  width={400}
  height={300}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  placeholder="blur"
  blurDataURL={photo.blurDataURL}
  loading="lazy"
/>
```

#### 3. Virtual scrolling
```typescript
// Pour les longues listes
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={entrainements.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <TrainingCard training={entrainements[index]} />
    </div>
  )}
</FixedSizeList>
```

## 7. 📊 Impact estimé

### Après optimisations

| Métrique | Actuel | Cible | Amélioration |
|----------|--------|-------|--------------|
| Bundle Export | 602 KB | 250 KB | -58% |
| Bundle Coach | 465 KB | 200 KB | -57% |
| TBT | 0.72s | 0.25s | -65% |
| Requêtes Firestore | 60+/page | 10/page | -83% |
| Load time (3G) | 8s | 3s | -62% |

## 8. 🚨 Quick wins

1. **Dynamic import des modals** (1h)
   - Impact: -50KB par page
   - Effort: Faible

2. **Lucide icons barrel import** (30min)
   ```typescript
   import * as Icons from 'lucide-react'
   // Remplacer par imports individuels
   ```

3. **Lazy load images** (1h)
   - Ajouter loading="lazy" partout
   - Impact: -30% initial load

4. **Remove unused deps** (30min)
   ```bash
   npm uninstall react-chartjs-2 chart.js chartjs-adapter-date-fns
   ```

5. **Enable compression** (15min)
   ```javascript
   // next.config.js
   compress: true,
   ```

## Conclusion

La performance nécessite une attention urgente avec des bundles 3x trop gros et des requêtes Firestore non optimisées. Les optimisations proposées peuvent réduire la taille des bundles de 60% et améliorer le TBT de 65%. Prioriser le code splitting et la pagination pour un impact maximal.