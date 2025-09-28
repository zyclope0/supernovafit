'use client';

import { useState } from 'react';
import { Aliment, Macros } from '@/types';
import { generateId } from '@/lib/utils';
import { X } from 'lucide-react';

interface ManualFoodFormProps {
  onSubmit: (aliment: Aliment) => void;
  onCancel: () => void;
}

export default function ManualFoodForm({
  onSubmit,
  onCancel,
}: ManualFoodFormProps) {
  const [nom, setNom] = useState('');
  const [quantite, setQuantite] = useState(100);
  const [unite, setUnite] = useState('g');
  const [macros, setMacros] = useState<Macros>({
    kcal: 0,
    prot: 0,
    glucides: 0,
    lipides: 0,
  });

  const handleAdd = () => {
    if (!nom.trim()) {
      alert("Veuillez entrer un nom d'aliment");
      return;
    }

    // Calculer les macros pour la quantité actuelle
    const ratio = quantite / 100;
    const macrosCalcules = {
      kcal: macros.kcal * ratio,
      prot: macros.prot * ratio,
      glucides: macros.glucides * ratio,
      lipides: macros.lipides * ratio,
    };

    const aliment: Aliment = {
      id: generateId(),
      nom: nom.trim(),
      quantite,
      unite,
      macros: macrosCalcules,
      // Stocker les valeurs de base pour 100g
      macros_base: { ...macros },
    };

    onSubmit(aliment);

    // Réinitialiser le formulaire
    setNom('');
    setQuantite(100);
    setMacros({ kcal: 0, prot: 0, glucides: 0, lipides: 0 });
  };

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Saisie manuelle</h3>
        <button
          onClick={onCancel}
          className="p-1 text-muted-foreground hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Nom de l&apos;aliment */}
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Nom de l&apos;aliment
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-neon-cyan"
            placeholder="Ex: Poulet grillé"
            autoFocus
          />
        </div>

        {/* Quantité et unité */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Quantité
            </label>
            <div className="space-y-2">
              <input
                type="number"
                value={quantite}
                onChange={(e) => setQuantite(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-neon-cyan"
                min="1"
              />

              {/* Boutons portions rapides */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setQuantite(Math.max(1, Math.round(quantite * 0.5)))
                  }
                  className="px-2 py-1 bg-neon-purple/20 hover:bg-neon-purple/30 border border-neon-purple/30 rounded text-neon-purple text-xs font-medium transition-colors"
                  title="Diviser la portion par 2"
                >
                  1/2
                </button>
                <button
                  type="button"
                  onClick={() => setQuantite(quantite + 25)}
                  className="px-2 py-1 bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/30 rounded text-neon-green text-xs font-medium transition-colors"
                  title="Ajouter 25g/ml"
                >
                  +25
                </button>
                <button
                  type="button"
                  onClick={() => setQuantite(quantite * 2)}
                  className="px-2 py-1 bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan/30 rounded text-neon-cyan text-xs font-medium transition-colors"
                  title="Doubler la portion"
                >
                  2x
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Unité
            </label>
            <select
              value={unite}
              onChange={(e) => setUnite(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-neon-cyan select-dark"
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="portion">portion</option>
              <option value="unité">unité</option>
            </select>
          </div>
        </div>

        {/* Macros */}
        <div className="space-y-2">
          <label className="block text-xs text-muted-foreground mb-1">
            Valeurs nutritionnelles (pour {quantite}
            {unite})
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                value={macros.kcal}
                onChange={(e) =>
                  setMacros({ ...macros, kcal: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-neon-green"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Protéines (g)
              </label>
              <input
                type="number"
                value={macros.prot}
                onChange={(e) =>
                  setMacros({ ...macros, prot: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-neon-cyan"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Glucides (g)
              </label>
              <input
                type="number"
                value={macros.glucides}
                onChange={(e) =>
                  setMacros({ ...macros, glucides: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-neon-pink"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Lipides (g)
              </label>
              <input
                type="number"
                value={macros.lipides}
                onChange={(e) =>
                  setMacros({ ...macros, lipides: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-neon-purple"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-3 py-2 bg-white/5 text-white rounded text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 px-3 py-2 bg-neon-cyan/20 text-neon-cyan rounded text-sm font-medium hover:bg-neon-cyan/30 transition-colors"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
