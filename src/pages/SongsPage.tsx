import { Music, Plus, Search } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { Field, Textarea } from '../components/Field';
import { createSong, fetchSongs } from '../lib/api';
import type { Organization, Song } from '../lib/types';

const keys = ['', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function SongsPage({ org }: { org: Organization }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setSongs(await fetchSongs());
  }

  useEffect(() => {
    load().catch(() => setSongs([]));
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return songs;
    return songs.filter((song) =>
      song.title.toLowerCase().includes(needle) ||
      (song.artist ?? '').toLowerCase().includes(needle),
    );
  }, [query, songs]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Ferramentas</span>
          <h1>Repertorio</h1>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => setShowForm((value) => !value)}>
          Adicionar musica
        </Button>
      </header>

      {showForm ? <SongForm org={org} onSaved={() => { setShowForm(false); void load(); }} /> : null}

      <div className="toolbar-card">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por titulo ou artista" />
      </div>

      <div className="resource-list">
        {filtered.length === 0 ? (
          <div className="empty-state"><Music size={42} /><h2>Biblioteca vazia</h2><p>Adicione musicas para montar repertorios nos eventos.</p></div>
        ) : null}
        {filtered.map((song) => (
          <article className="resource-row" key={song.id}>
            <span className="resource-icon"><Music size={18} /></span>
            <div>
              <strong>{song.title}</strong>
              <span>{song.artist || (song.org_id ? 'Sem artista' : 'Musica do sistema')}</span>
            </div>
            {song.default_key ? <span className="soft-chip">{song.default_key}</span> : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function SongForm({ org, onSaved }: { org: Organization; onSaved: () => void }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [defaultKey, setDefaultKey] = useState('');
  const [maleKey, setMaleKey] = useState('');
  const [femaleKey, setFemaleKey] = useState('');
  const [chords, setChords] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [notes, setNotes] = useState('');
  const [linksText, setLinksText] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createSong({
        org_id: org.id,
        title: title.trim(),
        artist: artist.trim() || undefined,
        default_key: defaultKey || undefined,
        male_key: maleKey || undefined,
        female_key: femaleKey || undefined,
        chords: chords.trim() || undefined,
        lyrics: lyrics.trim() || undefined,
        notes: notes.trim() || undefined,
        links: linksText.split('\n').map((item) => item.trim()).filter(Boolean),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel salvar a musica.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form-stack section-card" onSubmit={submit}>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <div className="two-cols">
        <Field label="Titulo" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <Field label="Artista / autor" value={artist} onChange={(event) => setArtist(event.target.value)} />
      </div>
      <div className="three-cols">
        <label className="field"><span>Tom padrao</span><select value={defaultKey} onChange={(event) => setDefaultKey(event.target.value)}>{keys.map((key) => <option key={key} value={key}>{key || 'Sem tom'}</option>)}</select></label>
        <label className="field"><span>Tom masc.</span><select value={maleKey} onChange={(event) => setMaleKey(event.target.value)}>{keys.map((key) => <option key={key} value={key}>{key || 'Sem tom'}</option>)}</select></label>
        <label className="field"><span>Tom fem.</span><select value={femaleKey} onChange={(event) => setFemaleKey(event.target.value)}>{keys.map((key) => <option key={key} value={key}>{key || 'Sem tom'}</option>)}</select></label>
      </div>
      <Textarea label="Cifra" value={chords} onChange={(event) => setChords(event.target.value)} rows={5} />
      <Textarea label="Letra" value={lyrics} onChange={(event) => setLyrics(event.target.value)} rows={5} />
      <Textarea label="Links, um por linha" value={linksText} onChange={(event) => setLinksText(event.target.value)} rows={3} />
      <Textarea label="Observacoes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
      <Button disabled={saving}>{saving ? 'Salvando...' : 'Salvar musica'}</Button>
    </form>
  );
}
