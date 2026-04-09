import { useState } from 'react';
import { importApi } from '../../../api/settings';
import { ApiError } from '../../../api/client';
import { FadeIn } from '../../../components/ui';

const MAX_IMPORT_SIZE = 5 * 1024 * 1024; // 5 MB

interface ImportTabProps {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function ImportTab({ onSuccess, onError }: ImportTabProps) {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFileError, setImportFileError] = useState('');

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (ext !== 'csv') { setImportFileError('Solo se permiten archivos .csv'); setImportFile(null); return; }
      if (file.size > MAX_IMPORT_SIZE) { setImportFileError(`El archivo excede el límite de ${MAX_IMPORT_SIZE / 1024 / 1024} MB.`); setImportFile(null); return; }
    }
    setImportFileError('');
    setImportFile(file);
  };

  const handleImport = async () => {
    if (!importFile) return;
    try {
      await importApi.importTasks(importFile);
      onSuccess('Importación completada exitosamente');
      setImportFile(null);
    } catch (err) {
      onError(err instanceof ApiError ? err.data.message : 'Error en la importación');
    }
  };

  return (
    <FadeIn className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Importar tareas desde CSV</h3>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        Sube un archivo CSV con columnas: titulo, descripcion, responsable_email, area, prioridad, estado, fecha_inicio, fecha_limite.
      </p>
      <div className="space-y-3">
        <input
          type="file"
          accept=".csv"
          onChange={handleImportFileChange}
          className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-cyber-radar/5 file:px-4 file:py-2 file:text-sm file:font-medium file:text-cyber-radar hover:file:bg-cyber-radar/10"
        />
        {importFileError && <p className="text-sm text-red-500 dark:text-red-400">{importFileError}</p>}
        <p className="text-xs text-slate-400 dark:text-slate-500">Máx. 5 MB. Solo archivos .csv</p>
        <button
          type="button"
          onClick={handleImport}
          disabled={!importFile}
          className="rounded-sm bg-cyber-radar px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50"
        >
          Importar
        </button>
      </div>
    </FadeIn>
  );
}
