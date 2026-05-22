import { CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchAssignments, fetchEvents } from '../lib/api';
import { dateShort, time } from '../lib/format';
import type { Event, EventAssignment, Organization } from '../lib/types';
import { Badge } from '../components/Badge';

export function AgendaPage({ org }: { org: Organization }) {
  const [rows, setRows] = useState<Array<{ event: Event; assignment: EventAssignment }>>([]);

  useEffect(() => {
    async function load() {
      const events = await fetchEvents(org.id);
      const all = await Promise.all(events.map(async (event) => (await fetchAssignments(event.id)).map((assignment) => ({ event, assignment }))));
      setRows(all.flat().sort((a, b) => a.event.start_date.localeCompare(b.event.start_date)));
    }
    load().catch(() => setRows([]));
  }, [org.id]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Agenda</span>
          <h1>Convocacoes da organizacao</h1>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="empty-state">
          <CalendarDays size={42} />
          <h2>Agenda vazia</h2>
          <p>Quando houver convocados, eles aparecem aqui em ordem de data.</p>
        </div>
      ) : (
        <div className="event-list">
          {rows.map(({ event, assignment }) => (
            <div className="event-card" key={assignment.assignment_id} style={{ borderLeftColor: event.color }}>
              <div>
                <h2>{event.title}</h2>
                <p>{dateShort(event.start_date)} · {time(assignment.arrival_time ?? assignment.start_time ?? event.start_date)}</p>
                <span className="muted-line">{assignment.invitee_name} · {assignment.team_name ?? 'Equipe geral'}{assignment.role ? ` · ${assignment.role}` : ''}</span>
              </div>
              <Badge status={assignment.response_status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
