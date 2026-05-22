import { Activity, BarChart3, CalendarPlus, CheckCircle2, Clock3, TrendingUp, UsersRound, XCircle } from 'lucide-react';
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

  const answered = data.accepted + data.declined;
  const acceptedPercent = percent(data.accepted, data.totalScaled);
  const declinedPercent = percent(data.declined, data.totalScaled);
  const pendingPercent = percent(data.pending, data.totalScaled);
  const topEvent = [...data.events].sort((a, b) => b.total - a.total)[0];

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
          <section className="dashboard-hero-v2">
            <div className="dashboard-hero-copy">
              <span className="eyebrow hero-eyebrow">Painel mensal</span>
              <h2>Saude das escalas</h2>
              <p>{answered} respostas de {data.totalScaled} itens de escala neste mes.</p>
              <div className="hero-mini-grid">
                <HeroMini label="Maior escala" value={topEvent ? topEvent.event.title : 'Sem evento'} />
                <HeroMini label="Pessoas unicas" value={String(data.uniquePeople)} />
              </div>
            </div>
            <ResponseDonut rate={data.responseRate} />
          </section>

          <div className="dashboard-metric-grid">
            <Metric icon={<CalendarPlus size={20} />} label="Eventos no mes" value={data.eventsCreated} tone="info" />
            <Metric icon={<UsersRound size={20} />} label="Escalados" value={data.totalScaled} tone="info" />
            <Metric icon={<CheckCircle2 size={20} />} label="Aceites" value={data.accepted} tone="success" />
            <Metric icon={<XCircle size={20} />} label="Recusas" value={data.declined} tone="danger" />
            <Metric icon={<Clock3 size={20} />} label="Pendentes" value={data.pending} tone="warning" />
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-panel">
              <div className="section-head">
                <h2>Distribuicao de respostas</h2>
                <span>{data.totalScaled} itens</span>
              </div>
              <div className="status-bars">
                <StatusBar label="Aceites" value={data.accepted} percent={acceptedPercent} tone="success" />
                <StatusBar label="Recusas" value={data.declined} percent={declinedPercent} tone="danger" />
                <StatusBar label="Pendentes" value={data.pending} percent={pendingPercent} tone="warning" />
              </div>
            </section>

            <section className="dashboard-panel dashboard-panel-dark">
              <Activity size={22} />
              <h2>Resumo operacional</h2>
              <p>
                {data.pending > answered
                  ? 'Ha mais itens pendentes do que respondidos. Vale reenviar o convite ou falar direto com a equipe.'
                  : 'As respostas ja superam as pendencias. Acompanhe recusas e ajuste a escala quando necessario.'}
              </p>
              <strong>{data.responseRate}%</strong>
              <span>taxa de resposta</span>
            </section>
          </div>

          <section className="dashboard-panel">
            <div className="section-head">
              <h2>Eventos do mes</h2>
              <span>{data.uniquePeople} pessoas unicas</span>
            </div>
            <div className="insight-list-v2">
              {data.events.map((item) => (
                <article className="insight-card-v2" key={item.event.id}>
                  <div className="insight-card-head">
                    <div>
                      <strong>{item.event.title}</strong>
                      <span>{dateShort(item.event.start_date)} · {item.total} escalados</span>
                    </div>
                    <div className="response-chip">
                      <TrendingUp size={14} />
                      {item.responseRate}%
                    </div>
                  </div>
                  <div className="event-progress-track" aria-label={`Taxa de resposta ${item.responseRate}%`}>
                    <span style={{ width: `${item.responseRate}%`, background: item.event.color }} />
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

function percent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function ResponseDonut({ rate }: { rate: number }) {
  return (
    <div className="response-donut" style={{ '--rate': `${rate * 3.6}deg` } as React.CSSProperties}>
      <div>
        <strong>{rate}%</strong>
        <span>respondido</span>
      </div>
    </div>
  );
}

function HeroMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="hero-mini">
      <span>{label}</span>
      <strong title={value}>{value}</strong>
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

function StatusBar({ label, value, percent, tone }: { label: string; value: number; percent: number; tone: string }) {
  return (
    <div className={`status-bar status-${tone}`}>
      <div>
        <strong>{label}</strong>
        <span>{value} · {percent}%</span>
      </div>
      <div className="status-track">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
