import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { tasksApi } from '../../api/tasks';
import { areasApi } from '../../api/areas';
import { useAuth } from '../../context/useAuth';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, ADMIN_ROLES, MANAGER_ROLES } from '../../types/enums';
import type { Task, Area } from '../../types';
import {
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineClipboardList,
  HiOutlinePencil,
  HiOutlineSearch,
  HiOutlineClock,
  HiOutlineExclamation,
} from 'react-icons/hi';
import { PageTransition, StaggerList, StaggerItem, FadeIn } from '../../components/ui';
import { SkeletonList, Badge, STATUS_BADGE_VARIANT, PRIORITY_BADGE_VARIANT } from '../../components/ui';
import { TaskStatusSelect } from '../../components/tasks/TaskStatusSelect';

import { taskProgress } from '../../utils';

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `Hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''}`;
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  if (diffDays <= 6) return weekdays[date.getDay()];
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

export function TaskListPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAreaId, setFilterAreaId] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('org');
  const [sortBy, setSortBy] = useState<string>('');
  const [search, setSearch] = useState('');

  const canCreate = true; // all authenticated users can create tasks
  const slug = user?.role.slug;
  const isSuperadmin = slug && ADMIN_ROLES.includes(slug);
  const isManager = slug && MANAGER_ROLES.includes(slug);
  const canEdit = isSuperadmin || isManager;

  useEffect(() => {
    if (isSuperadmin) {
      areasApi.listAll()
        .then((res) => setAreas(Array.isArray(res) ? res : []))
        .catch(() => setAreas([]));
    }
  }, [isSuperadmin]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (filterStatus) params.set('status', filterStatus);
    if (filterAreaId) params.set('area_id', filterAreaId);
    if (filterPriority) params.set('priority', filterPriority);
    if (sortBy) params.set('sort', sortBy);

    const mainFetch = tasksApi.list(params.toString());
    // Superadmin/manager with no area filter: also fetch personal tasks (no area)
    const personalFetch = ((isSuperadmin || isManager) && !filterAreaId)
      ? tasksApi.list('per_page=100')
      : Promise.resolve(null);

    Promise.all([mainFetch, personalFetch])
      .then(([mainRes, personalRes]) => {
        if (cancelled) return;
        let allTasks = mainRes.data;
        if (personalRes) {
          const personalTasks = personalRes.data.filter((t) => !t.area_id && !t.area?.id);
          const existingIds = new Set(allTasks.map((t) => t.id));
          const newPersonal = personalTasks.filter((t) => !existingIds.has(t.id));
          allTasks = [...allTasks, ...newPersonal];
        }
        setTasks(allTasks);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setTasks([]); setLoading(false); } });
    return () => { cancelled = true; };
  }, [filterStatus, filterAreaId, filterPriority, sortBy, isSuperadmin, isManager]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filterType === 'personal') result = result.filter((t) => !t.area_id && !t.area?.id);
    else if (filterType === 'org') result = result.filter((t) => !!(t.area_id || t.area?.id));
    if (!search.trim()) return result;
    const q = search.toLowerCase();
    return result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.current_responsible?.name.toLowerCase().includes(q) ||
        t.area?.name?.toLowerCase().includes(q)
    );
  }, [tasks, search, filterType]);

  const hasActiveFilters = !!filterStatus || !!filterAreaId || !!filterPriority || !!sortBy || !!filterType;

  const clearFilters = () => {
    setFilterStatus('');
    setFilterAreaId('');
    setFilterPriority('');
    setFilterType('');
    setSortBy('');
    setSearch('');
  };

  return (
    <PageTransition>
      {/* Header */}
      <FadeIn className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <HiOutlineClipboardList className="h-7 w-7 text-cyber-radar dark:text-cyber-radar-light" />
            Gestión de tareas
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {isSuperadmin ? 'Crea, asigna y gestiona tareas fácilmente' : isManager ? 'Administra las tareas de tu equipo' : 'Revisa y actualiza tus tareas asignadas'}
          </p>
        </div>
        {canCreate && (
          <Link
            to="/tasks/create"
            className="inline-flex items-center gap-2 rounded-sm bg-cyber-radar px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyber-radar/25 transition-all hover:shadow-xl hover:shadow-cyber-radar/30 active:scale-[0.98]"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Nueva tarea
          </Link>
        )}
      </FadeIn>

      {/* Search + Filters */}
      <FadeIn delay={0.05} className="mb-6 rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-3 sm:p-4 shadow-sm">
        {/* Single flat flex container: full-width search + selects side-by-side on desktop, 2-col grid on mobile */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search — full width on mobile, grows on desktop */}
          <div className="relative w-full sm:min-w-[160px] sm:flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tarea..."
              className="w-full rounded-sm border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 py-2.5 pl-10 pr-4 text-sm transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-cyber-radar focus:bg-white dark:focus:bg-cyber-grafito focus:outline-none focus:ring-2 focus:ring-cyber-radar/20 text-slate-700 dark:text-slate-300"
            />
          </div>
          {/* Selects — 2-per-row on mobile (flex-1 + min-w ~50%), auto width on desktop */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 min-w-[calc(50%-4px)] sm:flex-none sm:min-w-0 sm:w-auto rounded-sm border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:bg-white dark:focus:bg-cyber-grafito focus:outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="">Estado</option>
            {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="flex-1 min-w-[calc(50%-4px)] sm:flex-none sm:min-w-0 sm:w-auto rounded-sm border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:bg-white dark:focus:bg-cyber-grafito focus:outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="">Prioridad</option>
            {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {isSuperadmin && (
            <select
              value={filterAreaId}
              onChange={(e) => { setFilterAreaId(e.target.value); if (e.target.value) setFilterType(''); }}
              className="flex-1 min-w-[calc(50%-4px)] sm:flex-none sm:min-w-0 sm:w-auto rounded-sm border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:bg-white dark:focus:bg-cyber-grafito focus:outline-none text-slate-700 dark:text-slate-300"
            >
              <option value="">Área</option>
              {areas.filter((a) => a.active).map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          )}
          {(isSuperadmin || isManager) && !filterAreaId && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 min-w-[calc(50%-4px)] sm:flex-none sm:min-w-0 sm:w-auto rounded-sm border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:bg-white dark:focus:bg-cyber-grafito focus:outline-none text-slate-700 dark:text-slate-300"
            >
              <option value="">Tipo</option>
              <option value="org">Organización</option>
              <option value="personal">Personales</option>
            </select>
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 min-w-[calc(50%-4px)] sm:flex-none sm:min-w-0 sm:w-auto rounded-sm border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:bg-white dark:focus:bg-cyber-grafito focus:outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="">Más recientes</option>
            <option value="oldest">Más antiguas</option>
            <option value="due_date">Fecha de vencimiento</option>
            <option value="priority">Prioridad</option>
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="w-full sm:w-auto rounded-sm px-3 py-2.5 text-xs font-medium text-cyber-radar dark:text-cyber-radar-light transition-colors hover:bg-cyber-radar/5 dark:hover:bg-cyber-radar/20"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </FadeIn>

      {/* Task list */}
      <AnimatePresence mode="wait">
        {loading ? (
          <SkeletonList count={5} />
        ) : filteredTasks.length === 0 ? (
          /* Empty state */
          <FadeIn className="rounded-sm border-2 border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-cyber-grafito px-6 py-16">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-sm bg-cyber-radar/10 dark:bg-cyber-radar/10">
                <HiOutlineClipboardList className="h-10 w-10 text-cyber-radar-light" />
              </div>
              {tasks.length === 0 && !hasActiveFilters ? (
                <>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Aún no hay tareas</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {canEdit
                      ? 'Empieza creando la primera tarea para tu equipo. Podrás asignar responsables, fechas y hacer seguimiento.'
                      : 'Cuando te asignen tareas, aparecerán aquí. Podrás ver el detalle y reportar tu avance.'}
                  </p>
                  {canCreate && (
                    <Link
                      to="/tasks/create"
                      className="mt-6 inline-flex items-center gap-2 rounded-sm bg-cyber-radar px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyber-radar/25 transition-all hover:shadow-xl hover:shadow-cyber-radar/30 active:scale-[0.98]"
                    >
                      <HiOutlinePlus className="h-4 w-4" /> Crear primera tarea
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sin resultados</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No se encontraron tareas con los filtros actuales.</p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 rounded-sm bg-white dark:bg-cyber-grafito border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    Limpiar filtros
                  </button>
                </>
              )}
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0.1} className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito shadow-sm">
            {/* List header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 px-4 py-3 sm:px-6">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {filteredTasks.length} tarea{filteredTasks.length !== 1 ? 's' : ''}
                {search && ` para "${search}"`}
              </p>
            </div>
            {/* Rows */}
            <StaggerList className="divide-y divide-slate-50 dark:divide-white/5">
              {filteredTasks.map((task) => (
                <StaggerItem key={task.id}>
                  <div className="group flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-cyber-radar/5 dark:hover:bg-cyber-radar/20 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
                    {/* Left: info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link to={`/tasks/${task.id}`} className="truncate text-sm font-medium text-slate-900 dark:text-white transition-colors group-hover:text-cyber-radar dark:group-hover:text-cyber-radar-light">
                          {task.title}
                        </Link>
                        {task.is_overdue && (
                          <span className="flex shrink-0 items-center gap-0.5 rounded-md bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800">
                            <HiOutlineExclamation className="h-3 w-3" /> Vencida
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        {task.current_responsible && (
                          <span className="flex items-center gap-1">
                            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-200 dark:bg-white/10 text-[9px] font-semibold text-slate-600 dark:text-slate-400">
                              {task.current_responsible.name.charAt(0)}
                            </span>
                            {task.current_responsible.name}
                          </span>
                        )}
                        {task.due_date && (
                          <span className={`flex items-center gap-1 ${task.is_overdue ? 'font-medium text-red-600 dark:text-red-400' : ''}`}>
                            <HiOutlineClock className="h-3.5 w-3.5" />
                            {formatRelativeDate(task.due_date)}
                          </span>
                        )}
                        {(task.area?.name || task.assigned_area?.name) && (
                          <span>{task.area?.name ?? task.assigned_area?.name}</span>
                        )}
                      </div>
                      {/* Progress + badges row */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant={STATUS_BADGE_VARIANT[task.status]} size="sm">
                          {TASK_STATUS_LABELS[task.status]}
                        </Badge>
                        <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]} size="sm">
                          {TASK_PRIORITY_LABELS[task.priority]}
                        </Badge>
{(() => {
                          const pct = taskProgress(task);
                          return pct > 0 ? (
                            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                              <div className="h-1.5 w-16 rounded-full bg-slate-200 dark:bg-white/10">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    pct >= 100 ? 'bg-green-500' : pct >= 75 ? 'bg-purple-500' : pct >= 50 ? 'bg-cyber-radar' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="font-medium">{pct}%</span>
                            </span>
                          ) : null;
                        })()}
                        {task.requires_attachment && (
                          <span className="rounded-md bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">Adjunto obligatorio</span>
                        )}
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <TaskStatusSelect
                        task={task}
                        userId={user?.id}
                        userRole={user?.role.slug}
                        onUpdated={(updated) =>
                          setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
                        }
                      />
                      <Link
                        to={`/tasks/${task.id}`}
                        className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-cyber-grafito border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 transition-all hover:border-cyber-radar/20 hover:bg-cyber-radar/5 dark:hover:bg-cyber-radar/20 hover:text-cyber-radar"
                      >
                        <HiOutlineEye className="h-3.5 w-3.5" />
                        Ver
                      </Link>
                      {canEdit && (
                        <Link
                          to={`/tasks/${task.id}?edit=1`}
                          className="flex items-center gap-1.5 rounded-lg bg-cyber-radar px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-cyber-radar-light active:scale-[0.97]"
                        >
                          <HiOutlinePencil className="h-3.5 w-3.5" />
                          Editar
                        </Link>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerList>
          </FadeIn>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
