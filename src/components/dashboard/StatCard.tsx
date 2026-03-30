import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

export function StatCard({ label, value, icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="group rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} transition-transform group-hover:scale-105`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}
