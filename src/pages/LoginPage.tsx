import type { Session } from '@supabase/supabase-js';
import { CalendarCheck2, KeyRound, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { getGuestEvents, signIn, signInWithGoogle, signUp } from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';

export function LoginPage({ session }: { session: Session | null }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState(params.get('code') ?? '');
  const [guestEmail, setGuestEmail] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (session) return <Navigate to="/app/eventos" replace />;

  async function handleOrganizerSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') await signIn(email.trim(), password);
      else await signUp(email.trim(), password);
      navigate('/app/eventos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel entrar.');
    } finally {
      setBusy(false);
    }
  }

  async function handleGuestSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const code = inviteCode.trim().toUpperCase();
      const normalizedEmail = guestEmail.trim().toLowerCase();
      const events = await getGuestEvents(code, normalizedEmail);
      if (events.length === 0) throw new Error('Este email nao esta convocado para este evento.');
      localStorage.setItem('tne_guest_invite_code', code);
      localStorage.setItem('tne_guest_email', normalizedEmail);
      navigate('/guest');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Confira o codigo e email informados.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="entry-screen">
      <section className="entry-panel">
        <div className="entry-brand">
          <img src="/img/tonaescala-logo-horizontal.png" alt="ToNaEscala" />
          <p>Escalas organizadas para pessoas que servem juntas.</p>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {!isSupabaseConfigured ? (
          <div className="alert alert-danger">
            Configure o arquivo .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY para conectar ao banco.
          </div>
        ) : null}

        <div className="entry-grid">
          <form className="card form-card" onSubmit={handleOrganizerSubmit}>
            <div className="card-title">
              <CalendarCheck2 size={22} />
              <div>
                <h1>Organizador</h1>
                <span>Crie eventos, equipes e convocacoes.</span>
              </div>
            </div>
            <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Field label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button disabled={busy} icon={<Mail size={18} />}>{mode === 'login' ? 'Entrar' : 'Criar conta'}</Button>
            <Button type="button" variant="secondary" onClick={() => signInWithGoogle()} disabled={busy}>
              Entrar com Google
            </Button>
            <button className="text-button" type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
              {mode === 'login' ? 'Criar uma conta' : 'Ja tenho conta'}
            </button>
          </form>

          <form className="card form-card" onSubmit={handleGuestSubmit}>
            <div className="card-title">
              <KeyRound size={22} />
              <div>
                <h1>Convidado</h1>
                <span>Acesse pelo codigo e email convocado.</span>
              </div>
            </div>
            <Field
              label="Codigo do evento"
              placeholder="TNE-9X4KQ2"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
            />
            <Field
              label="Email convocado"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              required
              hint="Use o mesmo email informado pelo organizador."
            />
            <Button disabled={busy} variant="accent">Ver minha convocacao</Button>
          </form>
        </div>
      </section>
    </div>
  );
}
