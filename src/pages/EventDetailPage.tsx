import { Copy, Mail, Plus, QrCode, Send, Share2, UserPlus } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Field, SelectField, Textarea } from '../components/Field';
import { StatusSummary } from '../components/StatusSummary';
import { createAssignment, createTeam, fetchAssignments, fetchEvent, fetchTeams, generateInvite } from '../lib/api';
import {
  createEmailCampaign,
  getEmailCampaigns,
  triggerEmailCampaign,
  type EmailCampaign,
} from '../lib/emailCampaigns';
import { dateLong, time, toIsoFromLocal } from '../lib/format';
import type { Event, EventAssignment, Organization, Team } from '../lib/types';

export function EventDetailPage({ org }: { org: Organization }) {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [assignments, setAssignments] = useState<EventAssignment[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [error, setError] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  async function load() {
    if (!id) return;
    const [eventData, assignmentData, teamData, campaignData] = await Promise.all([
      fetchEvent(id),
      fetchAssignments(id),
      fetchTeams(org.id),
      getEmailCampaigns(id).catch(() => [] as EmailCampaign[]),
    ]);
    setEvent(eventData);
    setAssignments(assignmentData);
    setTeams(teamData);
    setEmailCampaigns(campaignData);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Nao foi possivel carregar o evento.'));
  }, [id, org.id]);

  const inviteUrl = useMemo(() => {
    if (!event?.invite_code) return '';
    return `${window.location.origin}/entrar?code=${event.invite_code}`;
  }, [event?.invite_code]);

  async function ensureInvite() {
    if (!event) return;
    if (!event.invite_code) {
      const invite = await generateInvite(event.id);
      setEvent({ ...event, invite_code: invite });
    }
    setShowInvite(true);
  }

  async function sendEmails() {
    if (!event || emailSending) return;
    setEmailSending(true);
    setError('');
    setEmailMessage('');
    try {
      const inviteCode = event.invite_code || await generateInvite(event.id);
      if (!event.invite_code) setEvent({ ...event, invite_code: inviteCode });

      const campaignId = await createEmailCampaign(event.id, `Escala - ${event.title}`);
      const result = await triggerEmailCampaign(event.id, campaignId);
      const updated = await getEmailCampaigns(event.id).catch(() => emailCampaigns);
      setEmailCampaigns(updated);
      setShowEmailModal(false);
      setEmailMessage(`${result.sent} email${result.sent === 1 ? '' : 's'} enviado${result.sent === 1 ? '' : 's'}${result.failed > 0 ? `, ${result.failed} falha${result.failed === 1 ? '' : 's'}` : ''}.`);
    } catch (err) {
      setError(emailErrorMessage(err));
    } finally {
      setEmailSending(false);
    }
  }

  if (error) return <div className="page"><div className="alert alert-danger">{error}</div></div>;
  if (!event) return <div className="page"><div className="card">Carregando evento...</div></div>;

  return (
    <div className="page">
      <header className="event-hero" style={{ borderTopColor: event.color }}>
        <div>
          <span className="eyebrow">{event.category ?? 'Evento'}</span>
          <h1>{event.title}</h1>
          <p>{dateLong(event.start_date)} · {time(event.start_date)}{event.end_date ? ` ate ${time(event.end_date)}` : ''}</p>
          {event.location ? <p>{event.location}</p> : null}
        </div>
        <div className="action-row">
          <Button variant="secondary" icon={<Mail size={18} />} onClick={() => setShowEmailModal(true)}>
            Enviar emails
          </Button>
          <Button variant="accent" icon={<Share2 size={18} />} onClick={ensureInvite}>Compartilhar convite</Button>
        </div>
      </header>

      {emailMessage ? <div className="alert alert-success">{emailMessage}</div> : null}
      <StatusSummary assignments={assignments} />

      {showInvite ? (
        <section className="card invite-box">
          <div className="card-title">
            <QrCode size={22} />
            <div>
              <h2>Convite do evento</h2>
              <span>Use o codigo e o email cadastrado na escala.</span>
            </div>
          </div>
          <QRCodeSVG value={inviteUrl || event.invite_code || event.id} size={176} />
          <strong className="invite-code">{event.invite_code}</strong>
          <div className="action-row">
            <Button variant="secondary" icon={<Copy size={18} />} onClick={() => navigator.clipboard.writeText(event.invite_code ?? '')}>
              Copiar codigo
            </Button>
            <Button variant="secondary" icon={<Copy size={18} />} onClick={() => navigator.clipboard.writeText(inviteUrl)}>
              Copiar link
            </Button>
          </div>
        </section>
      ) : null}

      {emailCampaigns.length > 0 ? (
        <section className="card email-campaign-card">
          <div>
            <span className="eyebrow">Ultimo envio por email</span>
            <strong>
              {emailCampaigns[0].sent_count} enviado{emailCampaigns[0].sent_count === 1 ? '' : 's'}
              {emailCampaigns[0].failed_count > 0 ? `, ${emailCampaigns[0].failed_count} falha${emailCampaigns[0].failed_count === 1 ? '' : 's'}` : ''}
            </strong>
            <small>{formatDateTime(emailCampaigns[0].created_at)} - {campaignStatusLabel(emailCampaigns[0].status)}</small>
          </div>
          <Mail size={22} />
        </section>
      ) : null}

      <div className="detail-grid">
        <section className="card">
          <div className="section-head">
            <h2>Escala</h2>
            <span>{assignments.length} escalados</span>
          </div>
          <div className="assignment-list">
            {assignments.length === 0 ? <p className="muted">Nenhum escalado cadastrado.</p> : null}
            {assignments.map((item) => (
              <div className="assignment-row" key={item.assignment_id}>
                <div>
                  <strong>{item.invitee_name}</strong>
                  <span>{item.team_name ?? 'Equipe geral'}{item.role ? ` · ${item.role}` : ''}</span>
                  <small>{time(item.arrival_time ?? item.start_time)}{item.end_time ? ` ate ${time(item.end_time)}` : ''}</small>
                  {item.decline_reason ? <small className="danger-text">Motivo: {item.decline_reason}</small> : null}
                </div>
                <Badge status={item.response_status} />
              </div>
            ))}
          </div>
        </section>

        <AssignmentForm event={event} org={org} teams={teams} onSaved={load} />
      </div>

      {showEmailModal ? (
        <div className="modal-backdrop">
          <section className="card modal-sheet">
            <div className="card-title">
              <Send size={22} />
              <div>
                <h2>Enviar escala por email</h2>
                <span>Dispare o acesso para todos com email cadastrado.</span>
              </div>
            </div>
            <div className="email-summary">
              <div><span>Escalados</span><strong>{assignments.length}</strong></div>
              <div><span>Com email</span><strong>{assignments.filter((item) => item.invitee_email).length}</strong></div>
              {emailCampaigns.length > 0 ? (
                <div><span>Ultimo envio</span><strong>{formatDateTime(emailCampaigns[0].created_at)}</strong></div>
              ) : null}
            </div>
            <p className="muted">Cada escalado recebera um email com os dados da propria escala e o codigo de acesso ao evento.</p>
            <div className="action-row">
              <Button type="button" variant="secondary" onClick={() => setShowEmailModal(false)} disabled={emailSending}>Cancelar</Button>
              <Button type="button" icon={<Send size={18} />} onClick={sendEmails} disabled={emailSending || assignments.filter((item) => item.invitee_email).length === 0}>
                {emailSending ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function emailErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (message === 'NO_RECIPIENTS') return 'Nenhum escalado com email valido encontrado.';
  if (message === 'NOT_AUTHORIZED') return 'Sem permissao para enviar neste evento.';
  if (message.includes('Campaign already sent')) return 'Este envio ja foi processado ou esta em andamento.';
  return message || 'Nao foi possivel enviar os emails.';
}

function campaignStatusLabel(status: EmailCampaign['status']) {
  if (status === 'sent') return 'enviado';
  if (status === 'sending') return 'enviando';
  if (status === 'partial_failed') return 'parcial';
  if (status === 'failed') return 'falhou';
  return 'rascunho';
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AssignmentForm({
  event,
  org,
  teams,
  onSaved,
}: {
  event: Event;
  org: Organization;
  teams: Team[];
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [teamId, setTeamId] = useState('');
  const [newTeam, setNewTeam] = useState('');
  const [role, setRole] = useState('');
  const [arrival, setArrival] = useState('');
  const [end, setEnd] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(eventSubmit: FormEvent) {
    eventSubmit.preventDefault();
    setSaving(true);
    setError('');
    try {
      let resolvedTeamId = teamId || undefined;
      if (!resolvedTeamId && newTeam.trim()) {
        resolvedTeamId = (await createTeam(org.id, newTeam.trim())).id;
      }
      await createAssignment({
        eventId: event.id,
        teamId: resolvedTeamId,
        inviteeName: name.trim(),
        inviteeEmail: email.trim().toLowerCase(),
        inviteePhone: phone.trim() || undefined,
        role: role.trim() || undefined,
        arrivalTime: arrival ? toIsoFromLocal(arrival) : undefined,
        startTime: arrival ? toIsoFromLocal(arrival) : undefined,
        endTime: end ? toIsoFromLocal(end) : undefined,
        notes: notes.trim() || undefined,
      });
      setName('');
      setEmail('');
      setPhone('');
      setRole('');
      setArrival('');
      setEnd('');
      setNotes('');
      setNewTeam('');
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel salvar a escala.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form-stack" onSubmit={submit}>
      <div className="card-title">
        <UserPlus size={22} />
        <div>
          <h2>Adicionar escalado</h2>
          <span>O convidado entra com codigo do evento + email.</span>
        </div>
      </div>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <Field label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
      <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Field label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <SelectField label="Equipe" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
        <option value="">Equipe geral</option>
        {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
      </SelectField>
      {!teamId ? <Field label="Ou criar equipe" value={newTeam} onChange={(e) => setNewTeam(e.target.value)} placeholder="Vocal, Recepcao..." /> : null}
      <Field label="Funcao" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Soprano, Violao..." />
      <div className="two-cols">
        <Field label="Chegada" type="datetime-local" value={arrival} onChange={(e) => setArrival(e.target.value)} />
        <Field label="Fim" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>
      <Textarea label="Observacoes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      <Button disabled={saving} icon={<Plus size={18} />}>{saving ? 'Salvando...' : 'Salvar escala'}</Button>
    </form>
  );
}
