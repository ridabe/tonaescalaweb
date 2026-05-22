import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Concluindo acesso com Google...');

  useEffect(() => {
    async function finishLogin() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const errorDescription =
        url.searchParams.get('error_description') ||
        new URLSearchParams(window.location.hash.replace(/^#/, '')).get('error_description');

      if (errorDescription) {
        setMessage(errorDescription);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(error.message);
          return;
        }
      } else {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setMessage('Nao foi possivel concluir o acesso. Tente entrar novamente.');
          return;
        }
      }

      window.history.replaceState({}, document.title, '/auth/callback');
      navigate('/app/eventos', { replace: true });
    }

    finishLogin().catch((error) => {
      setMessage(error instanceof Error ? error.message : 'Nao foi possivel concluir o acesso.');
    });
  }, [navigate]);

  return <div className="splash">{message}</div>;
}
