import { ArrowRight } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../data/tribulumData';

interface HowItWorksStripProps {
  variant?: 'light' | 'dark';
}

export function HowItWorksStrip({ variant = 'dark' }: HowItWorksStripProps) {
  const isDark = variant === 'dark';

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800 md:grid-cols-4">
      {HOW_IT_WORKS_STEPS.map((step, index) => (
        <div
          key={step.number}
          className={`flex flex-col justify-between p-6 transition-colors duration-200 ${
            isDark
              ? 'bg-[#0B0B0C] text-zinc-100 hover:bg-[#121214]'
              : 'bg-[#0F0F10] text-zinc-100 hover:bg-[#161618]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs tracking-tight text-zinc-400 tabular-nums">
                {step.number}. {step.title}
              </span>
              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <ArrowRight
                  className="hidden h-3.5 w-3.5 text-zinc-600 md:block"
                  aria-hidden="true"
                />
              )}
            </div>
            <h3 className="mt-4 font-serif text-xl font-normal leading-snug text-white">
              {step.headline}
            </h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  );
}
