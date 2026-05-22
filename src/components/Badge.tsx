import type { AssignmentStatus } from '../lib/types';

const labels: Record<AssignmentStatus, string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
  declined: 'Recusado',
};

export function Badge({ status }: { status: AssignmentStatus }) {
  return <span className={`badge badge-${status}`}>{labels[status] ?? 'Pendente'}</span>;
}
