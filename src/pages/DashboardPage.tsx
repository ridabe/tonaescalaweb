import { BarChart3, CalendarPlus, CheckCircle2, Clock3, UsersRound, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchMonthlyInsights } from '../lib/api';
import { dateShort } from '../lib/format';
import type { MonthlyInsights, Organization } from '../lib/types';

export function DashboardPage({ org }: { org: Organization }) {
  const [data, setData] = useState<MonthlyInsights | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMonthlyInsights(org.id).then(setData).catch((err) => {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar o dashboard.');
    });
  }, [org.id]);

  if (error) return <div className="page"><div className="alert alert-danger">{error}</div></div>;
  if (!data) return <div className="page"><div className="card">Carregando dashboard...</div></div>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Ferramentas</span>
          <h1>Dashboard</h1>
        </div>
      </header>

      {data.eventsCreated === 0 ? (
        <div className="empty-state"><BarChart3 size={42} /><h2>Sem dados neste mes</h2><p>Crie eventos e escalas para acompanhar os indicadores.</p></div>
      ) : (
        <>
          <section className="dashboard-hero">
            <div>
              <span>Taxa de resposta</span>
              <strong>{data.responseRate}%</strong>
              <p>{data.accepted + data.declined} respostas de {data.totalScaled} itens de escala.</p>
            </div>
          </section>

          <div className="summary-grid">
            <Metric icon={<CalendarPlus size={20} />} label="Eventos no mes" value={data.eventsCreated} tone="info" />
            <Metric icon={<UsersRound size={20} />} label="Escalados" value={data.totalScaled} tone="info" />
            <Metric icon={<CheckCircle2 size={20} />} label="Aceites" value={data.accepted} tone="success" />
            <Metric icon={<Clock3 size={20} />} label="Pendentes" value={data.pending} tone="warning" />
          </div>

          <section className="card">
            <div className="section-head">
              <h2>Eventos do mes</h2>
              <span>{data.uniquePeople} pessoas unicas</span>
            </div>
            <div className="resource-list">
              {data.events.map((item) => (
                <article className="insight-row" key={item.event.id}>
                  <div>
                    <strong>{item.event.title}</strong>
                    <span>{dateShort(item.event.start_date)} · {item.total} escalados · {item.responseRate}% resposta</span>
                  </div>
                  <div className="insight-pills">
                    <span className="badge badge-accepted"><CheckCircle2 size={12} />{item.accepted}</span>
                    <span className="badge badge-declined"><XCircle size={12} />{item.declined}</span>
                    <span className="badge badge-pending"><Clock3 size={12} />{item.pending}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) {
  return (
    <div className={`metric metric-${tone}`}>
      {icon}
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
