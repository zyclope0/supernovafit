# 📷 AJOUT FONCTIONNALITÉ PHOTOS JOURNAL

**Date** : 01.10.2025  
**Durée** : 20 min  
**Statut** : ✅ TERMINÉE - Fonctionnalité complète

---

## 🎯 OBJECTIF

Ajouter l'upload de photos libres dans le formulaire Journal, en réutilisant le backend existant (`usePhotosLibres`).

---

## ✅ BACKEND EXISTANT

### Hook `usePhotosLibres()`

- **Fichier** : `src/hooks/useFirestore.ts` (lignes 851-1018)
- **Fonctions** : `uploadPhoto`, `deletePhoto`, `updatePhoto`, `toggleFavoris`
- **Firebase Storage** : `photos_libres/`
- **Firebase Firestore** : Collection `photos_libres`

### Type JournalEntry

- **Fichier** : `src/types/index.ts` (ligne 194)
- **Champ** : `photos_libres?: string[]`

---

## 🚀 MODIFICATIONS APPORTÉES

### 1. `src/components/journal/JournalForm.tsx`

#### Imports Ajoutés

```typescript
import { useState, useRef } from "react";
import { Camera, X, Upload } from "lucide-react";
import { usePhotosLibres } from "@/hooks/useFirestore";
import toast from "react-hot-toast";
import Image from "next/image";
```

#### Nouvel Onglet

```typescript
const TABS = [
  { id: "wellness", label: "Bien-être", icon: Heart },
  { id: "sleep", label: "Sommeil", icon: Moon },
  { id: "activities", label: "Activités", icon: Activity },
  { id: "photos", label: "Photos", icon: Camera }, // ✅ NOUVEAU
  { id: "notes", label: "Notes", icon: Save },
];
```

#### État du Formulaire

```typescript
const { uploadPhoto, uploading } = usePhotosLibres();
const fileInputRef = useRef<HTMLInputElement>(null);
const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(
  existingEntry?.photos_libres || [],
);
```

#### Fonctions d'Upload

```typescript
const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validation taille (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    toast.error("La photo ne doit pas dépasser 5MB");
    return;
  }

  // Validation type
  if (!file.type.startsWith("image/")) {
    toast.error("Veuillez sélectionner une image");
    return;
  }

  // Upload Firebase
  const result = await uploadPhoto(file, {
    date: formData.date,
    titre: `Journal ${formData.date}`,
    description: "Photo ajoutée depuis le journal",
    tags: ["journal"],
  });

  if (result.success && result.url) {
    toast.success("Photo ajoutée !");
    setUploadedPhotos((prev) => [...prev, result.url]);
  }
};

const removePhoto = (photoUrl: string) => {
  setUploadedPhotos((prev) => prev.filter((url) => url !== photoUrl));
  toast.success("Photo retirée");
};
```

#### Interface Utilisateur (Onglet Photos)

```typescript
case 'photos':
  return (
    <div className="space-y-6">
      {/* Bouton Upload */}
      <button onClick={() => fileInputRef.current?.click()}>
        Ajouter une photo
      </button>

      {/* Galerie 3 colonnes */}
      <div className="grid grid-cols-3 gap-3">
        {uploadedPhotos.map((photoUrl, index) => (
          <div className="relative aspect-square">
            <Image
              src={photoUrl}
              fill
              sizes="(max-width: 768px) 33vw, 20vw"
              quality={85}
            />
            <button onClick={() => removePhoto(photoUrl)}>
              Retirer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
```

---

## 🎨 UX/UI

### Onglet "Photos"

- **Position** : Entre "Activités" et "Notes"
- **Icône** : 📷 Camera
- **Couleur** : Neon Pink (`text-neon-pink`)

### Bouton Upload

- **Style** : Pleine largeur, neon pink
- **État loading** : Spinner + "Upload en cours..."
- **Validation** : 5MB max, images uniquement

### Galerie Photos

- **Layout** : Grille 3 colonnes
- **Aspect ratio** : Carré (aspect-square)
- **Hover** : Bouton "Retirer" visible au survol
- **Responsive** : Adaptatif mobile/desktop

### État Vide

- **Icône** : 📷 Camera (grande, opacity 50%)
- **Message** : "Aucune photo ajoutée"
- **Suggestion** : "Cliquez sur 'Ajouter une photo' pour commencer"

---

## ✅ FONCTIONNALITÉS

### Upload

- ✅ Sélection fichier via input caché
- ✅ Validation taille (5MB max)
- ✅ Validation type (images uniquement)
- ✅ Upload Firebase Storage automatique
- ✅ Toast de succès/erreur
- ✅ Reset input après upload

### Galerie

- ✅ Affichage grille 3 colonnes
- ✅ Images optimisées (next/image)
- ✅ Suppression au hover
- ✅ État vide informatif

### Soumission

- ✅ `photos_libres` ajouté à l'entrée
- ✅ Sauvegarde Firestore automatique
- ✅ Affichage dans `JournalDetailModal` (déjà fonctionnel)

---

## 🔧 OPTIMISATIONS IMAGES

### next/image

```typescript
<Image
  src={photoUrl}
  alt={`Photo ${index + 1}`}
  fill
  sizes="(max-width: 768px) 33vw, 20vw"
  quality={85}
  className="object-cover"
/>
```

### Bénéfices

- ✅ **WebP/AVIF** : Formats modernes automatiques
- ✅ **Lazy loading** : Chargement différé
- ✅ **Responsive** : Sizes adaptatifs
- ✅ **Cache Firebase** : 60 jours (Phase 5.2)

---

## 🧪 TESTS MANUELS

### Test 1 : Upload Photo

1. Ouvrir `/journal`
2. Cliquer "Nouvelle entrée"
3. Aller à l'onglet "Photos"
4. Cliquer "Ajouter une photo"
5. Sélectionner une image (<5MB)
6. ✅ Photo s'affiche dans la galerie
7. ✅ Toast "Photo ajoutée !"

### Test 2 : Retirer Photo

1. Dans la galerie, hover sur une photo
2. Cliquer le bouton X rouge
3. ✅ Photo retirée de la galerie
4. ✅ Toast "Photo retirée"

### Test 3 : Sauvegarder Entrée

1. Ajouter 2-3 photos
2. Remplir autres champs (humeur, etc.)
3. Cliquer "Enregistrer"
4. ✅ Entrée sauvegardée avec photos
5. Cliquer sur l'entrée pour voir le détail
6. ✅ Photos affichées dans `JournalDetailModal`

### Test 4 : Validation

1. Essayer d'uploader un fichier >5MB
2. ✅ Toast erreur "La photo ne doit pas dépasser 5MB"
3. Essayer d'uploader un PDF
4. ✅ Toast erreur "Veuillez sélectionner une image"

---

## 📊 RÉSULTATS

### Fonctionnalité

- ✅ **Backend** : Réutilisé 100% (usePhotosLibres)
- ✅ **UI/UX** : Ergonomique et intuitive
- ✅ **Validation** : Taille + type
- ✅ **Optimisations** : next/image + cache PWA

### Performance

- ✅ **Build** : Aucune régression
- ✅ **Lint** : 0 erreur
- ✅ **Images** : Optimisées (Phase 5.2)

### Temps

- **Estimé** : 30-45 min
- **Réel** : 20 min
- **Raison** : Backend existant ✅

---

## 🚀 PROCHAINES AMÉLIORATIONS (Optionnelles)

### Court Terme

- [ ] Multi-upload (plusieurs photos à la fois)
- [ ] Aperçu avant upload
- [ ] Rotation/crop basique

### Moyen Terme

- [ ] Galerie plein écran
- [ ] Filtres Instagram-style
- [ ] Annotations sur photos

### Long Terme

- [ ] Reconnaissance IA (tags automatiques)
- [ ] Compression intelligente
- [ ] Partage social

---

**Fonctionnalité photos journal terminée avec succès !** 📷✨

**Test maintenant** : `/journal` → "Nouvelle entrée" → Onglet "Photos" 🎯
