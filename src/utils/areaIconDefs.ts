import type { ComponentType } from 'react';
import {
  HiOutlineOfficeBuilding, HiOutlineBriefcase, HiOutlineHome, HiOutlineFlag, HiOutlineStar,
  HiOutlineUsers, HiOutlineUserGroup, HiOutlineAcademicCap, HiOutlineHeart, HiOutlineSupport,
  HiOutlineDesktopComputer, HiOutlineCode, HiOutlineTerminal, HiOutlineCog, HiOutlineServer,
  HiOutlineDatabase, HiOutlineChip, HiOutlineLightningBolt,
  HiOutlineCurrencyDollar, HiOutlineTrendingUp, HiOutlineChartBar, HiOutlineScale,
  HiOutlineClipboardList, HiOutlineCube, HiOutlineTruck, HiOutlineArchive,
  HiOutlineCalendar, HiOutlineDocumentText,
  HiOutlineMail, HiOutlineChatAlt, HiOutlineSpeakerphone,
  HiOutlinePencil, HiOutlineLightBulb, HiOutlineCamera, HiOutlineColorSwatch,
  HiOutlineShieldCheck, HiOutlineLockClosed,
  HiOutlineBeaker, HiOutlineFire, HiOutlineMap, HiOutlineGlobeAlt,
  HiOutlineCollection, HiOutlineGift, HiOutlineNewspaper, HiOutlineMicrophone, HiOutlineViewGrid,
} from 'react-icons/hi';

export interface AreaIconDef {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export const AREA_ICONS: AreaIconDef[] = [
  { key: 'office',      label: 'Oficina',       icon: HiOutlineOfficeBuilding },
  { key: 'briefcase',   label: 'Negocios',      icon: HiOutlineBriefcase },
  { key: 'home',        label: 'General',        icon: HiOutlineHome },
  { key: 'flag',        label: 'Proyecto',       icon: HiOutlineFlag },
  { key: 'star',        label: 'Premium',        icon: HiOutlineStar },
  { key: 'users',       label: 'Usuarios',       icon: HiOutlineUsers },
  { key: 'user_group',  label: 'Equipo',         icon: HiOutlineUserGroup },
  { key: 'academic',    label: 'Capacitación',   icon: HiOutlineAcademicCap },
  { key: 'heart',       label: 'Bienestar',      icon: HiOutlineHeart },
  { key: 'support',     label: 'Servicio',       icon: HiOutlineSupport },
  { key: 'desktop',     label: 'Tecnología',     icon: HiOutlineDesktopComputer },
  { key: 'code',        label: 'Desarrollo',     icon: HiOutlineCode },
  { key: 'terminal',    label: 'DevOps',         icon: HiOutlineTerminal },
  { key: 'cog',         label: 'Config.',        icon: HiOutlineCog },
  { key: 'server',      label: 'Servidores',     icon: HiOutlineServer },
  { key: 'database',    label: 'Datos',          icon: HiOutlineDatabase },
  { key: 'chip',        label: 'Hardware',       icon: HiOutlineChip },
  { key: 'lightning',   label: 'Automatiz.',     icon: HiOutlineLightningBolt },
  { key: 'dollar',      label: 'Finanzas',       icon: HiOutlineCurrencyDollar },
  { key: 'trending',    label: 'Métricas',       icon: HiOutlineTrendingUp },
  { key: 'chart',       label: 'Reportes',       icon: HiOutlineChartBar },
  { key: 'scale',       label: 'Legal',          icon: HiOutlineScale },
  { key: 'clipboard',   label: 'Operaciones',    icon: HiOutlineClipboardList },
  { key: 'cube',        label: 'Productos',      icon: HiOutlineCube },
  { key: 'truck',       label: 'Logística',      icon: HiOutlineTruck },
  { key: 'archive',     label: 'Archivo',        icon: HiOutlineArchive },
  { key: 'calendar',    label: 'Agenda',         icon: HiOutlineCalendar },
  { key: 'document',    label: 'Documentos',     icon: HiOutlineDocumentText },
  { key: 'mail',        label: 'Correo',         icon: HiOutlineMail },
  { key: 'chat',        label: 'Atención',       icon: HiOutlineChatAlt },
  { key: 'speaker',     label: 'Marketing',      icon: HiOutlineSpeakerphone },
  { key: 'pencil',      label: 'Diseño',         icon: HiOutlinePencil },
  { key: 'lightbulb',   label: 'Innovación',     icon: HiOutlineLightBulb },
  { key: 'camera',      label: 'Medios',         icon: HiOutlineCamera },
  { key: 'color',       label: 'Creativo',       icon: HiOutlineColorSwatch },
  { key: 'shield',      label: 'Seguridad',      icon: HiOutlineShieldCheck },
  { key: 'lock',        label: 'Privacidad',     icon: HiOutlineLockClosed },
  { key: 'beaker',      label: 'I+D',            icon: HiOutlineBeaker },
  { key: 'fire',        label: 'Prioridad',      icon: HiOutlineFire },
  { key: 'map',         label: 'Planificación',  icon: HiOutlineMap },
  { key: 'globe',       label: 'Internacional',  icon: HiOutlineGlobeAlt },
  { key: 'collection',  label: 'Servicio',       icon: HiOutlineCollection },
  { key: 'gift',        label: 'Eventos',        icon: HiOutlineGift },
  { key: 'newspaper',   label: 'Prensa',         icon: HiOutlineNewspaper },
  { key: 'microphone',  label: 'Presentación',   icon: HiOutlineMicrophone },
  { key: 'view_grid',   label: 'Múltiple',       icon: HiOutlineViewGrid },
];

export const DEFAULT_ICON_KEY = 'office';

export function getIconDef(key: string | null | undefined): AreaIconDef {
  return AREA_ICONS.find((i) => i.key === key) ?? AREA_ICONS[0];
}
