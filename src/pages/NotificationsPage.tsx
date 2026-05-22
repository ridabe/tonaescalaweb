import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchNotifications } from '../lib/api';
import type { AdminNotification } from '../lib/types';

export function NotificationsPage() {
  const [items, setItems] = useState<AdminNotification[]>([]);

  useEffect(() => {
    fetchNotifications().then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <div className="page narrow">
      <header className="page-header">
        <div>
          <span className="eyebrow">Atualizacoes</span>
          <h1>Notificacoes</h1>
        </div>
      </header>
      {items.length === 0 ? (
        <div className="empty-state"><Bell size={42} /><h2>Nenhuma notificacao</h2><p>Aceites e recusas de convidados aparecem aqui.</p></div>
      ) : (
        <div className="assignment-list">
          {items.map((item) => (
            <article className="card notification-card" key={item.id}>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
              <small>{new Date(item.created_at).toLocaleString('pt-BR')}</small>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
