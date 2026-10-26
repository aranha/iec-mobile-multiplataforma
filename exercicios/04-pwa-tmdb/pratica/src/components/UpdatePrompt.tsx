// src/components/UpdatePrompt.tsx

import { useRegisterSW } from 'virtual:pwa-register/react';
import { styles } from './UpdatePrompt.styles';

export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (needRefresh) {
    return (
      <div role="alert" style={styles.toast}>
        <span style={styles.msg}>Nova versão disponível</span>
        <button onClick={() => updateServiceWorker(true)} style={styles.primary}>
          Atualizar
        </button>
        <button onClick={() => setNeedRefresh(false)} style={styles.btn}>
          Depois
        </button>
      </div>
    );
  }

  if (offlineReady) {
    return (
      <div role="status" style={styles.toast}>
        <span style={styles.msg}>App pronto para uso offline</span>
        <button onClick={() => setOfflineReady(false)} style={styles.primary}>
          OK
        </button>
      </div>
    );
  }

  return null;
}
