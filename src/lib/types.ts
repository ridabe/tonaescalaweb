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
