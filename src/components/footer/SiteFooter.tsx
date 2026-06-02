import { useAdminGate } from '../../context/AdminGateContext';

export function SiteFooter() {
  const { goToAdmin } = useAdminGate();

  return (
    <footer className="site-footer">
      <p>© 2026 아빠안잔다. All rights reserved.</p>
      <button type="button" className="footer-admin-link" onClick={goToAdmin}>
        관리자
      </button>
    </footer>
  );
}
