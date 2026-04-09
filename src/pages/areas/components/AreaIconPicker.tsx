import { useState, useRef, useEffect, useCallback } from 'react';
import { AREA_ICONS } from '../../../utils/areaIconDefs';
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';

interface Props {
  value: string;
  onChange: (key: string) => void;
  label?: string;
}

export function AreaIconPicker({ value, onChange, label = 'Icono del área' }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const focusSearch = useCallback(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  useEffect(focusSearch, [focusSearch]);

  const current = AREA_ICONS.find((i) => i.key === value) ?? AREA_ICONS[0];
  const Icon = current.icon;

  const filtered = search
    ? AREA_ICONS.filter((i) => i.label.toLowerCase().includes(search.toLowerCase()))
    : AREA_ICONS;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {label && (
        <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-sm border border-slate-300 dark:border-white/10 bg-white dark:bg-cyber-grafito px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyber-radar/10 dark:bg-cyber-radar/10">
          <Icon className="h-5 w-5 text-cyber-radar dark:text-cyber-radar-light" />
        </span>
        <span className="flex-1 text-left">{current.label}</span>
        <span className="text-xs text-slate-400 dark:text-slate-500">Cambiar icono</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-cyber-grafito shadow-xl">
          <div className="border-b border-slate-100 dark:border-white/5 p-2">
            <div className="relative">
              <HiOutlineSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar icono..."
                className="w-full rounded bg-slate-50 dark:bg-white/5 py-1.5 pl-8 pr-7 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <HiOutlineX className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto p-2">
            <div className="grid grid-cols-6 gap-1 sm:grid-cols-8">
              {filtered.map((item) => {
                const ItemIcon = item.icon;
                const isSelected = item.key === value;
                return (
                  <button
                    key={item.key}
                    type="button"
                    title={item.label}
                    onClick={() => { onChange(item.key); setOpen(false); setSearch(''); }}
                    className={`flex flex-col items-center gap-0.5 rounded p-2 transition-colors ${
                      isSelected
                        ? 'bg-cyber-radar/10 dark:bg-cyber-radar/10 text-cyber-radar dark:text-cyber-radar-light ring-1 ring-cyber-radar/30'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    <ItemIcon className="h-5 w-5" />
                    <span className="text-[9px] leading-tight text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <p className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">Sin resultados</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
