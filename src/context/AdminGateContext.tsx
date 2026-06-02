import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminSession } from '../utils/adminSession';
import { AdminPasswordModal } from '../components/AdminPasswordModal';

interface AdminGateContextValue {
  goToAdmin: () => void;
}

const AdminGateContext = createContext<AdminGateContextValue | null>(null);

export function AdminGateProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const goToAdmin = useCallback(() => {
    if (isAdminSession()) {
      navigate('/admin');
      return;
    }
    setModalOpen(true);
  }, [navigate]);

  const handleSuccess = useCallback(() => {
    setModalOpen(false);
    navigate('/admin');
  }, [navigate]);

  const value = useMemo(() => ({ goToAdmin }), [goToAdmin]);

  return (
    <AdminGateContext.Provider value={value}>
      {children}
      {modalOpen && (
        <AdminPasswordModal
          onSuccess={handleSuccess}
          onClose={() => setModalOpen(false)}
        />
      )}
    </AdminGateContext.Provider>
  );
}

export function useAdminGate(): AdminGateContextValue {
  const ctx = useContext(AdminGateContext);
  if (!ctx) throw new Error('useAdminGate must be used within AdminGateProvider');
  return ctx;
}
