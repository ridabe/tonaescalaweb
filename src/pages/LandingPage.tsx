import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  Gauge,
  Globe2,
  Mail,
  Music2,
  Play,
  QrCode,
  Search,
  Smartphone,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';

const flowSteps = [
  {
    number: '01',
    title: 'Crie o evento',
    text: 'Defina data, horario, local, equipes e detalhes importantes em poucos cliques.',
    icon: <CalendarCheck2 size={22} />,
  },
  {
    number: '02',
    title: 'Monte a escala',
    text: 'Adicione pessoas, organize funcoes, horarios de chegada e observacoes de cada area.',
    icon: <UsersRound size={22} />,
  },
  {
    number: '03',
    title: 'Envie o acesso',
    text: 'Compartilhe por QR Code, link, codigo do evento ou email para todos com cadastro na escala.',
    icon: <QrCode size={22} />,
  },
  {
    number: '04',
    title: 'Acompanhe respostas',
    text: 'Veja quem aceitou, quem recusou e o que ainda precisa de atencao antes do evento.',
    icon: <BarChart3 size={22} />,
  },
];

const toolCards = [
  {
    title: 'Repertorio inteligente',
    text: 'Busque musicas, artistas e letras usando a integracao com Cifras para montar o repertorio sem sair do fluxo.',
    icon: <Music2 size={24} />,
    tone: 'tool-primary',
  },
  {
    title: 'Cadastro de escalados',
    text: 'Salve pessoas frequentes com email, telefone e funcao padrao para montar proximas escalas mais rapido.',
    icon: <UsersRound size={24} />,
    tone: 'tool-info',
  },
  {
    title: 'Afinador no app',
    text: 'O app mobile tambem tera afinador para apoiar a preparacao musical direto no celular.',
    icon: <Gauge size={24} />,
    tone: 'tool-accent',
  },
];

const manualItems = [
  'Organizador cria evento e equipes',
  'Escalados recebem codigo, QR Code, link ou email',
  'Cada pessoa acessa pelo navegador e responde',
  'Dashboard mostra pendencias e respostas',
];

export function LandingPage() {
  const [params] = useSearchParams();
  const code = params.get('code') || params.get('invite_code');

  if (code) return <Navigate to={`/entrar?code=${encodeURIComponent(code)}`} replace />;

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Link to="/" className="landing-logo" aria-label="ToNaEscala">
          <img src="/img/tonaescala-logo-horizontal.png" alt="ToNaEscala" />
        </Link>
        <nav>
          <a href="#manual">Manual</a>
          <a href="#ferramentas">Ferramentas</a>
          <a href="#acesso">Acesso</a>
          <Link to="/entrar" className="landing-nav-button">Entrar</Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-kicker"><Sparkles size={16} /> Escalas sem confusao</span>
            <h1>Organize eventos, equipes e respostas em um fluxo leve de verdade.</h1>
            <p>
              O ToNaEscala junta agenda, escala, repertorio, QR Code e acompanhamento em uma experiencia simples para quem organiza e para quem participa.
            </p>
            <div className="landing-actions">
              <Link to="/entrar" className="landing-primary">
                Acessar pelo navegador <ArrowRight size={18} />
              </Link>
              <a href="#manual" className="landing-secondary">
                Ver como funciona <Play size={17} />
              </a>
            </div>
            <div className="landing-availability" id="acesso">
              <span><Globe2 size={17} /> Disponivel pelo navegador</span>
              <span><Smartphone size={17} /> Em breve na Play Store</span>
            </div>
          </div>

          <div className="landing-hero-visual" aria-label="Previa visual do ToNaEscala">
            <img src="/img/telas sistema.png" alt="Telas do aplicativo ToNaEscala" />
            <div className="floating-flow-card floating-flow-card-one">
              <CheckCircle2 size={18} />
              <span>12 respostas recebidas</span>
            </div>
            <div className="floating-flow-card floating-flow-card-two">
              <Mail size={18} />
              <span>Email da escala enviado</span>
            </div>
          </div>
        </section>

        <section className="landing-band">
          <div className="landing-band-inner">
            <strong>Do culto ao ensaio, do repertorio ao status de cada pessoa.</strong>
            <span>Um manual vivo para repetir o processo sem depender de planilhas soltas.</span>
          </div>
        </section>

        <section className="landing-section landing-manual" id="manual">
          <div className="landing-section-head">
            <span className="landing-kicker">Manual rapido</span>
            <h2>O fluxo que guia sua escala do inicio ao fim</h2>
            <p>Cada etapa foi pensada para reduzir mensagens perdidas, confirmar presencas com clareza e manter todo mundo olhando para a mesma informacao.</p>
          </div>
          <div className="flow-grid">
            {flowSteps.map((step) => (
              <article className="flow-card" key={step.number}>
                <span>{step.number}</span>
                <div>{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section split-showcase">
          <div className="browser-demo">
            <div className="browser-top"><span /><span /><span /></div>
            <div className="browser-content">
              <div className="demo-sidebar">
                <strong>ToNaEscala</strong>
                <span>Eventos</span>
                <span>Escala</span>
                <span>Repertorio</span>
              </div>
              <div className="demo-main">
                <div className="demo-main-head">
                  <div>
                    <small>Proximo evento</small>
                    <strong>Culto de Domingo</strong>
                  </div>
                  <button>Enviar emails</button>
                </div>
                <div className="demo-bars">
                  <span style={{ width: '82%' }} />
                  <span style={{ width: '64%' }} />
                  <span style={{ width: '38%' }} />
                </div>
                <div className="demo-people">
                  <span>Aceitos</span>
                  <span>Pendentes</span>
                  <span>Repertorio</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <span className="landing-kicker">Controle visual</span>
            <h2>Dashboard para agir antes do dia chegar</h2>
            <p>
              Veja respostas, pendencias, recusas e volume de escalados por evento. A ideia e simples: menos adivinhacao, mais decisao.
            </p>
            <ul className="landing-checklist">
              {manualItems.map((item) => <li key={item}><CheckCircle2 size={18} />{item}</li>)}
            </ul>
          </div>
        </section>

        <section className="landing-section tools-showcase" id="ferramentas">
          <div className="landing-section-head">
            <span className="landing-kicker">Ferramentas</span>
            <h2>Tudo que ajuda a escala sair redonda</h2>
            <p>Do cadastro das pessoas ao repertorio, o ToNaEscala foi pensado para funcionar como central de preparacao do evento.</p>
          </div>
          <div className="landing-tools-grid">
            {toolCards.map((tool) => (
              <article className={`landing-tool-card ${tool.tone}`} key={tool.title}>
                <div>{tool.icon}</div>
                <h3>{tool.title}</h3>
                <p>{tool.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section search-demo-section">
          <div>
            <span className="landing-kicker">Repertorio conectado</span>
            <h2>Adicione musicas direto do Cifras</h2>
            <p>
              Pesquise por musica ou artista, importe os dados encontrados e deixe o repertorio pronto para o evento. Menos copiar e colar, mais tempo para preparar.
            </p>
          </div>
          <div className="music-demo-card">
            <div className="music-search-line"><Search size={18} /><span>Buscar: Grande e o Senhor</span></div>
            <div className="music-result-line">
              <Music2 size={20} />
              <div><strong>Musica encontrada</strong><span>Tom, artista, letra e links organizados</span></div>
            </div>
            <div className="music-wave"><span /><span /><span /><span /><span /></div>
          </div>
        </section>

        <section className="landing-final">
          <img src="/img/tonaescala-icon-1024.png" alt="Icone ToNaEscala" />
          <div>
            <span className="landing-kicker">Agora no web</span>
            <h2>Entre pelo navegador hoje. Baixe o app em breve.</h2>
            <p>O acesso web atende quem nao quer instalar nada. O app mobile chega em breve na Play Store para levar a experiencia completa para o celular.</p>
          </div>
          <Link to="/entrar" className="landing-primary">Comecar agora <ArrowRight size={18} /></Link>
        </section>
      </main>
    </div>
  );
}
