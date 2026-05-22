import { isSupabaseConfigured, supabase } from './supabase';
import type {
  AdminNotification,
  AssignmentRosterItem,
  Event,
  EventAssignment,
  GuestAssignment,
  GuestEventSummary,
  MonthlyInsights,
  OrgContact,
  Organization,
  Song,
  Team,
} from './types';

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env.local.');
  }
}

export async function signIn(email: string, password: string) {
  assertConfigured();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(email: string, password: string) {
  assertConfigured();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signInWithGoogle() {
  assertConfigured();
  const redirectTo = `${window.location.origin}/auth/callback`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) throw error;
}

export async function fetchOrganizations(): Promise<Organization[]> {
  assertConfigured();
  const { data, error } = await supabase.from('organizations').select('*').order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function createOrganization(name: string, description?: string) {
  assertConfigured();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Sessao expirada.');
  const { data, error } = await supabase
    .from('organizations')
    .insert({ name, description: description ?? null, owner_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as Organization;
}

export async function fetchEvents(orgId: string): Promise<Event[]> {
  assertConfigured();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organization_id', orgId)
    .neq('status', 'archived')
    .order('start_date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchEvent(id: string): Promise<Event> {
  assertConfigured();
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createEvent(payload: {
  organization_id: string;
  title: string;
  category?: string;
  location?: string;
  description?: string;
  start_date: string;
  end_date?: string;
  color: string;
}) {
  assertConfigured();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Sessao expirada.');
  const { data, error } = await supabase
    .from('events')
    .insert({ ...payload, created_by: user.id })
    .select()
    .single();
  if (error) throw error;
  await generateInvite(data.id);
  return data as Event;
}

export async function generateInvite(eventId: string): Promise<string> {
  assertConfigured();
  const { data, error } = await supabase.rpc('generate_event_invite', { p_event_id: eventId });
  if (error) throw error;
  return data as string;
}

export async function fetchTeams(orgId: string): Promise<Team[]> {
  assertConfigured();
  const { data, error } = await supabase.from('teams').select('*').eq('organization_id', orgId).order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createTeam(orgId: string, name: string): Promise<Team> {
  assertConfigured();
  const { data, error } = await supabase
    .from('teams')
    .insert({ organization_id: orgId, name })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createAssignment(payload: {
  eventId: string;
  teamId?: string;
  inviteeName: string;
  inviteeEmail: string;
  inviteePhone?: string;
  role?: string;
  arrivalTime?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
}) {
  assertConfigured();
  const { data, error } = await supabase.rpc('create_event_assignment', {
    p_event_id: payload.eventId,
    p_team_id: payload.teamId || null,
    p_invitee_name: payload.inviteeName,
    p_invitee_email: payload.inviteeEmail,
    p_invitee_phone: payload.inviteePhone || null,
    p_role: payload.role || null,
    p_arrival_time: payload.arrivalTime || null,
    p_start_time: payload.startTime || null,
    p_end_time: payload.endTime || null,
    p_notes: payload.notes || null,
  });
  if (error) throw error;
  return data as string;
}

export async function fetchAssignments(eventId: string): Promise<EventAssignment[]> {
  assertConfigured();
  const { data, error } = await supabase.rpc('get_event_assignments_for_organizer', { p_event_id: eventId });
  if (error) throw error;
  return data ?? [];
}

export async function fetchNotifications(): Promise<AdminNotification[]> {
  assertConfigured();
  const { data, error } = await supabase.rpc('get_admin_notifications');
  if (error) throw error;
  return data ?? [];
}

export async function getGuestEvents(inviteCode: string, email: string): Promise<GuestEventSummary[]> {
  assertConfigured();
  const { data, error } = await supabase.rpc('get_guest_events_by_invite_email', {
    p_invite_code: inviteCode,
    p_email: email,
  });
  if (error) throw error;
  return data ?? [];
}

export async function getGuestAssignments(
  inviteCode: string,
  email: string,
  eventId?: string,
): Promise<GuestAssignment[]> {
  assertConfigured();
  const { data, error } = await supabase.rpc('get_assignments_by_guest_event_email', {
    p_invite_code: inviteCode,
    p_email: email,
    p_event_id: eventId ?? null,
  });
  if (error) throw error;
  return data ?? [];
}

export async function getGuestRoster(
  inviteCode: string,
  email: string,
  eventId: string,
): Promise<AssignmentRosterItem[]> {
  assertConfigured();
  const { data, error } = await supabase.rpc('get_assignment_roster_by_guest_event_email', {
    p_invite_code: inviteCode,
    p_email: email,
    p_event_id: eventId,
  });
  if (error) throw error;
  return data ?? [];
}

export async function respondAssignment(
  inviteCode: string,
  email: string,
  assignmentId: string,
  response: 'accepted' | 'declined',
  declineReason?: string,
) {
  assertConfigured();
  const { error } = await supabase.rpc('respond_guest_event_assignment', {
    p_invite_code: inviteCode,
    p_email: email,
    p_assignment_id: assignmentId,
    p_response: response,
    p_decline_reason: declineReason ?? null,
  });
  if (error) throw error;
}

export async function fetchSongs(): Promise<Song[]> {
  assertConfigured();
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('is_active', true)
    .order('title', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createSong(payload: {
  org_id: string;
  title: string;
  artist?: string;
  default_key?: string;
  male_key?: string;
  female_key?: string;
  lyrics?: string;
  chords?: string;
  notes?: string;
  links?: string[];
}): Promise<Song> {
  assertConfigured();
  const { data, error } = await supabase
    .from('songs')
    .insert({ ...payload, links: payload.links ?? [] })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchOrgContacts(orgId: string): Promise<OrgContact[]> {
  assertConfigured();
  const { data, error } = await supabase.rpc('list_org_contacts', { p_org_id: orgId });
  if (error) throw error;
  return data ?? [];
}

export async function upsertOrgContact(
  orgId: string,
  contact: { name: string; email?: string; phone?: string; default_role?: string },
): Promise<string> {
  assertConfigured();
  const { data, error } = await supabase.rpc('upsert_org_contact', {
    p_org_id: orgId,
    p_name: contact.name,
    p_email: contact.email ?? null,
    p_phone: contact.phone ?? null,
    p_default_role: contact.default_role ?? null,
  });
  if (error) throw error;
  return data as string;
}

function monthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
  return { start, end };
}

export async function fetchMonthlyInsights(orgId: string, referenceDate = new Date()): Promise<MonthlyInsights> {
  assertConfigured();
  const { start, end } = monthRange(referenceDate);
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('organization_id', orgId)
    .neq('status', 'archived')
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())
    .order('start_date', { ascending: true });

  if (error) throw error;

  const monthEvents = (events ?? []) as Event[];
  const eventIds = monthEvents.map((event) => event.id);

  if (eventIds.length === 0) {
    return {
      monthStart: start.toISOString(),
      monthEnd: end.toISOString(),
      eventsCreated: 0,
      totalScaled: 0,
      uniquePeople: 0,
      accepted: 0,
      declined: 0,
      pending: 0,
      responseRate: 0,
      events: [],
    };
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from('event_assignments')
    .select('event_id, invitee_email, invitee_name, response_status')
    .in('event_id', eventIds);

  if (assignmentsError) throw assignmentsError;

  const byEvent = new Map<string, Array<{ invitee_email: string | null; invitee_name: string | null; response_status: string }>>();
  for (const item of assignments ?? []) {
    const rows = byEvent.get(item.event_id) ?? [];
    rows.push(item);
    byEvent.set(item.event_id, rows);
  }

  let totalScaled = 0;
  let accepted = 0;
  let declined = 0;
  let pending = 0;
  const uniquePeople = new Set<string>();

  const eventInsights = monthEvents.map((event) => {
    const rows = byEvent.get(event.id) ?? [];
    const eventPeople = new Set<string>();
    const eventAccepted = rows.filter((item) => item.response_status === 'accepted').length;
    const eventDeclined = rows.filter((item) => item.response_status === 'declined').length;
    const eventPending = rows.filter((item) => item.response_status === 'pending').length;

    for (const row of rows) {
      const key = row.invitee_email?.toLowerCase().trim() || row.invitee_name || `${event.id}-${eventPeople.size}`;
      eventPeople.add(key);
      uniquePeople.add(key);
    }

    const total = rows.length;
    totalScaled += total;
    accepted += eventAccepted;
    declined += eventDeclined;
    pending += eventPending;

    return {
      event,
      total,
      accepted: eventAccepted,
      declined: eventDeclined,
      pending: eventPending,
      uniquePeople: eventPeople.size,
      responseRate: total > 0 ? Math.round(((eventAccepted + eventDeclined) / total) * 100) : 0,
    };
  });

  return {
    monthStart: start.toISOString(),
    monthEnd: end.toISOString(),
    eventsCreated: monthEvents.length,
    totalScaled,
    uniquePeople: uniquePeople.size,
    accepted,
    declined,
    pending,
    responseRate: totalScaled > 0 ? Math.round(((accepted + declined) / totalScaled) * 100) : 0,
    events: eventInsights,
  };
}
