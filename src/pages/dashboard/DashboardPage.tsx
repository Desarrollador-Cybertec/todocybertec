import { useAuth } from '../../context/useAuth';
import { ADMIN_ROLES, MANAGER_ROLES, type RoleType } from '../../types/enums';
import { PageTransition } from '../../components/ui';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { ManagerDashboardView } from './ManagerDashboardView';
import { PersonalDashboardView } from './PersonalDashboardView';

function DashboardContent({ slug }: { slug?: string }) {
  if (slug && ADMIN_ROLES.includes(slug as RoleType)) return <SuperAdminDashboard />;
  if (slug && MANAGER_ROLES.includes(slug as RoleType)) return <ManagerDashboardView />;
  return <PersonalDashboardView />;
}

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <PageTransition>
      <DashboardContent slug={user?.role.slug} />
    </PageTransition>
  );
}
