import { ShieldCheck, Cpu, GitFork } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Document Order Assistant
            </span>
            <span>•</span>
            <span>AI-Assisted Document Ordering with SOP Validation</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Zero Server Uploads</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Cpu className="h-4 w-4 text-indigo-600" />
              <span>Deterministic Rule Engine</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <GitFork className="h-4 w-4 text-amber-600" />
              <span>Extensible SOP Architecture</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
