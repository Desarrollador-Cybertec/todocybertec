import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/useAuth';
import { Role, ROLE_LABELS, ADMIN_ROLES, MANAGER_ROLES } from '../../types/enums';
import { areasApi } from '../../api/areas';
import { LicenseBanner } from '../ui/LicenseBanner';
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineChartBar,
} from 'react-icons/hi';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <HiOutlineHome className="h-6 w-6" />,
  },
  {
    label: 'Tareas',
    path: '/tasks',
    icon: <HiOutlineClipboardList className="h-6 w-6" />,
  },
  {
    label: 'Áreas',
    path: '/areas',
    icon: <HiOutlineUserGroup className="h-6 w-6" />,
    roles: [...ADMIN_ROLES],
  },
  {
    label: 'Mi equipo',
    path: '/claim-workers',
    icon: <HiOutlineUserGroup className="h-6 w-6" />,
    roles: [...MANAGER_ROLES],
  },
  {
    label: 'Reuniones',
    path: '/meetings',
    icon: <HiOutlineCalendar className="h-6 w-6" />,
    roles: [...ADMIN_ROLES, ...MANAGER_ROLES],
  },
  {
    label: 'Usuarios',
    path: '/users',
    icon: <HiOutlineUsers className="h-6 w-6" />,
    roles: [...ADMIN_ROLES],
  },
  {
    label: 'Consolidado',
    path: '/consolidated',
    icon: <HiOutlineChartBar className="h-6 w-6" />,
    roles: [...ADMIN_ROLES],
  },
  {
    label: 'Configuración',
    path: '/settings',
    icon: <HiOutlineCog className="h-6 w-6" />,
    roles: [Role.SUPERADMIN],
  },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [areaName, setAreaName] = useState<string | null>(null);

  useEffect(() => {
    const areaId = user?.area_id;
    if (areaId) {
      areasApi.get(areaId).then((area) => setAreaName(area.name)).catch(() => setAreaName(null));
    } else if (user?.role.slug && MANAGER_ROLES.includes(user.role.slug) && user?.id) {
      // Managers may not have area_id set — scan the list
      const uid = Number(user.id);
      areasApi.listAll()
        .then((areas) => {
          const found = areas.find(
            (a) =>
              Number(a.manager_user_id) === uid ||
              (a.manager?.id != null && Number(a.manager.id) === uid),
          );
          setAreaName(found?.name ?? null);
        })
        .catch(() => setAreaName(null));
    }
  }, [user?.area_id, user?.id, user?.role.slug]);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role.slug)),
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-cyber-deep">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — Command Navy (light) / Grafito (dark) */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-cyber-navy dark:bg-cyber-grafito transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="relative border-b border-white/10 px-4 py-4">
          <div className="rounded-xl bg-[#1a2a5e] px-4 py-4 ring-1 ring-cyan-400/20 shadow-lg shadow-cyan-500/10 flex flex-col items-center gap-0">
            <img src="/magnotipo.png" alt="S!NTyC" className="h-16 w-auto drop-shadow-[0_2px_12px_rgba(27,198,208,0.6)]" />
            <span className="-mt-3 ml-16 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">by cybertec</span>
          </div>
          <button
            type="button"
            className="absolute right-3 top-3 rounded p-1.5 text-white/40 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <HiOutlineX className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {visibleItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-cyber-radar text-white shadow-lg shadow-cyber-radar/20'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`transition-colors ${active ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile + logout */}
        <div className="border-t border-white/10 p-4 space-y-3">
            <NavLink
              to="/profile"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-sm px-3 py-2.5 transition-colors ${
                  isActive ? 'bg-cyber-radar/20 ring-1 ring-cyber-radar/30' : 'bg-white/5 hover:bg-white/10'
                }`
              }
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-cyber-radar text-sm font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user?.name}</p>
                <p className="text-[10px] uppercase tracking-tighter text-white/40">
                  {user?.role && ROLE_LABELS[user.role.slug]}
                </p>
                {areaName && (
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-medium text-cyber-radar">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyber-radar" />
                    {areaName}
                  </p>
                )}
              </div>
            </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-sm px-3 py-0.5 text-sm font-medium text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <HiOutlineLogout className="h-6 w-6" />
            Cerrar sesión
          </button>
          <div className="-mt-4 flex items-center justify-center gap-2">
            <p className="text-[9px] uppercase tracking-widest text-white/25">Powered by</p>
            <img src="/hero-logo.png" alt="Cybertec" className="h-15 w-auto opacity-30" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-10 flex h-12 items-center border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-cyber-grafito/80 px-6 backdrop-blur-md lg:hidden lg:px-8">
          <button
            type="button"
            className="rounded p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-slate-300"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <HiOutlineMenu className="h-6 w-6" />
          </button>
        </header>

        <LicenseBanner />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-6 lg:p-8 max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
