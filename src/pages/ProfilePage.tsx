import { Building2 } from 'lucide-react';
import type { Organization } from '../lib/types';

export function ProfilePage({ org }: { org: Organization }) {
  return (
    <div className="page narrow">
      <header className="page-header">
        <div>
          <span className="eyebrow">Perfil</span>
          <h1>Organizacao</h1>
        </div>
      </header>
      <section className="card profile-card">
        <Building2 size={32} />
        <div>
          <h2>{org.name}</h2>
          <p>{org.description || 'Organizacao ativa no ToNaEscala.'}</p>
        </div>
      </section>
    </div>
  );
}
