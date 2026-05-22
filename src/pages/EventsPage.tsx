import { CalendarPlus, MapPin, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { fetchAssignments, fetchEvents } from '../lib/api';
import { dateShort, time } from '../lib/format';
import type { Event, EventAssignment, Organization } from '../lib/types';

type EventStats = Record<string, EventAssignment[]>;

export function EventsPage({ org }: { org: Organization }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const items = await fetchEvents(org.id);
      setEvents(items);
      const pairs = await Promise.all(
        items.map(async (event) => [event.id, await fetchAssignments(event.id)] as const).slice(0, 20),
      );
      setStats(Object.fromEntries(pairs));
      setLoading(false);
    }
    load().catch(() => setLoading(false));
  }, [org.id]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">{org.name}</span>
          <h1>Eventos</h1>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => { window.location.href = '/app/eventos/novo'; }}>
          Criar evento
        </Button>
      </header>

      {loading ? <div className="card">Carregando eventos...</div> : null}

      {!loading && events.length === 0 ? (
        <div className="empty-state">
          <CalendarPlus size={42} />
          <h2>Nenhum evento ainda</h2>
          <p>Crie o primeiro evento para montar a escala e compartilhar o convite.</p>
          <Link className="btn btn-primary" to="/app/eventos/novo"><Plus size={18} />Criar evento</Link>
        </div>
      ) : null}

      <div className="event-list">
        {events.map((event) => {
          const assignments = stats[event.id] ?? [];
          const accepted = assignments.filter((item) => item.response_status === 'accepted').length;
          const declined = assignments.filter((item) => item.response_status === 'declined').length;
          return (
            <Link className="event-card" to={`/app/eventos/${event.id}`} key={event.id} style={{ borderLeftColor: event.color }}>
              <div>
                <h2>{event.title}</h2>
                <p>{dateShort(event.start_date)} · {time(event.start_date)}{event.end_date ? ` ate ${time(event.end_date)}` : ''}</p>
                {event.location ? <span className="muted-line"><MapPin size={15} />{event.location}</span> : null}
              </div>
              <div className="event-card-meta">
                {event.category ? <span className="soft-chip">{event.category}</span> : null}
                <span>{assignments.length} escalados</span>
                <span>{accepted} aceitaram · {declined} recusas</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
