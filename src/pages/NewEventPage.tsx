import { Save } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Field, Textarea } from '../components/Field';
import { createEvent } from '../lib/api';
import { dateTimeLocalValue, toIsoFromLocal } from '../lib/format';
import type { Organization } from '../lib/types';
import { eventColors } from '../theme/tokens';

export function NewEventPage({ org }: { org: Organization }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Culto');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState(dateTimeLocalValue());
  const [end, setEnd] = useState(dateTimeLocalValue(new Date(Date.now() + 2 * 60 * 60 * 1000)));
  const [color, setColor] = useState(eventColors[0]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await createEvent({
        organization_id: org.id,
        title: title.trim(),
        category: category.trim() || undefined,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        start_date: toIsoFromLocal(start),
        end_date: end ? toIsoFromLocal(end) : undefined,
        color,
      });
      navigate(`/app/eventos/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel criar o evento.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page narrow">
      <header className="page-header">
        <div>
          <span className="eyebrow">Novo evento</span>
          <h1>Dados do evento</h1>
        </div>
      </header>
      <form className="card form-stack" onSubmit={submit}>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <Field label="Nome" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        <Field label="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} />
        <Field label="Local" value={location} onChange={(e) => setLocation(e.target.value)} />
        <div className="two-cols">
          <Field label="Inicio" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required />
          <Field label="Fim" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div className="field">
          <span>Cor</span>
          <div className="swatches">
            {eventColors.map((item) => (
              <button
                type="button"
                key={item}
                className={item === color ? 'swatch active' : 'swatch'}
                style={{ background: item }}
                onClick={() => setColor(item)}
                aria-label={`Selecionar cor ${item}`}
              />
            ))}
          </div>
        </div>
        <Textarea label="Descricao" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        <Button disabled={saving} icon={<Save size={18} />}>{saving ? 'Salvando...' : 'Salvar evento'}</Button>
      </form>
    </div>
  );
}
