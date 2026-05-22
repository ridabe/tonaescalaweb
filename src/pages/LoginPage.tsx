import type { Session } from '@supabase/supabase-js';
import type { IScannerControls } from '@zxing/browser';
import { CalendarCheck2, KeyRound, Mail, QrCode, X } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
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
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMessage, setScannerMessage] = useState('');
  const [scannerError, setScannerError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerControls = useRef<IScannerControls | null>(null);

  useEffect(() => {
    if (!scannerOpen) return undefined;

    let cancelled = false;

    async function startScanner() {
      setScannerError('');
      setScannerMessage('Aponte a camera para o QR Code do evento.');

      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerError('Este navegador nao liberou acesso a camera para leitura de QR Code.');
        setScannerMessage('');
        return;
      }

      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser');
        const reader = new BrowserQRCodeReader();
        const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result, _error, controlsRef) => {
          if (!result) return;
          const code = extractInviteCode(result.getText());
          if (!code) {
            setScannerError('QR Code lido, mas nao encontrei um codigo de evento valido.');
            return;
          }

          controlsRef.stop();
          scannerControls.current = null;
          setInviteCode(code);
          setScannerMessage('Codigo lido. Informe o email para entrar na escala.');
          setScannerOpen(false);
        });

        if (cancelled) {
          controls.stop();
          return;
        }

        scannerControls.current = controls;
      } catch (err) {
        if (cancelled) return;
        setScannerMessage('');
        setScannerError(cameraErrorMessage(err));
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      scannerControls.current?.stop();
      scannerControls.current = null;
    };
  }, [scannerOpen]);

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
      if (events.length === 0) throw new Error('Este email nao esta na escala deste evento.');
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
                <span>Crie eventos, equipes e escalas.</span>
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
                <span>Acesse pelo codigo e email cadastrado na escala.</span>
              </div>
            </div>
            <Field
              label="Codigo do evento"
              placeholder="TNE-9X4KQ2"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
            />
            <Button type="button" variant="secondary" icon={<QrCode size={18} />} onClick={() => setScannerOpen(true)}>
              Ler QR Code
            </Button>
            {scannerMessage && !scannerOpen ? <small className="success-line">{scannerMessage}</small> : null}
            <Field
              label="Email da escala"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              required
              hint="Use o mesmo email informado pelo organizador."
            />
            <Button disabled={busy} variant="accent">Ver minha escala</Button>
          </form>
        </div>
      </section>

      {scannerOpen ? (
        <div className="modal-backdrop">
          <section className="card modal-sheet qr-scanner-sheet">
            <div className="section-head">
              <div>
                <h2>Ler QR Code</h2>
                <span>Aponte a camera para o codigo do evento.</span>
              </div>
              <button className="icon-button" type="button" onClick={() => setScannerOpen(false)} aria-label="Fechar leitor">
                <X size={20} />
              </button>
            </div>
            <div className="qr-video-frame">
              <video ref={videoRef} muted playsInline />
              <div className="qr-scan-marker" aria-hidden="true" />
            </div>
            {scannerError ? <div className="alert alert-danger">{scannerError}</div> : <p className="muted">{scannerMessage}</p>}
            <Button type="button" variant="secondary" onClick={() => setScannerOpen(false)}>Digitar codigo</Button>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function extractInviteCode(value: string) {
  const raw = value.trim();
  if (!raw) return '';

  try {
    const url = new URL(raw);
    const code = url.searchParams.get('code') || url.searchParams.get('invite_code');
    if (code) return normalizeInviteCode(code);
  } catch {
    // QR Codes gerados no app podem conter apenas o codigo.
  }

  const match = raw.match(/TNE-[A-Z0-9]{4,12}/i) || raw.match(/\b[A-Z]{2,5}-[A-Z0-9]{4,12}\b/i);
  return match ? normalizeInviteCode(match[0]) : normalizeInviteCode(raw);
}

function normalizeInviteCode(value: string) {
  const code = value.trim().toUpperCase();
  return /^[A-Z]{2,5}-[A-Z0-9]{4,12}$/.test(code) ? code : '';
}

function cameraErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return 'Permissao da camera negada. Libere a camera no navegador ou digite o codigo.';
  }
  if (error instanceof DOMException && error.name === 'NotFoundError') {
    return 'Nao encontrei uma camera disponivel neste dispositivo.';
  }
  return 'Nao foi possivel iniciar a leitura do QR Code. Voce ainda pode digitar o codigo.';
}
