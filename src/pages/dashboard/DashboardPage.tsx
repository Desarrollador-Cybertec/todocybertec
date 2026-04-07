import { useAuth } from '../../context/useAuth';
import { ADMIN_ROLES, MANAGER_ROLES } from '../../types/enums';
import { PageTransition } from '../../components/ui';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { ManagerDashboardView } from './ManagerDashboardView';
import { PersonalDashboardView } from './PersonalDashboardView';

export function DashboardPage() {
  const { user } = useAuth();

  const renderDashboard = () => {
    const slug = user?.role.slug;
    if (slug && ADMIN_ROLES.includes(slug)) return <SuperAdminDashboard />;
    if (slug && MANAGER_ROLES.includes(slug)) return <ManagerDashboardView />;
    return <PersonalDashboardView />;
  };

  return (
    <PageTransition>
      {renderDashboard()}
    </PageTransition>
  );
}
