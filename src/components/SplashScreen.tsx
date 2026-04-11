// ─────────────────────────────────────────────────────────────
//  AMML — Splash Screen (auto-transitions to login after 2.8s)
// ─────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

interface Props { onDone?: () => void; }

export function SplashScreen({ onDone }: Props) {
  const { dispatch } = useApp();
  useEffect(() => {
    const t = setTimeout(() => {
      dispatch({ type: 'GO_TO_LOGIN' });
      onDone?.();
    }, 2800);
    return () => clearTimeout(t);
  }, [dispatch, onDone]);

  return (
    <div id="splash">
      <div className="splash-logo-wrap">
        <img src="/images/ammllogo.png" alt="AMML" className="splash-logo" />
      </div>
      <div className="splash-tagline">Abuja Markets Management Limited</div>
      <div className="splash-bar"><div className="splash-bar-fill" /></div>
    </div>
  );
}
