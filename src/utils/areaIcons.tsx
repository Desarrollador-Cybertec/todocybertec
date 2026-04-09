import { getIconDef } from './areaIconDefs';

export function AreaIconDisplay({ iconKey, className = 'h-5 w-5' }: { iconKey: string | null | undefined; className?: string }) {
  const def = getIconDef(iconKey);
  const Icon = def.icon;
  return <Icon className={className} />;
}


