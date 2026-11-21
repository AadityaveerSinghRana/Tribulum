import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { FormStatusBanner } from '../components/FormStatusBanner';
import { HowItWorksStrip } from '../components/HowItWorksStrip';
import {
  MEMBERSHIP_TIERS,
  TIER_DEMO_PRESETS,
  type TierSlug,
} from '../data/tribulumData';
import { submitEnrolment, validateIndianPhone } from '../lib/supabase';

interface TierDetailPageProps {
  tierSlug: TierSlug;
  onNavigate: (path: string) => void;
}

export function TierDetailPage({ tierSlug, onNavigate }: TierDetailPageProps) {
  const tier =
    MEMBERSHIP_TIERS.find((t) => t.slug === tierSlug) || MEMBERSHIP_TIERS[2];
  const tierDemo = TIER_DEMO_PRESETS[tier.slug];

  const [acres, setAcres] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [fpoName, setFpoName] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [missingConfig, setMissingConfig] = useState(false);

  const acresInputRef = useRef<HTMLInputElement | null>(null);
  const formSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setAcres('');
    setName('');
    setPhone('');
    setVillage('');
    setFpoName('');
    setStatus('idle');
    setStatusMessage(null);
    setMissingConfig(false);
    setOpenFaq(0);
  }, [tierSlug]);

  const scrollToEnrolForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => {
      acresInputRef.current?.focus();
    }, 300);
  };

  const handleFormTabFill = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Tab') {
      setAcres(tierDemo.acres);
      setName(tierDemo.name);
      setPhone(tierDemo.phone);
      setVillage(tierDemo.village);
      setFpoName(tierDemo.fpoName);
      setStatus('idle');
      setStatusMessage(null);
      setMissingConfig(false);
    }
  };

  const parsedAcres = Number.parseFloat(acres);
  const estimatedAnnual =
    Number.isFinite(parsedAcres) && parsedAcres > 0
      ? Math.round(parsedAcres * tier.pricePerAcre)
      : 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMissingConfig(false);

    if (
      acres !== tierDemo.acres ||
      name !== tierDemo.name ||
      phone !== tierDemo.phone ||
      village !== tierDemo.village ||
      fpoName !== tierDemo.fpoName
    ) {
      setAcres(tierDemo.acres);
      setName(tierDemo.name);
      setPhone(tierDemo.phone);
      setVillage(tierDemo.village);
      setFpoName(tierDemo.fpoName);
    }

    const cleanPhone = validateIndianPhone(tierDemo.phone) || tierDemo.phone;
    const demoAcres = Number.parseFloat(tierDemo.acres);

    setStatus('submitting');
    setStatusMessage(null);

    await submitEnrolment({
      tier: tier.slug,
      acres: demoAcres,
      name: tierDemo.name,
      phone: cleanPhone,
      village: tierDemo.village,
      fpo_name: tierDemo.fpoName,
      status: 'pending',
    });

    setStatus('success');
    setStatusMessage(
      `${tier.name} sign-in successful for ${tierDemo.name} (${demoAcres} acres, ${tierDemo.village} · ${tierDemo.fpoName}).`
    );
    setAcres('');
    setName('');
    setPhone('');
    setVillage('');
    setFpoName('');
  };

  return (
    <div className="bg-black pt-20 text-zinc-100">
      {/* Tier Header */}
      <section className="border-b border-zinc-800 bg-black py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-6">
            {MEMBERSHIP_TIERS.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => onNavigate(item.route)}
                className={`min-h-[38px] cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  item.slug === tier.slug
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {item.name} · {item.priceDisplay}
              </button>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 text-xs font-medium text-zinc-400">
                <span>Membership Tier</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{tier.scansLabel}</span>
                {tier.popular && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-emerald-400">Most popular</span>
                  </>
                )}
              </div>

              <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-white sm:text-5xl">
                {tier.name}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-300">
                {tier.heroSubheadline}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-4xl font-medium text-white tabular-nums">
                      {tier.priceDisplay}
                    </span>
                    <span className="text-sm text-zinc-400">
                      / acre / year (2 seasons)
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    Sold through FPOs. Sprays are a pass-through at the
                    partner&apos;s rate and are not bundled.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={scrollToEnrolForm}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-[#1F6F50] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#185840]"
                >
                  <span>Enrol</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Enrol Card */}
            <div
              ref={formSectionRef}
              id="enrol-form"
              className="rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-6 sm:p-8 lg:col-span-5"
            >
              <h2 className="font-serif text-2xl font-normal text-white">
                Enrol in {tier.name}
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Select any field and press <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-zinc-200">Tab</kbd> to auto-fill.
              </p>

              <form
                onSubmit={handleSubmit}
                onKeyDown={handleFormTabFill}
                className="mt-6 space-y-4"
                noValidate
              >
                <FormStatusBanner
                  status={status}
                  message={statusMessage}
                  missingConfig={missingConfig}
                  successTitle={`${tier.name} sign-in successful`}
                  hideMissingBanner
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="enrol-acres"
                      className="block text-xs font-medium text-zinc-300"
                    >
                      Acreage (acres) *
                    </label>
                    <input
                      ref={acresInputRef}
                      id="enrol-acres"
                      type="text"
                      readOnly
                      value={acres}
                      placeholder="Press Tab to auto-fill"
                      required
                      className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 font-mono text-sm text-white tabular-nums placeholder:font-sans placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div className="flex flex-col justify-end rounded-lg border border-zinc-800 bg-[#121214] px-3.5 py-2">
                    <span className="text-xs text-zinc-400">Estimated annual</span>
                    <span className="font-mono text-base font-medium text-white tabular-nums">
                      ₹{estimatedAnnual.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="enrol-name"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Farmer / Member Name *
                  </label>
                  <input
                    id="enrol-name"
                    type="text"
                    readOnly
                    value={name}
                    placeholder="Press Tab to auto-fill"
                    required
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="enrol-phone"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    id="enrol-phone"
                    type="tel"
                    readOnly
                    value={phone}
                    placeholder="Press Tab to auto-fill"
                    required
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 font-mono text-sm text-white placeholder:font-sans placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="enrol-village"
                      className="block text-xs font-medium text-zinc-300"
                    >
                      Village *
                    </label>
                    <input
                      id="enrol-village"
                      type="text"
                      readOnly
                      value={village}
                      placeholder="Press Tab to auto-fill"
                      required
                      className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="enrol-fpo"
                      className="block text-xs font-medium text-zinc-300"
                    >
                      FPO Name *
                    </label>
                    <input
                      id="enrol-fpo"
                      type="text"
                      readOnly
                      value={fpoName}
                      placeholder="Press Tab to auto-fill"
                      required
                      className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="min-h-[44px] w-full cursor-pointer rounded-lg bg-[#1F6F50] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#185840] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'submitting' ? 'Submitting enrolment...' : `Enrol in ${tier.name}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included & Who It's For */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-8">
            <h2 className="font-serif text-2xl font-normal text-white">
              What&apos;s included
            </h2>
            <ul className="mt-6 space-y-4">
              {tier.includes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-zinc-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-8">
            <h2 className="font-serif text-2xl font-normal text-white">
              Who it&apos;s for
            </h2>
            <ul className="mt-6 space-y-4">
              {tier.whoItIsFor.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-zinc-300">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Strip */}
      <section className="border-y border-zinc-800 bg-black py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-xs font-medium text-zinc-400">How {tier.name} works</p>
            <h2 className="mt-1 font-serif text-3xl font-normal text-white">
              Scan → Alert → Action → Record
            </h2>
          </div>
          <HowItWorksStrip variant="dark" />
        </div>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl font-normal text-white">
          Frequently asked questions
        </h2>
        <div className="mt-8 divide-y divide-zinc-800 border-y border-zinc-800">
          {tier.faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={faq.question} className="py-4">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-4 text-left text-base font-medium text-white"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-150 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-2 pb-2 text-sm leading-relaxed text-zinc-400">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
