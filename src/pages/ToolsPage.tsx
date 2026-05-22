import { BarChart3, BookUser, Music } from 'lucide-react';
import { Link } from 'react-router-dom';

const tools = [
  {
    icon: Music,
    label: 'Repertorio',
    description: 'Gerencie o catalogo de musicas da sua organizacao.',
    href: '/app/ferramentas/repertorio',
    tone: 'primary',
  },
  {
    icon: BookUser,
    label: 'Escalados',
    description: 'Pessoas salvas para escalar rapidamente.',
    href: '/app/ferramentas/escalados',
    tone: 'accent',
  },
  {
    icon: BarChart3,
    label: 'Dashboard',
    description: 'Metricas mensais dos eventos e respostas.',
    href: '/app/ferramentas/dashboard',
    tone: 'info',
  },
];

export function ToolsPage() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Recursos</span>
          <h1>Ferramentas</h1>
        </div>
      </header>

      <div className="tools-grid">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link to={tool.href} className={`tool-card tool-${tool.tone}`} key={tool.label}>
              <span className="tool-icon"><Icon size={28} /></span>
              <strong>{tool.label}</strong>
              <p>{tool.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
