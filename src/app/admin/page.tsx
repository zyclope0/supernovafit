'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function AdminPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold neon-text">Administration</h1>
          <p className="text-muted-foreground">
            Paramètres et gestion de la plateforme
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-effect p-6 rounded-xl border border-white/10 hover:glow-purple transition-all">
            <div className="text-center">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="font-semibold text-white mb-2">Gestion Coach</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Inviter un coach ou gérer les accès
              </p>
              <button className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg text-sm font-medium hover:bg-neon-purple/30 transition-colors">
                Gérer
              </button>
            </div>
          </div>

          <div className="glass-effect p-6 rounded-xl border border-white/10 hover:glow-cyan transition-all">
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-semibold text-white mb-2">Export Données</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Exporter en PDF ou CSV
              </p>
              <button className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg text-sm font-medium hover:bg-neon-cyan/30 transition-colors">
                Exporter
              </button>
            </div>
          </div>

          <div className="glass-effect p-6 rounded-xl border border-white/10 hover:glow-pink transition-all">
            <div className="text-center">
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="font-semibold text-white mb-2">Paramètres</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configuration générale
              </p>
              <button className="px-4 py-2 bg-neon-pink/20 text-neon-pink rounded-lg text-sm font-medium hover:bg-neon-pink/30 transition-colors">
                Configurer
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
