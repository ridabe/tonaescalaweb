import { CalendarDays, ChevronLeft, ChevronRight, List, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { fetchAssignments, fetchEvents } from '../lib/api';
import { dateShort, time } from '../lib/format';
import type { Event, EventAssignment, Organization } from '../lib/types';
import { Badge } from '../components/Badge';

export function AgendaPage({ org }: { org: Organization }) {
  const [rows, setRows] = useState<Array<{ event: Event; assignment: EventAssignment }>>([]);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [previewDay, setPreviewDay] = useState<Date | null>(null);

  useEffect(() => {
    async function load() {
      const events = await fetchEvents(org.id);
      const all = await Promise.all(events.map(async (event) => (await fetchAssignments(event.id)).map((assignment) => ({ event, assignment }))));
      setRows(all.flat().sort((a, b) => a.event.start_date.localeCompare(b.event.start_date)));
    }
    load().catch(() => setRows([]));
  }, [org.id]);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(monthCursor);
  }, [monthCursor]);

  const weekDayLabels = useMemo(() => {
    const base = startOfWeek(new Date());
    const fmt = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
    return Array.from({ length: 7 }).map((_, idx) => fmt.format(addDays(base, idx)));
  }, []);

  const rowsByDayKey = useMemo(() => {
    const map = new Map<string, Array<{ event: Event; assignment: EventAssignment }>>();
    for (const row of rows) {
      const day = parseIsoToLocalDate(row.event.start_date);
      const key = dayKey(day);
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    for (const [key, list] of map.entries()) {
      list.sort((a, b) => {
        const aTime = a.assignment.arrival_time ?? a.assignment.start_time ?? a.event.start_date;
        const bTime = b.assignment.arrival_time ?? b.assignment.start_time ?? b.event.start_date;
        return aTime.localeCompare(bTime);
      });
      map.set(key, list);
    }
    return map;
  }, [rows]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(monthCursor);
    const end = addDays(startOfWeek(addMonths(monthCursor, 1)), 41);
    const days: Date[] = [];
    let cursor = start;
    while (cursor <= end) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [monthCursor]);

  const selectedRows = useMemo(() => {
    if (!selectedDay) return [];
    return rowsByDayKey.get(dayKey(selectedDay)) ?? [];
  }, [rowsByDayKey, selectedDay]);

  const isTouchMode = useMemo(() => {
    if (!window.matchMedia) return false;
    return window.matchMedia('(pointer: coarse)').matches;
  }, []);

  const previewRows = useMemo(() => {
    if (!previewDay) return [];
    return rowsByDayKey.get(dayKey(previewDay)) ?? [];
  }, [previewDay, rowsByDayKey]);

  const previewEvents = useMemo(() => {
    if (!previewDay) return [];
    const byEvent = new Map<string, {
      event: Event;
      total: number;
      accepted: number;
      declined: number;
      pending: number;
    }>();

    for (const row of previewRows) {
      const current = byEvent.get(row.event.id) ?? {
        event: row.event,
        total: 0,
        accepted: 0,
        declined: 0,
        pending: 0,
      };
      current.total += 1;
      if (row.assignment.response_status === 'accepted') current.accepted += 1;
      else if (row.assignment.response_status === 'declined') current.declined += 1;
      else current.pending += 1;
      byEvent.set(row.event.id, current);
    }

    return Array.from(byEvent.values()).sort((a, b) => a.event.start_date.localeCompare(b.event.start_date));
  }, [previewDay, previewRows]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Agenda</span>
          <h1>Escalas da organizacao</h1>
        </div>
        <div className="agenda-controls">
          <button
            type="button"
            className={view === 'calendar' ? 'agenda-toggle active' : 'agenda-toggle'}
            onClick={() => setView('calendar')}
          >
            <CalendarDays size={18} />
            Calendario
          </button>
          <button
            type="button"
            className={view === 'list' ? 'agenda-toggle active' : 'agenda-toggle'}
            onClick={() => setView('list')}
          >
            <List size={18} />
            Lista
          </button>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="empty-state">
          <CalendarDays size={42} />
          <h2>Agenda vazia</h2>
          <p>Quando houver pessoas escaladas, elas aparecem aqui em ordem de data.</p>
        </div>
      ) : view === 'list' ? (
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
      ) : (
        <section className="agenda-calendar card">
          <div className="agenda-calendar-head">
            <div>
              <span className="eyebrow">Mes</span>
              <strong className="agenda-month">{capitalize(monthLabel)}</strong>
            </div>
            <div className="action-row">
              <Button
                type="button"
                variant="secondary"
                icon={<ChevronLeft size={18} />}
                onClick={() => setMonthCursor((prev) => addMonths(prev, -1))}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="secondary"
                icon={<ChevronRight size={18} />}
                onClick={() => setMonthCursor((prev) => addMonths(prev, 1))}
              >
                Proximo
              </Button>
            </div>
          </div>

          <div className="agenda-calendar-body">
            <div className="agenda-calendar-left">
              <div className="agenda-weekdays" aria-hidden="true">
                {weekDayLabels.map((label) => (
                  <div key={label} className="agenda-weekday">{label}</div>
                ))}
              </div>

              <div className="agenda-grid">
                {calendarDays.map((day) => {
                  const isCurrentMonth = day.getMonth() === monthCursor.getMonth();
                  const isToday = dayKey(day) === dayKey(new Date());
                  const items = rowsByDayKey.get(dayKey(day)) ?? [];
                  const colors = uniqueColors(items.map((row) => row.event.color)).slice(0, 3);
                  const hasItems = items.length > 0;
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      className={[
                        'agenda-day',
                        isCurrentMonth ? '' : 'muted',
                        isToday ? 'today' : '',
                        hasItems ? 'has-items' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => {
                        if (!hasItems) return;
                        if (!isTouchMode) {
                          setSelectedDay(day);
                          return;
                        }
                        if (!previewDay || dayKey(previewDay) !== dayKey(day)) {
                          setPreviewDay(day);
                          return;
                        }
                        setSelectedDay(day);
                      }}
                      onMouseEnter={hasItems ? () => setPreviewDay(day) : undefined}
                      onMouseLeave={hasItems ? () => setPreviewDay((prev) => (prev && dayKey(prev) === dayKey(day) ? null : prev)) : undefined}
                      onFocus={hasItems ? () => setPreviewDay(day) : undefined}
                      onBlur={hasItems ? () => setPreviewDay((prev) => (prev && dayKey(prev) === dayKey(day) ? null : prev)) : undefined}
                    >
                      <span className="agenda-day-number">{day.getDate()}</span>
                      {hasItems ? (
                        <span className="agenda-day-meta">
                          <span className="agenda-dots" aria-hidden="true">
                            {colors.map((color) => (
                              <span key={color} className="agenda-dot" style={{ background: color }} />
                            ))}
                          </span>
                          <span className="agenda-count">{items.length}</span>
                        </span>
                      ) : (
                        <span className="agenda-day-meta empty" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="agenda-preview" aria-label="Resumo do dia">
              <div className="agenda-preview-head">
                <div>
                  <strong>{previewDay ? formatDayTitle(previewDay) : 'Resumo do dia'}</strong>
                  <span className="muted">
                    {previewDay ? `${previewRows.length} item${previewRows.length === 1 ? '' : 's'}` : isTouchMode ? 'Toque em um dia com eventos.' : 'Passe o mouse em um dia com eventos.'}
                  </span>
                </div>
                {previewDay && previewEvents.length > 0 ? (
                  <Button type="button" variant="secondary" className="agenda-preview-button" onClick={() => setSelectedDay(previewDay)}>
                    Ver detalhes
                  </Button>
                ) : null}
              </div>

              {previewDay && previewEvents.length > 0 ? (
                <div className="agenda-preview-list">
                  {previewEvents.map(({ event, total, accepted, declined, pending }) => (
                    <div className="agenda-preview-item" key={event.id} style={{ borderLeftColor: event.color }}>
                      <div className="agenda-preview-main">
                        <strong>{event.title}</strong>
                        <span className="muted">
                          {time(event.start_date)}{event.location ? ` · ${event.location}` : ''}
                        </span>
                      </div>
                      <div className="agenda-preview-chips" aria-label="Resumo de respostas">
                        <span className="agenda-chip neutral">{total}</span>
                        <span className="agenda-chip success">{accepted}</span>
                        <span className="agenda-chip warning">{pending}</span>
                        <span className="agenda-chip danger">{declined}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : previewDay ? (
                <p className="muted">Nenhum item para este dia.</p>
              ) : (
                <p className="muted">Clique em um dia para ver detalhes completos.</p>
              )}
            </aside>
          </div>
        </section>
      )}

      {selectedDay ? (
        <div className="modal-backdrop">
          <section className="card modal-sheet agenda-day-sheet" aria-label="Escalas do dia">
            <div className="section-head">
              <div>
                <h2>{formatDayTitle(selectedDay)}</h2>
                <span>{selectedRows.length} item{selectedRows.length === 1 ? '' : 's'} na agenda</span>
              </div>
              <button className="icon-button" type="button" onClick={() => setSelectedDay(null)} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            {selectedRows.length === 0 ? (
              <p className="muted">Nenhuma escala para este dia.</p>
            ) : (
              <div className="event-list">
                {selectedRows.map(({ event, assignment }) => (
                  <div
                    className="event-card"
                    key={assignment.assignment_id}
                    style={{ borderLeftColor: event.color }}
                  >
                    <div>
                      <h2>{event.title}</h2>
                      <p>{time(assignment.arrival_time ?? assignment.start_time ?? event.start_date)} · {assignment.team_name ?? 'Equipe geral'}{assignment.role ? ` · ${assignment.role}` : ''}</p>
                      <span className="muted-line">{assignment.invitee_name}</span>
                    </div>
                    <Badge status={assignment.response_status} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1, 0, 0, 0, 0);
}

function startOfWeek(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const day = d.getDay();
  const mondayBased = (day + 6) % 7;
  d.setDate(d.getDate() - mondayBased);
  return d;
}

function addDays(date: Date, delta: number) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + delta);
  return d;
}

function dayKey(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseIsoToLocalDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function uniqueColors(colors: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const color of colors) {
    const normalized = (color || '').trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(color);
  }
  return result;
}

function capitalize(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function formatDayTitle(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(date);
}
