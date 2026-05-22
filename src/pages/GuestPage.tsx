import { CalendarDays, Check, Clock, LogOut, MapPin, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Textarea } from '../components/Field';
import { getGuestAssignments, getGuestEvents, getGuestRoster, respondAssignment } from '../lib/api';
import { dateLong, time } from '../lib/format';
import type { AssignmentRosterItem, GuestAssignment, GuestEventSummary } from '../lib/types';

export function GuestPage() {
  const navigate = useNavigate();
  const [inviteCode] = useState(localStorage.getItem('tne_guest_invite_code') ?? '');
  const [email] = useState(localStorage.getItem('tne_guest_email') ?? '');
  const [events, setEvents] = useState<GuestEventSummary[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [assignments, setAssignments] = useState<GuestAssignment[]>([]);
  const [roster, setRoster] = useState<AssignmentRosterItem[]>([]);
  const [declineTarget, setDeclineTarget] = useState<GuestAssignment | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');

  async function load(targetId?: string) {
    if (!inviteCode || !email) {
      navigate('/');
      return;
    }
    const eventItems = await getGuestEvents(inviteCode, email);
    const eventId = targetId || eventItems.find((item) => item.is_current_invite)?.event_id || eventItems[0]?.event_id;
    if (!eventId) throw new Error('Convocacao nao encontrada.');
    const [assignmentItems, rosterItems] = await Promise.all([
      getGuestAssignments(inviteCode, email, eventId),
      getGuestRoster(inviteCode, email, eventId),
    ]);
    setEvents(eventItems);
    setSelectedEventId(eventId);
    setAssignments(assignmentItems);
    setRoster(rosterItems);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Nao foi possivel carregar sua convocacao.'));
  }, []);

  async function answer(assignment: GuestAssignment, response: 'accepted' | 'declined', reason?: string) {
    setSaving(assignment.assignment_id);
    setError('');
    try {
      await respondAssignment(inviteCode, email, assignment.assignment_id, response, reason);
      setDeclineTarget(null);
      setDeclineReason('');
      await load(assignment.event_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel salvar sua resposta.');
    } finally {
      setSaving('');
    }
  }

  function leave() {
    localStorage.removeItem('tne_guest_invite_code');
    localStorage.removeItem('tne_guest_email');
    navigate('/');
  }

  const eventInfo = assignments[0];

  if (error && !eventInfo) {
    return <div className="center-screen"><div className="card alert-card"><div className="alert alert-danger">{error}</div><Button onClick={leave}>Voltar</Button></div></div>;
  }

  if (!eventInfo) return <div className="splash">Carregando convocacao...</div>;

  return (
    <div className="guest-shell">
      <header className="guest-header" style={{ borderTopColor: eventInfo.event_color }}>
        <div>
          <span>{eventInfo.organization_name}</span>
          <h1>{eventInfo.event_title}</h1>
        </div>
        <button className="icon-button" onClick={leave} aria-label="Sair"><LogOut size={20} /></button>
      </header>

      <main className="guest-content">
        {error ? <div className="alert alert-danger">{error}</div> : null}

        {events.length > 1 ? (
          <div className="event-switcher">
            {events.map((item) => (
              <button
                key={item.event_id}
                className={item.event_id === selectedEventId ? 'event-chip active' : 'event-chip'}
                onClick={() => load(item.event_id)}
              >
                <strong>{item.event_title}</strong>
                <span>{item.assignment_count} convocacao{item.assignment_count === 1 ? '' : 'es'}</span>
              </button>
            ))}
          </div>
        ) : null}

        <section className="card info-card">
          <Info icon={<CalendarDays size={17} />} text={dateLong(eventInfo.event_start_date)} />
          <Info icon={<Clock size={17} />} text={`${time(eventInfo.event_start_date)}${eventInfo.event_end_date ? ` ate ${time(eventInfo.event_end_date)}` : ''}`} />
          {eventInfo.event_location ? <Info icon={<MapPin size={17} />} text={eventInfo.event_location} /> : null}
          {eventInfo.event_description ? <p>{eventInfo.event_description}</p> : null}
        </section>

        <section>
          <h2 className="section-title">Suas convocacoes</h2>
          <div className="assignment-list">
            {assignments.map((assignment) => (
              <article className="card guest-assignment" key={assignment.assignment_id}>
                <div className="section-head">
                  <div>
                    <h3>{assignment.team_name ?? 'Equipe geral'}{assignment.role ? ` · ${assignment.role}` : ''}</h3>
                    <span>{assignment.invitee_name}</span>
                  </div>
                  <Badge status={assignment.response_status} />
                </div>
                <Info icon={<Clock size={17} />} text={`Chegada: ${time(assignment.arrival_time ?? assignment.start_time ?? assignment.event_start_date)}${assignment.end_time ? ` ate ${time(assignment.end_time)}` : ''}`} />
                {assignment.notes ? <p>{assignment.notes}</p> : null}
                {assignment.decline_reason ? <p className="danger-text">Motivo enviado: {assignment.decline_reason}</p> : null}
                <div className="action-row">
                  <Button
                    variant={assignment.response_status === 'accepted' ? 'primary' : 'secondary'}
                    icon={<Check size={18} />}
                    disabled={saving === assignment.assignment_id}
                    onClick={() => answer(assignment, 'accepted')}
                  >
                    Aceito participar
                  </Button>
                  <Button
                    variant={assignment.response_status === 'declined' ? 'danger' : 'secondary'}
                    icon={<X size={18} />}
                    disabled={saving === assignment.assignment_id}
                    onClick={() => setDeclineTarget(assignment)}
                  >
                    Nao poderei
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">Equipe convocada</h2>
          <div className="assignment-list">
            {roster.map((item) => (
              <div className="assignment-row" key={item.assignment_id}>
                <div>
                  <strong>{item.invitee_name}{item.is_current_user ? ' · voce' : ''}</strong>
                  <span>{item.team_name ?? 'Equipe geral'}{item.role ? ` · ${item.role}` : ''}</span>
                </div>
                <Badge status={item.response_status} />
              </div>
            ))}
          </div>
        </section>
      </main>

      {declineTarget ? (
        <div className="modal-backdrop">
          <form
            className="card modal-sheet"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              if (!declineReason.trim()) return;
              answer(declineTarget, 'declined', declineReason.trim());
            }}
          >
            <h2>Nao poderei participar</h2>
            <p>Informe o motivo para que o organizador possa ajustar a escala.</p>
            <Textarea label="Motivo" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} rows={4} required autoFocus />
            <div className="action-row">
              <Button type="button" variant="secondary" onClick={() => setDeclineTarget(null)}>Cancelar</Button>
              <Button variant="danger" disabled={!declineReason.trim() || saving === declineTarget.assignment_id}>Enviar recusa</Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Info({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="info-row">{icon}<span>{text}</span></div>;
}
