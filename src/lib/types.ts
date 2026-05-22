export type Organization = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
};

export type Event = {
  id: string;
  organization_id: string;
  parent_event_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  color: string;
  invite_code: string | null;
  status: 'active' | 'cancelled' | 'archived';
  created_by: string;
};

export type Team = {
  id: string;
  organization_id: string;
  name: string;
  type: string | null;
};

export type AssignmentStatus = 'pending' | 'accepted' | 'declined';

export type EventAssignment = {
  assignment_id: string;
  event_id: string;
  team_id: string | null;
  team_name: string | null;
  participant_id: string | null;
  invitee_name: string;
  invitee_email: string;
  invitee_phone: string | null;
  role: string | null;
  arrival_time: string | null;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  viewed_at: string | null;
  response_status: AssignmentStatus;
  decline_reason: string | null;
  responded_at: string | null;
};

export type GuestEventSummary = {
  event_id: string;
  event_title: string;
  event_location: string | null;
  event_start_date: string;
  event_end_date: string | null;
  event_color: string;
  organization_name: string;
  assignment_count: number;
  pending_count: number;
  accepted_count: number;
  declined_count: number;
  is_current_invite: boolean;
};

export type GuestAssignment = {
  assignment_id: string;
  event_id: string;
  event_title: string;
  event_description: string | null;
  event_location: string | null;
  event_start_date: string;
  event_end_date: string | null;
  event_color: string;
  organization_name: string;
  team_id: string | null;
  team_name: string | null;
  invitee_name: string;
  invitee_email: string;
  role: string | null;
  arrival_time: string | null;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  viewed_at: string | null;
  response_status: AssignmentStatus;
  decline_reason: string | null;
  responded_at: string | null;
};

export type AssignmentRosterItem = {
  assignment_id: string;
  team_id: string | null;
  team_name: string | null;
  invitee_name: string;
  role: string | null;
  response_status: AssignmentStatus;
  is_current_user: boolean;
};

export type AdminNotification = {
  id: string;
  event_id: string;
  assignment_id: string | null;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

export type Song = {
  id: string;
  org_id: string | null;
  title: string;
  artist: string | null;
  default_key: string | null;
  male_key: string | null;
  female_key: string | null;
  lyrics: string | null;
  chords: string | null;
  links: string[];
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

export type OrgContact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  default_role: string | null;
  created_at: string;
};

export type EventInsight = {
  event: Event;
  total: number;
  accepted: number;
  declined: number;
  pending: number;
  uniquePeople: number;
  responseRate: number;
};

export type MonthlyInsights = {
  monthStart: string;
  monthEnd: string;
  eventsCreated: number;
  totalScaled: number;
  uniquePeople: number;
  accepted: number;
  declined: number;
  pending: number;
  responseRate: number;
  events: EventInsight[];
};
