import { isSupabaseConfigured, supabase } from './supabase';
import type {
  AdminNotification,
  AssignmentRosterItem,
  Event,
  EventAssignment,
  GuestAssignment,
  GuestEventSummary,
  Organization,
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
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
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
