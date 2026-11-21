import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { isSupabaseConfigured, MISSING_SUPABASE_MESSAGE } from '../lib/supabase';

interface FormStatusBannerProps {
  status: 'idle' | 'submitting' | 'success' | 'error';
  message?: string | null;
  missingConfig?: boolean;
  successTitle?: string;
  hideMissingBanner?: boolean;
}

export function FormStatusBanner({
  status,
  message,
  missingConfig,
  successTitle = 'Request received',
  hideMissingBanner = false,
}: FormStatusBannerProps) {
  if (!isSupabaseConfigured && status === 'idle' && !hideMissingBanner) {
    return (
      <div
        role="note"
        className="flex items-start gap-3 rounded-lg border border-amber-700/60 bg-amber-950/50 px-4 py-3 text-sm text-amber-100"
      >
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <div>
          <p className="font-medium text-amber-200">
            Database setup required for live submissions
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-200/80">
            {MISSING_SUPABASE_MESSAGE}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success' && message) {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-lg border border-emerald-700/60 bg-emerald-950/50 px-4 py-3.5 text-sm text-emerald-100"
      >
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        <div>
          <p className="font-medium text-emerald-300">{successTitle}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-zinc-300">{message}</p>
        </div>
      </div>
    );
  }

  if (status === 'error' && message) {
    return (
      <div
        role="alert"
        className={`flex items-start gap-3 rounded-lg border px-4 py-3.5 text-sm ${
          missingConfig
            ? 'border-amber-700/60 bg-amber-950/50 text-amber-100'
            : 'border-red-800/70 bg-red-950/50 text-red-100'
        }`}
      >
        <AlertCircle
          className={`mt-0.5 h-4 w-4 shrink-0 ${
            missingConfig ? 'text-amber-400' : 'text-red-400'
          }`}
        />
        <div>
          <p className="font-medium">
            {missingConfig
              ? 'Supabase configuration missing'
              : 'Submission could not be completed'}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed opacity-90">{message}</p>
        </div>
      </div>
    );
  }

  return null;
}
