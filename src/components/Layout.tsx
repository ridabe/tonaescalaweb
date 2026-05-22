import { Bell, CalendarDays, CalendarPlus, LogOut, UserRound } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Organization } from '../lib/types';

export function AppLayout({ org }: { org: Organization | null }) {
  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <img src="/img/tonaescala-logo-horizontal.png" alt="ToNaEscala" className="brand-logo" />
        <div className="org-pill">{org?.name ?? 'Organizacao'}</div>
        <nav>
          <NavLink to="/app/agenda"><CalendarDays size={20} />Agenda</NavLink>
          <NavLink to="/app/eventos"><CalendarPlus size={20} />Eventos</NavLink>
          <NavLink to="/app/notificacoes"><Bell size={20} />Notificacoes</NavLink>
          <NavLink to="/app/perfil"><UserRound size={20} />Perfil</NavLink>
        </nav>
        <button className="logout" onClick={logout}><LogOut size={18} />Sair</button>
      </aside>
      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
}
