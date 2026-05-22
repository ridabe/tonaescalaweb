import { Building2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Field, Textarea } from '../components/Field';
import { createOrganization } from '../lib/api';

export function SetupOrganizationPage({ onCreated }: { onCreated: () => Promise<void> }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await createOrganization(name.trim(), description.trim() || undefined);
      await onCreated();
      navigate('/app/eventos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel criar a organizacao.');
    }
  }

  return (
    <div className="center-screen">
      <form className="card setup-card" onSubmit={submit}>
        <Building2 size={42} />
        <h1>Crie sua organizacao</h1>
        <p>Depois disso voce ja pode criar eventos, equipes e convocados.</p>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <Field label="Nome da organizacao" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        <Textarea label="Descricao" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        <Button>Criar organizacao</Button>
      </form>
    </div>
  );
}
