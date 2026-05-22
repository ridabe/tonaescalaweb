import { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { AppLayout } from './components/Layout';
import { fetchOrganizations } from './lib/api';
import { supabase } from './lib/supabase';
import type { Organization } from './lib/types';
import { AgendaPage } from './pages/AgendaPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { ContactsPage } from './pages/ContactsPage';
import { DashboardPage } from './pages/DashboardPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { EventsPage } from './pages/EventsPage';
import { GuestPage } from './pages/GuestPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { NewEventPage } from './pages/NewEventPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SetupOrganizationPage } from './pages/SetupOrganizationPage';
import { SongsPage } from './pages/SongsPage';
import { ToolsPage } from './pages/ToolsPage';
import './styles.css';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgLoading, setOrgLoading] = useState(false);

  async function reloadOrgs() {
    if (!session) {
      setOrgs([]);
      setOrgLoading(false);
      return;
    }
    setOrgLoading(true);
    try {
      setOrgs(await fetchOrganizations());
    } finally {
      setOrgLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    reloadOrgs().catch(() => setOrgs([]));
  }, [session]);

  const org = useMemo(() => orgs[0] ?? null, [orgs]);

  if (loading) return <div className="splash">Carregando ToNaEscala...</div>;
  const orgFallback = <div className="splash">Carregando sua organizacao...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/entrar" element={<LoginPage session={session} />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/guest" element={<GuestPage />} />
        <Route
          path="/setup"
          element={
            session
              ? orgLoading
                ? orgFallback
                : org
                  ? <Navigate to="/app/eventos" replace />
                  : <SetupOrganizationPage onCreated={reloadOrgs} />
              : <Navigate to="/entrar" replace />
          }
        />
        <Route
          path="/app"
          element={
            session
              ? orgLoading
                ? orgFallback
                : org
                  ? <AppLayout org={org} />
                  : <Navigate to="/setup" replace />
              : <Navigate to="/entrar" replace />
          }
        >
          <Route index element={<Navigate to="/app/eventos" replace />} />
          <Route path="agenda" element={<AgendaPage org={org} />} />
          <Route path="eventos" element={<EventsPage org={org} />} />
          <Route path="eventos/novo" element={<NewEventPage org={org} />} />
          <Route path="eventos/:id" element={<EventDetailPage org={org} />} />
          <Route path="ferramentas" element={<ToolsPage />} />
          <Route path="ferramentas/repertorio" element={<SongsPage org={org} />} />
          <Route path="ferramentas/escalados" element={<ContactsPage org={org} />} />
          <Route path="ferramentas/dashboard" element={<DashboardPage org={org} />} />
          <Route path="notificacoes" element={<NotificationsPage />} />
          <Route path="perfil" element={<ProfilePage org={org} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
