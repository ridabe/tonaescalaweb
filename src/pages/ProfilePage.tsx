import {
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { fetchEvents } from '../lib/api';
import { supabase } from '../lib/supabase';
import type { Organization } from '../lib/types';

const currentPlan = {
  name: 'Free',
  status: 'Ativo',
  description: 'Plano inicial para validar o uso do Minha Escala com sua equipe.',
  features: [
    'Criacao de eventos habilitada',
    'Escalas por codigo + email',
    'Status de aceite e recusa',
  ],
};

export function ProfilePage({ org }: { org: Organization }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('Conta nao identificada');
  const [displayName, setDisplayName] = useState('Administrador');
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [lastSignInAt, setLastSignInAt] = useState<string | null>(null);
  const [provider, setProvider] = useState('email');
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    async function load() {
      const [{ data }, events] = await Promise.all([
        supabase.auth.getUser(),
        fetchEvents(org.id).catch(() => []),
      ]);
      const user = data.user;
      const userEmail = user?.email ?? 'Conta nao identificada';
      setEmail(userEmail);
      setDisplayName(
        metadataText(user?.user_metadata?.name) ||
        metadataText(user?.user_metadata?.full_name) ||
        userEmail.split('@')[0] ||
        'Administrador',
      );
      setCreatedAt(user?.created_at ?? null);
      setLastSignInAt(user?.last_sign_in_at ?? null);
      setProvider(typeof user?.app_metadata?.provider === 'string' ? user.app_metadata.provider : 'email');
      setEventCount(events.length);
    }
    load();
  }, [org.id]);

  const initials = useMemo(() => getInitials(displayName), [displayName]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <div className="page">
      <section className="profile-hero">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-identity">
          <span className="eyebrow hero-eyebrow">Perfil</span>
          <h1>{displayName}</h1>
          <p>{email}</p>
        </div>
        <Button variant="secondary" icon={<LogOut size={18} />} onClick={signOut}>Sair</Button>
      </section>

      <div className="profile-grid">
        <section className="profile-panel">
          <SectionTitle label="Conta" />
          <InfoRow icon={<Mail size={18} />} label="Email" value={email} />
          <InfoRow icon={<UserRound size={18} />} label="Perfil" value="Administrador da organizacao" />
          <InfoRow icon={<ShieldCheck size={18} />} label="Conta criada" value={formatDate(createdAt)} />
          <InfoRow icon={<LockKeyhole size={18} />} label="Metodo de acesso" value={providerLabel(provider)} />
          <InfoRow icon={<ShieldCheck size={18} />} label="Ultimo acesso" value={formatDate(lastSignInAt)} />
        </section>

        <section className="profile-panel">
          <SectionTitle label="Organizacao" />
          <div className="org-profile-card">
            <div className="org-profile-icon"><Building2 size={26} /></div>
            <div>
              <h2>{org.name}</h2>
              <p>{org.description || 'Organizacao ativa no Minha Escala.'}</p>
            </div>
          </div>
          <div className="profile-stats">
            <ProfileStat icon={<CalendarDays size={18} />} value={eventCount} label="eventos ativos" />
            <ProfileStat icon={<ShieldCheck size={18} />} value="Admin" label="nivel de acesso" />
          </div>
        </section>
      </div>

      <div className="profile-grid">
        <section className="profile-plan-card">
          <div className="plan-topline">
            <div className="plan-icon"><Sparkles size={22} /></div>
            <div>
              <h2>Plano {currentPlan.name}</h2>
              <span>{currentPlan.status}</span>
            </div>
            <strong>BETA</strong>
          </div>
          <p>{currentPlan.description}</p>
          <div className="plan-features">
            {currentPlan.features.map((feature) => (
              <div key={feature}><CheckCircle2 size={16} />{feature}</div>
            ))}
          </div>
          <div className="billing-note">
            <CreditCard size={18} />
            <span>Planos pagos ficarao disponiveis em uma proxima fase.</span>
          </div>
        </section>

        <section className="profile-panel security-panel">
          <SectionTitle label="Seguranca web" />
          <div className="security-row">
            <LockKeyhole size={20} />
            <div>
              <strong>Sessao protegida pelo Supabase Auth</strong>
              <span>O navegador mantem sua sessao ativa com renovacao automatica de token.</span>
            </div>
          </div>
          <div className="security-row">
            <ShieldCheck size={20} />
            <div>
              <strong>Permissoes por organizacao</strong>
              <span>Os dados exibidos respeitam as regras de acesso da sua organizacao.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ label }: { label: string }) {
  return <span className="profile-section-title">{label}</span>;
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="profile-info-row">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ProfileStat({ icon, value, label }: { icon: ReactNode; value: number | string; label: string }) {
  return (
    <div className="profile-stat">
      {icon}
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function metadataText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function getInitials(value: string) {
  const [first, second] = value.split(/[\s@.]+/).filter(Boolean);
  return `${first?.[0] ?? 'A'}${second?.[0] ?? ''}`.toUpperCase();
}

function formatDate(value?: string | null) {
  if (!value) return 'Nao informado';
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function providerLabel(provider: string) {
  if (provider === 'google') return 'Google';
  if (provider === 'email') return 'Email e senha';
  return provider;
}
