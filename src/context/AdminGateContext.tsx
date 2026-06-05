import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscordAuth } from './DiscordAuthContext';
import { AdminLoginRequiredModal } from '../components/auth/AdminLoginRequiredModal';

interface AdminGateContextValue {
  goToAdmin: () => void;
}

const AdminGateContext = createContext<AdminGateContextValue | null>(null);

export function AdminGateProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { isAdmin: discordAdmin } = useDiscordAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const goToAdmin = useCallback(() => {
    if (discordAdmin) {
      navigate('/admin');
      return;
    }
    setModalOpen(true);
  }, [navigate, discordAdmin]);

  const value = useMemo(() => ({ goToAdmin }), [goToAdmin]);

  return (
    <AdminGateContext.Provider value={value}>
      {children}
      {modalOpen && (
        <AdminLoginRequiredModal onClose={() => setModalOpen(false)} />
      )}
    </AdminGateContext.Provider>
  );
}

export function useAdminGate(): AdminGateContextValue {
  const ctx = useContext(AdminGateContext);
  if (!ctx) throw new Error('useAdminGate must be used within AdminGateProvider');
  return ctx;
}
