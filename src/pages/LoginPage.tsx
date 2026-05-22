import type { Session } from '@supabase/supabase-js';
import type { IScannerControls } from '@zxing/browser';
import { CalendarCheck2, ChevronLeft, ChevronRight, KeyRound, Mail, QrCode, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { getGuestEvents, signIn, signInWithGoogle, signUp } from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';

export function LoginPage({ session }: { session: Session | null }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [inviteCode, setInviteCode] = useState(params.get('code') ?? '');
  const [guestEmail, setGuestEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminMode, setAdminMode] = useState<'login' | 'signup'>('login');
  const [adminOpen, setAdminOpen] = useState(false);
  const [error, setError] = useState('');
  const [busyGuest, setBusyGuest] = useState(false);
  const [busyAdmin, setBusyAdmin] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMessage, setScannerMessage] = useState('');
  const [scannerError, setScannerError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerControls = useRef<IScannerControls | null>(null);

  const slides = useMemo(
    () => ([
      {
        src: '/img/tonaescala-banner-1600x900.png',
        title: 'Organize seus eventos com clareza',
        description: 'Centralize informacoes, equipe e horarios em um so lugar.',
        fit: 'cover' as const,
      },
      {
        src: '/img/telas%20sistema.png',
        title: 'Tudo o que voce precisa, na tela certa',
        description: 'Uma visao direta para planejar, acompanhar e ajustar a escala.',
        fit: 'contain' as const,
      },
      {
        src: '/img/tonaescala-banner.png',
        title: 'Convites que chegam rapido',
        description: 'Compartilhe por link ou QR Code e facilite o acesso ao evento.',
        fit: 'cover' as const,
      },
      {
        src: '/img/tonaescala-logo-horizontal.png',
        title: 'Menos troca de mensagens, mais confirmacoes',
        description: 'Deixe as respostas organizadas e tenha previsibilidade no dia.',
        fit: 'contain' as const,
      },
      {
        src: '/img/tonaescala-icon-1024.png',
        title: 'Acompanhe quem confirmou em segundos',
        description: 'Visualize o status da escala e reaja rapido a mudancas.',
        fit: 'contain' as const,
      },
      {
        src: '/img/tonaescala-icon-source.png',
        title: 'Escalas organizadas para servir melhor',
        description: 'Mais organizacao, menos imprevistos, mais foco no essencial.',
        fit: 'contain' as const,
      },
    ]),
    [],
  );

  const [slideIndex, setSlideIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const carouselScrollLock = useRef(false);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const reduceMotion = useMemo(() => {
    if (!window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;
    const target = container.querySelector<HTMLElement>(`[data-slide-index="${slideIndex}"]`);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [slideIndex]);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      if (carouselScrollLock.current) return;
      if (carouselPaused) return;
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6400);
    return () => window.clearInterval(id);
  }, [carouselPaused, reduceMotion, slides.length]);

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
    setBusyAdmin(true);
    setError('');
    try {
      if (adminMode === 'login') await signIn(adminEmail.trim(), adminPassword);
      else await signUp(adminEmail.trim(), adminPassword);
      navigate('/app/eventos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel entrar.');
    } finally {
      setBusyAdmin(false);
    }
  }

  async function handleGuestSubmit(event: FormEvent) {
    event.preventDefault();
    setBusyGuest(true);
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
      setBusyGuest(false);
    }
  }

  return (
    <div className="entry-screen">
      <section className="entry-panel">
        <header className="entry-header">
          <div className="entry-brand-inline">
            <img src="/img/tonaescala-logo-horizontal.png" alt="ToNaEscala" />
            <span>Escalas organizadas para pessoas que servem juntas.</span>
          </div>
          <Button variant="secondary" onClick={() => setAdminOpen(true)} disabled={scannerOpen}>
            Área admin
          </Button>
        </header>

        <section
          className="carousel"
          aria-label="Apresentacao do ToNaEscala"
          onPointerDown={() => {
            carouselScrollLock.current = true;
            window.setTimeout(() => {
              carouselScrollLock.current = false;
            }, 9000);
          }}
          onMouseEnter={() => setCarouselPaused(true)}
          onMouseLeave={() => setCarouselPaused(false)}
          onFocusCapture={() => setCarouselPaused(true)}
          onBlurCapture={() => setCarouselPaused(false)}
        >
          <div className="carousel-track" ref={carouselRef}>
            {slides.map((slide, index) => (
              <article
                className="carousel-slide"
                key={slide.src}
                data-slide-index={index}
                aria-hidden={index === slideIndex ? 'false' : 'true'}
              >
                <div className="carousel-media">
                  <img
                    className={slide.fit === 'contain' ? 'carousel-image contain' : 'carousel-image cover'}
                    src={slide.src}
                    alt={slide.title}
                    loading="lazy"
                  />
                </div>
                <div className="carousel-caption">
                  <strong>{slide.title}</strong>
                  <span>{slide.description}</span>
                </div>
              </article>
            ))}
          </div>
          <div className="carousel-controls">
            <button
              className="icon-button carousel-nav"
              type="button"
              aria-label="Slide anterior"
              onClick={() => setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="carousel-dots" role="tablist" aria-label="Selecionar slide">
              {slides.map((_slide, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === slideIndex ? 'carousel-dot active' : 'carousel-dot'}
                  aria-label={`Ir para o slide ${index + 1}`}
                  aria-selected={index === slideIndex}
                  role="tab"
                  onClick={() => setSlideIndex(index)}
                />
              ))}
            </div>
            <button
              className="icon-button carousel-nav"
              type="button"
              aria-label="Proximo slide"
              onClick={() => setSlideIndex((prev) => (prev + 1) % slides.length)}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </section>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {!isSupabaseConfigured ? (
          <div className="alert alert-danger">
            Configure o arquivo .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY para conectar ao banco.
          </div>
        ) : null}

        <div className="entry-grid single">
          <form className="card form-card" onSubmit={handleGuestSubmit}>
            <div className="card-title">
              <KeyRound size={22} />
              <div>
                <h1>Acessar escala</h1>
                <span>Entre como convidado pelo codigo do evento e seu email.</span>
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
            <Button disabled={busyGuest} variant="accent">Ver minha escala</Button>
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

      {adminOpen ? (
        <div className="modal-backdrop">
          <section className="card modal-sheet admin-sheet" aria-label="Área admin">
            <div className="section-head">
              <div className="card-title">
                <CalendarCheck2 size={22} />
                <div>
                  <h2>Área admin</h2>
                  <span>Organizador: crie eventos, equipes e escalas.</span>
                </div>
              </div>
              <button className="icon-button" type="button" onClick={() => setAdminOpen(false)} aria-label="Fechar área admin">
                <X size={20} />
              </button>
            </div>
            <form className="form-card" onSubmit={handleOrganizerSubmit}>
              <Field label="Email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
              <Field label="Senha" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
              <Button disabled={busyAdmin} icon={<Mail size={18} />}>{adminMode === 'login' ? 'Entrar' : 'Criar conta'}</Button>
              <Button type="button" variant="secondary" onClick={() => signInWithGoogle()} disabled={busyAdmin}>
                Entrar com Google
              </Button>
              <button
                className="text-button"
                type="button"
                onClick={() => setAdminMode(adminMode === 'login' ? 'signup' : 'login')}
                disabled={busyAdmin}
              >
                {adminMode === 'login' ? 'Criar uma conta' : 'Ja tenho conta'}
              </button>
            </form>
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
