import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCargandoSesion(false);
    });

    const { data: suscripcion } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSession(nuevaSesion);
    });

    return () => suscripcion.subscription.unsubscribe();
  }, []);

  if (cargandoSesion) {
    return <div className="pantalla-carga">Cargando…</div>;
  }

  if (!session) {
    return <Login />;
  }

  return <Dashboard usuarioEmail={session.user.email ?? ''} />;
}
