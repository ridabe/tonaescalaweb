import type { EventAssignment } from '../lib/types';

export function StatusSummary({ assignments }: { assignments: EventAssignment[] }) {
  const accepted = assignments.filter((item) => item.response_status === 'accepted').length;
  const declined = assignments.filter((item) => item.response_status === 'declined').length;
  const viewedPending = assignments.filter((item) => item.viewed_at && item.response_status === 'pending').length;
  const notViewed = assignments.filter((item) => !item.viewed_at).length;

  return (
    <div className="summary-grid">
      <Metric label="Aceitos" value={accepted} tone="success" />
      <Metric label="Recusas" value={declined} tone="danger" />
      <Metric label="Vistos" value={viewedPending} tone="info" />
      <Metric label="Nao vistos" value={notViewed} tone="warning" />
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`metric metric-${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
