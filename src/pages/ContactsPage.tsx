import { BookUser, Mail, Phone, Plus, Search } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { fetchOrgContacts, upsertOrgContact } from '../lib/api';
import type { OrgContact, Organization } from '../lib/types';

export function ContactsPage({ org }: { org: Organization }) {
  const [contacts, setContacts] = useState<OrgContact[]>([]);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setContacts(await fetchOrgContacts(org.id));
  }

  useEffect(() => {
    load().catch(() => setContacts([]));
  }, [org.id]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return contacts;
    return contacts.filter((contact) =>
      contact.name.toLowerCase().includes(needle) ||
      (contact.email ?? '').toLowerCase().includes(needle) ||
      (contact.phone ?? '').includes(needle) ||
      (contact.default_role ?? '').toLowerCase().includes(needle),
    );
  }, [contacts, query]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Ferramentas</span>
          <h1>Escalados</h1>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => setShowForm((value) => !value)}>
          Adicionar escalado
        </Button>
      </header>

      {showForm ? <ContactForm org={org} onSaved={() => { setShowForm(false); void load(); }} /> : null}

      <div className="toolbar-card">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, email, telefone ou funcao" />
      </div>

      <div className="resource-list">
        {filtered.length === 0 ? (
          <div className="empty-state"><BookUser size={42} /><h2>Agenda vazia</h2><p>Adicione escalados para agilizar a montagem das escalas.</p></div>
        ) : null}
        {filtered.map((contact) => (
          <article className="resource-row" key={contact.id}>
            <span className="avatar-letter">{contact.name.trim().charAt(0).toUpperCase()}</span>
            <div>
              <strong>{contact.name}</strong>
              <span>{contact.default_role || 'Sem funcao padrao'}</span>
              <small className="resource-meta">
                {contact.email ? <><Mail size={12} />{contact.email}</> : null}
                {contact.phone ? <><Phone size={12} />{contact.phone}</> : null}
              </small>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ContactForm({ org, onSaved }: { org: Organization; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await upsertOrgContact(org.id, {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        default_role: role.trim() || undefined,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel salvar o escalado.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form-stack section-card" onSubmit={submit}>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <div className="two-cols">
        <Field label="Nome" value={name} onChange={(event) => setName(event.target.value)} required />
        <Field label="Funcao padrao" value={role} onChange={(event) => setRole(event.target.value)} placeholder="Vocal, Recepcao..." />
      </div>
      <div className="two-cols">
        <Field label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Field label="Telefone" value={phone} onChange={(event) => setPhone(event.target.value)} />
      </div>
      <Button disabled={saving}>{saving ? 'Salvando...' : 'Salvar escalado'}</Button>
    </form>
  );
}
