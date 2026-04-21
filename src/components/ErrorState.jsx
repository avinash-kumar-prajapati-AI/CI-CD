import { AlertTriangle } from 'lucide-react';

export function ErrorState({ title = 'Unable to load content', message, action }) {
  return (
    <div className="glass-card flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-rose-300" />
        <h3 className="theme-title font-display text-lg">{title}</h3>
      </div>
      <p className="theme-muted text-sm">{message || 'Please check your GitHub environment variables and token.'}</p>
      {action}
    </div>
  );
}
