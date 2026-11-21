import { ArrowRight, Loader2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveAdvisorQuery } from '../lib/supabase';

const QUICK_PROMPTS = [
  'Which plan fits 5 acres of Alphonso mango?',
  'How do 8 NIR grain tests improve fertiliser blends?',
  'Explain Care vs Full Konkan FPO pricing.',
] as const;

interface GeminiAdvisorCardProps {
  onSaved?: () => void;
}

export function GeminiAdvisorCard({ onSaved }: GeminiAdvisorCardProps) {
  const { user, profile } = useAuth();

  const [language, setLanguage] = useState<'English' | 'Marathi' | 'Hindi'>(
    profile?.preferred_language || 'English'
  );
  const [crop, setCrop] = useState('');
  const [acres, setAcres] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const askAdvisor = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (trimmed.length < 3) {
      setError('Please enter a question (at least 3 characters).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedAcres = Number.parseFloat(acres);
      const res = await fetch('/api/crop-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          language,
          crop: crop.trim() || undefined,
          acres:
            Number.isFinite(parsedAcres) && parsedAcres > 0
              ? parsedAcres
              : undefined,
        }),
      });

      const data = (await res.json()) as {
        answer?: string;
        error?: string;
      };

      if (!res.ok || !data.answer) {
        setError(data.error || 'Could not reach Gemini 4 Hydrogen right now.');
        setLoading(false);
        return;
      }

      setAnswer(data.answer);

      if (user) {
        await saveAdvisorQuery({
          language,
          question: trimmed,
          answer: data.answer,
        });
        onSaved?.();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Network error contacting the crop advisor.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await askAdvisor(question);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-emerald-400">
            Crop &amp; Membership Advisor
          </p>
          <h2 className="mt-1 font-serif text-2xl font-normal text-white">
            Ask in English, Marathi, or Hindi
          </h2>
        </div>

        <div
          role="group"
          aria-label="Advisor response language"
          className="inline-flex rounded-lg border border-zinc-800 bg-black p-1"
        >
          {(['English', 'Marathi', 'Hindi'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`min-h-[34px] cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                language === lang
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-2 text-sm text-zinc-400">
        Get guidance on Watch, Scout, Care, Full-Care, Gaon packs, and NIR
        testing—{user ? 'your questions are saved to your Supabase account.' : 'sign in to save your history.'}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => {
              setQuestion(prompt);
              askAdvisor(prompt);
            }}
            className="min-h-[36px] cursor-pointer rounded-lg border border-zinc-800 bg-[#121214] px-3 py-1.5 text-left text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="advisor-crop"
              className="block text-xs font-medium text-zinc-400"
            >
              Crop (optional)
            </label>
            <input
              id="advisor-crop"
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="e.g. Paddy, Mango, Cashew"
              className="mt-1 min-h-[40px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="advisor-acres"
              className="block text-xs font-medium text-zinc-400"
            >
              Acreage (optional)
            </label>
            <input
              id="advisor-acres"
              type="number"
              min="0.5"
              step="0.5"
              value={acres}
              onChange={(e) => setAcres(e.target.value)}
              placeholder="e.g. 5"
              className="mt-1 min-h-[40px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3 py-1.5 font-mono text-sm text-white tabular-nums placeholder:font-sans placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="advisor-question"
            className="block text-xs font-medium text-zinc-400"
          >
            Your Question
          </label>
          <textarea
            id="advisor-question"
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about crop scan timing, FPO cluster rates, or NIR grain testing..."
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-[#1F6F50] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#185840] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </>
          ) : (
            <>
              <span>Ask Advisor</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-800/70 bg-red-950/50 px-4 py-3 text-xs leading-relaxed text-red-200"
        >
          {error}
        </div>
      )}

      {answer && (
        <div className="mt-5 rounded-xl border border-zinc-800 bg-black p-5">
          <p className="text-xs font-medium text-emerald-400">
            Recommendation ({language})
          </p>
          <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
}
